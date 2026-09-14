# -*- coding: utf-8 -*-
# Fluxo do cliente de ponta a ponta: senha errada, senha certa, volta
# automática, e o que acontece quando a API ainda não foi ligada.
# Serve o site de verdade num http.server e finge só a rota /api/portal/entrar.
import json, threading, http.server, socketserver, os
from playwright.sync_api import sync_playwright

RAIZ = '/home/user/agencia-hub'
SAIDA = '/tmp/claude-0/-home-user-wifi-vaquejada/932f984e-a499-598d-a64a-4d1d7c73965a/scratchpad'
DADOS_CLIENTE = {'agencia': {'nome': 'Agência Cavalcante'},
                 'cliente': {'nome': 'Haras Boa Vista'},
                 'projetos': [], 'postagens': [], 'aprovacoes': [], 'leads': []}
modo = {'v': 'normal'}   # normal | naoconfig

class H(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if not self.path.startswith('/api/portal/entrar'):
            self.send_error(404); return
        n = int(self.headers.get('content-length', 0))
        corpo = json.loads(self.rfile.read(n) or b'{}')
        if modo['v'] == 'naoconfig':
            st, resp = 503, {'erro': 'O login por e-mail ainda não foi ligado nesta conta.', 'codigo': 'NAO_CONFIGURADO'}
        elif corpo.get('token') == 'token-bom':
            st, resp = 200, {'token': 'token-bom', 'nome': 'Haras Boa Vista', 'dados': DADOS_CLIENTE}
        elif corpo.get('email', '').lower() == 'joao@gmail.com' and corpo.get('senha') == 'segredo123':
            st, resp = 200, {'token': 'token-bom', 'nome': 'Haras Boa Vista', 'dados': DADOS_CLIENTE}
        elif corpo.get('token'):
            st, resp = 401, {'erro': 'Sessão expirada. Entre de novo.'}
        else:
            st, resp = 401, {'erro': 'E-mail ou senha não conferem.'}
        b = json.dumps(resp).encode()
        self.send_response(st); self.send_header('content-type', 'application/json')
        self.send_header('content-length', str(len(b))); self.end_headers(); self.wfile.write(b)
    def log_message(self, *a): pass

os.chdir(RAIZ)
# ThreadingTCPServer, nao TCPServer: o Chromium abandona conexao no meio da resposta
# ao navegar, e o servidor single-thread nao sobrevive ao BrokenPipeError — o proximo
# contexto entao estoura em Page.goto. daemon_threads evita processo pendurado.
socketserver.ThreadingTCPServer.allow_reuse_address = True
socketserver.ThreadingTCPServer.daemon_threads = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 8123), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:8123'

falhas = []
def ok(n): print('OK ' + n)
def falha(n, d=''): falhas.append(n); print('FALHA ' + n + ((': ' + d) if d else ''))

with sync_playwright() as p:
    nav = p.chromium.launch(headless=True, executable_path='/opt/pw-browsers/chromium')

    # ---- 1) tem os campos certos ----
    ctx = nav.new_context(viewport={'width': 1200, 'height': 900}); pg = ctx.new_page()
    erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto(BASE + '/portal/'); pg.wait_for_timeout(900)
    campos = pg.evaluate("[...document.querySelectorAll('input')].map(i=>i.id+':'+i.type)")
    if 'campo-email:email' in campos and 'campo-senha:password' in campos:
        ok('tela tem e-mail e senha (%s)' % ', '.join(campos))
    else:
        falha('campos do login', str(campos))
    pg.screenshot(path=SAIDA + '/login-portal.png')

    # ---- 2) mostrar/esconder senha ----
    pg.fill('#campo-senha', 'minhasenha')
    pg.click('#btn-ver'); pg.wait_for_timeout(200)
    if pg.evaluate("document.getElementById('campo-senha').type") == 'text':
        ok('botão de mostrar a senha funciona')
    else:
        falha('mostrar senha')
    pg.click('#btn-ver')

    # ---- 3) senha errada ----
    pg.fill('#campo-email', 'joao@gmail.com'); pg.fill('#campo-senha', 'errada')
    pg.click('#btn-entrar'); pg.wait_for_timeout(900)
    txt = pg.evaluate("document.getElementById('erro').textContent")
    if 'não conferem' in txt and '/portal/' in pg.url:
        ok('senha errada mostra o aviso e não navega')
    else:
        falha('senha errada', txt[:60] + ' | ' + pg.url)

    # ---- 4) senha certa abre o portal do cliente ----
    pg.fill('#campo-senha', 'segredo123')
    pg.click('#btn-entrar'); pg.wait_for_timeout(2500)
    est = pg.evaluate("""() => {
      const app = document.querySelector('.app');
      const sb = document.querySelector('#sidebar');
      const r = sb ? sb.getBoundingClientRect() : null;
      return { url: location.pathname + location.hash,
               portal: !!document.querySelector('.portal') && !!document.querySelector('#portal-conteudo'),
               appVisivel: app ? getComputedStyle(app).display !== 'none' : false,
               sidebarVisivel: !!(r && r.width > 0 && r.height > 0),
               navAgencia: document.querySelectorAll('.nav-item').length,
               semDadosNaUrl: location.hash === '#/p?sessao' };
    }""")
    if est['portal'] and not est['appVisivel'] and not est['sidebarVisivel'] and est['navAgencia'] == 0:
        ok('senha certa abre o portal SEM o painel da agência')
    else:
        falha('isolamento após login', str(est))
    if est['semDadosNaUrl']:
        ok('os dados do cliente não vão na URL (%s)' % est['url'])
    else:
        falha('dados na URL', est['url'])
    pg.screenshot(path=SAIDA + '/portal-apos-login.png')

    # ---- 5) volta automática no mesmo aparelho ----
    pg.goto(BASE + '/portal/'); pg.wait_for_timeout(2500)
    if '#/p?sessao' in pg.url:
        ok('segundo acesso entra sozinho, sem pedir senha de novo')
    else:
        falha('volta automática', pg.url)

    # ---- 6) API ainda não ligada -> oferece o caminho do link ----
    modo['v'] = 'naoconfig'
    ctx2 = nav.new_context(viewport={'width': 1200, 'height': 900}); pg2 = ctx2.new_page()
    pg2.goto(BASE + '/portal/'); pg2.wait_for_timeout(800)
    pg2.fill('#campo-email', 'joao@gmail.com'); pg2.fill('#campo-senha', 'segredo123')
    pg2.click('#btn-entrar'); pg2.wait_for_timeout(1200)
    vis = pg2.evaluate("document.getElementById('bloco-link').classList.contains('mostrar')")
    txt2 = pg2.evaluate("document.getElementById('erro').textContent")
    if vis and 'ainda não foi ativado' in txt2:
        ok('sem a API ligada, explica e oferece o link exclusivo')
    else:
        falha('modo não configurado', txt2[:70])

    if erros: falha('erros JS', ' | '.join(erros[:2]))
    else: ok('sem erros de JS no fluxo')
    nav.close()

srv.shutdown()
print()
if falhas:
    print('TOTAL: %d falha(s)' % len(falhas)); raise SystemExit(1)
print('TOTAL: login do portal verificado')

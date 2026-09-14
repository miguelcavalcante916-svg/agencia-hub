# -*- coding: utf-8 -*-
# A trava do painel em todos os cenários — o mais importante é NUNCA trancar
# o dono para fora por causa de servidor fora do ar ou config faltando.
import json, threading, http.server, socketserver, os
from playwright.sync_api import sync_playwright

RAIZ='/home/user/agencia-hub'
SAIDA='/tmp/claude-0/-home-user-wifi-vaquejada/932f984e-a499-598d-a64a-4d1d7c73965a/scratchpad'
modo={'v':'com-senha'}   # com-senha | sem-senha | naoconfig | fora

class H(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if not self.path.startswith('/api/agencia/entrar'):
            self.send_error(404); return
        n=int(self.headers.get('content-length',0))
        c=json.loads(self.rfile.read(n) or b'{}')
        m=modo['v']
        if m=='naoconfig': st,r=503,{'erro':'Trava do painel ainda não configurada.','codigo':'NAO_CONFIGURADO'}
        elif m=='sem-senha': st,r=200,{'token':'tok','semSenha':True}
        elif c.get('token')=='tok': st,r=200,{'token':'tok'}
        elif c.get('senha')=='minhasenha123': st,r=200,{'token':'tok'}
        elif c.get('senha'): st,r=401,{'erro':'Senha incorreta.'}
        else: st,r=401,{'erro':'Senha exigida.'}
        b=json.dumps(r).encode()
        self.send_response(st); self.send_header('content-type','application/json')
        self.send_header('content-length',str(len(b))); self.end_headers(); self.wfile.write(b)
    def log_message(self,*a): pass

os.chdir(RAIZ)
# ThreadingTCPServer: ver comentario em teste_login.py
socketserver.ThreadingTCPServer.allow_reuse_address=True
socketserver.ThreadingTCPServer.daemon_threads=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',8144),H)
threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE='http://127.0.0.1:8144'

falhas=[]
def ok(n): print('OK '+n)
def falha(n,d=''): falhas.append(n); print('FALHA '+n+((': '+d) if d else ''))

def estado(pg):
    return pg.evaluate("""() => {
      const t=document.getElementById('trava'), a=document.getElementById('app');
      return { travaVisivel: t && !t.hidden,
               appVisivel: a ? getComputedStyle(a).visibility !== 'hidden' : false,
               aviso: window.AH && AH.avisoPainel || '' };
    }""")

with sync_playwright() as p:
    nav=p.chromium.launch(headless=True,executable_path='/opt/pw-browsers/chromium')

    # 1) com senha: tranca, recusa a errada, aceita a certa, e lembra
    modo['v']='com-senha'
    ctx=nav.new_context(viewport={'width':1200,'height':860}); pg=ctx.new_page()
    er=[]; pg.on('pageerror',lambda e:er.append(str(e)))
    pg.goto(BASE+'/app/'); pg.wait_for_timeout(1400)
    e=estado(pg)
    if e['travaVisivel'] and not e['appVisivel']: ok('com senha definida, o painel fica coberto')
    else: falha('trava não cobriu', str(e))
    pg.screenshot(path=SAIDA+'/trava.png')

    pg.fill('#trava-senha','chute'); pg.click('#trava-btn'); pg.wait_for_timeout(700)
    if 'incorreta' in pg.evaluate("document.getElementById('trava-erro').textContent"): ok('senha errada é recusada')
    else: falha('senha errada')

    pg.fill('#trava-senha','minhasenha123'); pg.click('#trava-btn'); pg.wait_for_timeout(900)
    e=estado(pg)
    if not e['travaVisivel'] and e['appVisivel']: ok('senha certa libera o painel')
    else: falha('senha certa não liberou', str(e))

    pg.goto(BASE+'/app/'); pg.wait_for_timeout(1400)
    e=estado(pg)
    if not e['travaVisivel']: ok('segundo acesso no mesmo aparelho não pede de novo')
    else: falha('não lembrou do acesso')
    ctx.close()

    # 2) API FORA DO AR (a página carrega, só a chamada falha): tem que ABRIR
    ctx=nav.new_context(viewport={'width':1200,'height':860}); pg=ctx.new_page()
    pg.route('**/api/agencia/entrar', lambda r, req: r.abort('failed'))
    pg.goto(BASE+'/app/'); pg.wait_for_timeout(2000)
    e=estado(pg)
    if e['appVisivel'] and not e['travaVisivel'] and 'servidor' in e['aviso'].lower():
        ok('API fora do ar: ENTRA mesmo assim, com aviso')
    else:
        falha('trancou com a API fora', str(e))
    ctx.close()

    # 3) banco não configurado: abre com aviso
    modo['v']='naoconfig'
    ctx=nav.new_context(viewport={'width':1200,'height':860}); pg=ctx.new_page()
    pg.goto(BASE+'/app/'); pg.wait_for_timeout(1500)
    e=estado(pg)
    if e['appVisivel'] and not e['travaVisivel'] and 'Vercel' in e['aviso']:
        ok('sem configuração: entra e avisa que o painel está aberto')
    else: falha('modo não configurado', str(e))
    ctx.close()

    # 4) senha nunca definida: entra e avisa para definir
    modo['v']='sem-senha'
    ctx=nav.new_context(viewport={'width':1200,'height':860}); pg=ctx.new_page()
    pg.goto(BASE+'/app/'); pg.wait_for_timeout(1500)
    e=estado(pg)
    if e['appVisivel'] and 'SEM SENHA' in e['aviso']: ok('sem senha definida: entra e manda definir uma')
    else: falha('estado sem senha', str(e))
    ctx.close()

    # 5) o portal do cliente NÃO pode passar pela trava da agência
    modo['v']='com-senha'
    ctx=nav.new_context(viewport={'width':1200,'height':860}); pg=ctx.new_page()
    pg.goto(BASE+'/app/index.html#/p?d=invalido'); pg.wait_for_timeout(1500)
    if not pg.evaluate("!document.getElementById('trava').hidden"):
        ok('portal do cliente não esbarra na trava da agência')
    else: falha('trava apareceu no portal do cliente')
    if er: falha('erros JS', ' | '.join(er[:2]))
    else: ok('sem erros de JS')
    nav.close()
srv.shutdown()
print()
if falhas: print('TOTAL: %d falha(s)'%len(falhas)); raise SystemExit(1)
print('TOTAL: trava do painel verificada')

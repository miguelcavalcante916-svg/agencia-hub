# -*- coding: utf-8 -*-
# Entrada do Portal do Cliente + escada de credibilidade dos trabalhos.
from playwright.sync_api import sync_playwright
import json

falhas = []
def ok(n): print('OK ' + n)
def falha(n, d=''): falhas.append(n); print('FALHA ' + n + ((': ' + d) if d else ''))

with sync_playwright() as p:
    nav = p.chromium.launch(headless=True, executable_path='/opt/pw-browsers/chromium')

    # ---------- 1) nenhum link público leva ao painel da agência ----------
    pg = nav.new_page(viewport={'width': 1380, 'height': 900})
    pg.goto('file:///home/user/agencia-hub/index.html'); pg.wait_for_timeout(1500)
    vaza = pg.evaluate("""() =>
      Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.getAttribute('href'))
        .filter(h => h === 'app/' || h === '/app/' || h === 'app/index.html')""")
    if not vaza:
        ok('nenhum link público leva ao painel da agência')
    else:
        falha('painel da agência exposto no site', str(vaza))

    ja = pg.evaluate("""() => {
      const a = document.querySelector('a.entrar');
      return a ? a.getAttribute('href') : null; }""")
    if ja == 'portal/':
        ok('"Já sou cliente" vai para a entrada do portal')
    else:
        falha('destino de "Já sou cliente"', str(ja))
    pg.close()

    # ---------- 2) escada de credibilidade dos trabalhos ----------
    CASOS = [('vazio', [], 1), ('um', [{'url': 'https://instagram.com/reel/A', 'titulo': 'X'}], 2),
             ('quatro', [{'url': 'https://instagram.com/reel/%s' % c, 'titulo': c} for c in 'ABCD'], 4)]
    for nome, itens, esperado in CASOS:
        pg = nav.new_page(viewport={'width': 1380, 'height': 900})
        def responder(route, request, corpo=json.dumps({'itens': itens})):
            route.fulfill(status=200, content_type='application/json', body=corpo)
        pg.route('**/portfolio.json', responder)
        pg.goto('file:///home/user/agencia-hub/index.html'); pg.wait_for_timeout(1800)
        r = pg.evaluate("""() => {
          const sec = document.querySelector('#portfolio');
          const menu = document.querySelector('nav.principal a[href="#portfolio"]');
          return { secao: getComputedStyle(sec).display,
                   menu: menu ? getComputedStyle(menu).display : 'ausente',
                   cartoes: document.querySelectorAll('#portfolio-grade > *').length,
                   externos: document.querySelectorAll('script[src]').length,
                   texto: document.querySelector('#portfolio').innerText.slice(0, 60) };
        }""")
        bem = r['secao'] != 'none' and r['menu'] != 'none' and r['cartoes'] == esperado and r['externos'] == 0
        if bem:
            ok('trabalhos com %-6s itens: seção de pé, %d cartão(ões), 0 script externo' % (nome, r['cartoes']))
        else:
            falha('escada de trabalhos (%s)' % nome, str(r))
        pg.close()

    # ---------- 3) entrada do portal: recusa link errado, aceita o certo, lembra ----------
    ctx = nav.new_context(viewport={'width': 1200, 'height': 860})
    pg = ctx.new_page()
    erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto('file:///home/user/agencia-hub/app/index.html#/portal'); pg.wait_for_timeout(1800)
    link = pg.evaluate("""async () => {
      const c = (AH.state.clientes || [])[0];
      return await AH.codificarPortal({ marca: AH.state.configuracoes, cliente: c,
        projetos: AH.state.projetos.slice(0, 3), postagens: [], aprovacoes: [], leads: [] });
    }""")

    pg.goto('file:///home/user/agencia-hub/portal/index.html'); pg.wait_for_timeout(800)
    # O portal foi REESCRITO para e-mail + senha. O caminho do link virou alternativa:
    # #bloco-link nasce display:none e quem o revela e o botao #btn-alternar; quem envia
    # e o #btn-link (ou Enter no campo) — NAO mais o button[type=submit], que hoje e o
    # form de e-mail e senha. O teste abaixo passa a dirigir o produto como um usuario.
    pg.click('#btn-alternar'); pg.wait_for_timeout(200)
    pg.fill('#campo-link', 'https://site-qualquer.com/nada')
    pg.click('#btn-link'); pg.wait_for_timeout(400)
    if pg.evaluate("!document.getElementById('erro').hidden") and '/portal/' in pg.url:
        ok('entrada do portal recusa link inválido e não navega')
    else:
        falha('validação do link do portal')

    pg.fill('#campo-link', 'https://agenciacavalcante.com/app/#/p?d=' + link)
    pg.click('#btn-link'); pg.wait_for_timeout(2600)
    # o shell da agência continua no DOM, mas tem que estar INVISÍVEL
    # (body.modo-portal .app { display:none }) — medir visibilidade, não presença
    est = pg.evaluate("""() => {
      const app = document.querySelector('.app');
      const sb = document.querySelector('#sidebar');
      const r = sb ? sb.getBoundingClientRect() : null;
      return {
        portal: !!document.querySelector('.portal') && !!document.querySelector('#portal-conteudo'),
        navAgencia: document.querySelectorAll('.nav-item').length,
        appVisivel: app ? getComputedStyle(app).display !== 'none' : false,
        sidebarVisivel: !!(r && r.width > 0 && r.height > 0),
      };
    }""")
    if est['portal'] and est['navAgencia'] == 0 and not est['appVisivel'] and not est['sidebarVisivel']:
        ok('link válido abre o portal do cliente SEM o painel da agência')
    else:
        falha('isolamento do portal', str(est))

    pg.goto('file:///home/user/agencia-hub/portal/index.html'); pg.wait_for_timeout(2400)
    if pg.evaluate("location.hash").startswith('#/p?d='):
        ok('segundo acesso entra direto (o aparelho lembra do link)')
    else:
        falha('memória do acesso', pg.evaluate("location.href")[-40:])

    if erros:
        falha('erros JS no fluxo do portal', ' | '.join(erros[:2]))
    else:
        ok('sem erros JS no fluxo do portal')
    nav.close()

print()
if falhas:
    print('TOTAL: %d falha(s)' % len(falhas)); raise SystemExit(1)
print('TOTAL: portal e trabalhos verificados')

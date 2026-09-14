# -*- coding: utf-8 -*-
# Sobe o repositório com EXATAMENTE os cabeçalhos do vercel.json e verifica
# se o site e o app funcionam sem nenhuma violação de CSP.
import json, threading, functools, http.server, socketserver, os
from playwright.sync_api import sync_playwright

RAIZ = '/home/user/agencia-hub'
cfg = json.load(open(os.path.join(RAIZ, 'vercel.json')))

def cabecalhos_para(caminho):
    import re
    saida = []
    for regra in cfg['headers']:
        padrao = '^' + regra['source'].replace('/(.*)', '/(.*)') + '$'
        if re.match(padrao, caminho):
            saida += [(h['key'], h['value']) for h in regra['headers']]
    return saida

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        for k, v in cabecalhos_para(self.path.split('?')[0]):
            # HSTS em http local não faz sentido e atrapalha o teste
            if k == 'Strict-Transport-Security':
                continue
            self.send_header(k, v)
        super().end_headers()
    def log_message(self, *a): pass

os.chdir(RAIZ)
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 8099), Handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()

violacoes = []
outros = []
with sync_playwright() as p:
    nav = p.chromium.launch(headless=True, executable_path='/opt/pw-browsers/chromium')
    ctx = nav.new_context(viewport={'width': 1380, 'height': 900})
    pg = ctx.new_page()

    def ouvir(msg):
        t = msg.text
        if 'Content Security Policy' in t or 'Refused to' in t:
            violacoes.append(t)
        elif msg.type == 'error' and 'ERR_' not in t and 'Failed to load resource' not in t:
            outros.append(t)
    pg.on('console', ouvir)
    pg.on('pageerror', lambda e: outros.append('pageerror: ' + str(e)))

    for rota, espera in [('/', 2200), ('/app/', 2500), ('/app/#/assistente', 900), ('/app/#/clientes', 900)]:
        pg.goto('http://127.0.0.1:8099' + rota)
        pg.wait_for_timeout(espera)
        print('carregou %-22s | %s' % (rota, pg.title()[:48]))

    # o site precisa continuar pintando: herói visível e shader ativo
    ok_site = pg.evaluate("1")
    pg.goto('http://127.0.0.1:8099/')
    pg.wait_for_timeout(2200)
    estado = pg.evaluate("""() => ({
      h1: getComputedStyle(document.querySelector('.hero h1')).opacity,
      canvas: !!document.querySelector('canvas'),
      fundo: getComputedStyle(document.body).backgroundColor
    })""")
    print('site:', estado)

    pg.goto('http://127.0.0.1:8099/app/')
    pg.wait_for_timeout(2000)
    estado_app = pg.evaluate("""() => ({
      view: !!document.querySelector('#view') && document.querySelector('#view').children.length > 0,
      sidebar: !!document.querySelector('.brand-logo')
    })""")
    print('app: ', estado_app)
    nav.close()

srv.shutdown()
print()
if violacoes:
    print('VIOLACOES DE CSP (%d):' % len(violacoes))
    for v in dict.fromkeys(violacoes):
        print('  -', v[:200])
    raise SystemExit(1)
print('nenhuma violacao de CSP')
if outros:
    print('outros erros de console:')
    for o in dict.fromkeys(outros): print('  -', o[:160])

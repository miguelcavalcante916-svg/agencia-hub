# -*- coding: utf-8 -*-
# Lexend é mais larga que a Instrument Sans: confere se nada estoura no celular.
from playwright.sync_api import sync_playwright
import base64, os
F = os.path.abspath('fontes')
def face(nome, arq):
    b64 = base64.b64encode(open(arq,'rb').read()).decode()
    return ("@font-face{font-family:'%s';font-weight:100 900;font-display:block;"
            "src:url(data:font/woff2;base64,%s) format('woff2-variations')}") % (nome, b64)
CSS = (face('Urbanist', f'{F}/fontsource-variable-urbanist/files/urbanist-latin-wght-normal.woff2') +
       face('Lexend',   f'{F}/fontsource-variable-lexend/files/lexend-latin-wght-normal.woff2'))

falhas = []
with sync_playwright() as p:
    nav = p.chromium.launch(headless=True, executable_path='/opt/pw-browsers/chromium')
    for nome, url, larguras in [
        ('site', 'file:///home/user/agencia-hub/index.html', [320, 390, 768, 1380]),
        ('app',  'file:///home/user/agencia-hub/app/index.html', [320, 390, 768, 1380]),
    ]:
        for w in larguras:
            pg = nav.new_page(viewport={'width': w, 'height': 844})
            pg.goto(url)
            pg.add_style_tag(content=CSS)
            pg.wait_for_timeout(1800)
            extra = pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
            fam = pg.evaluate("getComputedStyle(document.body).fontFamily.split(',')[0]")
            marca = 'ok ' if extra <= 1 else 'ESTOURO'
            print('%s %-5s %4dpx | sobra horizontal: %3dpx | corpo: %s' % (marca, nome, w, extra, fam))
            if extra > 1:
                # descobre o culpado
                culpados = pg.evaluate("""() => {
                  const lim = document.documentElement.clientWidth;
                  return [...document.querySelectorAll('*')]
                    .filter(e => e.getBoundingClientRect().right > lim + 1)
                    .slice(0, 5)
                    .map(e => e.tagName + '.' + (e.className||'').toString().slice(0,40) + ' -> ' + Math.round(e.getBoundingClientRect().right));
                }""")
                falhas.append('%s %dpx: %s' % (nome, w, culpados))
            pg.close()
    nav.close()
print()
if falhas:
    for f in falhas: print(f)
    raise SystemExit(1)
print('nenhum estouro horizontal com as fontes novas')

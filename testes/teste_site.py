# -*- coding: utf-8 -*-
# Verificação do site após as melhorias das skills (fix comMotion)
from playwright.sync_api import sync_playwright

URL = 'file:///home/user/agencia-hub/index.html'
falhas = []

def ok(nome):
    print('OK ' + nome)

def falha(nome, detalhe=''):
    falhas.append(nome + (': ' + detalhe if detalhe else ''))
    print('FALHA ' + nome + (': ' + detalhe if detalhe else ''))

with sync_playwright() as p:
    nav = p.chromium.launch(headless=True, executable_path='/opt/pw-browsers/chromium')
    pg = nav.new_page(viewport={'width': 1380, 'height': 900})
    erros_js = []
    pg.on('pageerror', lambda e: erros_js.append(str(e)))
    pg.goto(URL)
    pg.wait_for_timeout(2200)  # espera orquestração do herói terminar (springs ~0.8s + delay 0.36s)

    # 0) sem erros de JS
    if erros_js:
        falha('sem erros JS', ' | '.join(erros_js[:3]))
    else:
        ok('sem erros JS')

    # 1) nenhuma biblioteca de animação: tudo em CSS/rAF nativos
    sem_lib = pg.evaluate("typeof window.Motion === 'undefined'")
    peso = pg.evaluate("document.querySelectorAll('script[src]').length")
    if sem_lib and peso == 0:
        ok('sem biblioteca de animação (0 scripts externos)')
    else:
        falha('biblioteca de animação', 'Motion=%s scripts=%s' % (not sem_lib, peso))

    # 2) entrada orquestrada: Motion setou opacity inline e terminou em 1
    orq = pg.evaluate("""() => {
      const alvos = ['.hero .selo', '.hero h1', '.hero .sub', '.hero-ctas', '.hero-nota', '.hero-painel .moldura'];
      return alvos.map(sel => {
        const el = document.querySelector(sel);
        if (!el) return {sel, existe: false};
        const inline = el.style.animation;            // a animação é escrita inline, com o atraso de cada um
        const comp = getComputedStyle(el).opacity;
        return {sel, existe: true, inline, comp};
      });
    }""")
    rodou = all(x['existe'] and 'heroi-entrar' in x['inline'] and abs(float(x['comp']) - 1) < 0.02 for x in orq)
    if rodou:
        ok('entrada do herói escalonada em 6 elementos, todos visíveis')
    else:
        falha('entrada orquestrada', str(orq))

    # 3) o efeito magnético FOI REMOVIDO: ele escrevia transform inline no botão,
    #    e estilo inline vence regra de autor — .btn:active nunca disparava.
    #    Agora o CTA principal responde à pressão do dedo.
    caixa = pg.locator('.hero .hero-ctas .btn-azul').bounding_box()
    cx, cy = caixa['x'] + caixa['width'] / 2, caixa['y'] + caixa['height'] / 2
    pg.mouse.move(cx + 60, cy + 15)
    pg.wait_for_timeout(400)
    tf = pg.evaluate("getComputedStyle(document.querySelector('.hero .hero-ctas .btn-azul')).transform")
    inline = pg.evaluate("document.querySelector('.hero .hero-ctas .btn-azul').style.transform")
    if inline == '' and (tf == 'none' or 'matrix' in tf):
        ok('CTA sem transform inline (a pressão do :active volta a funcionar)')
    else:
        falha('transform inline no CTA', 'inline=%r comp=%s' % (inline, tf))

    pg.mouse.down()
    pg.wait_for_timeout(160)
    tf_press = pg.evaluate("getComputedStyle(document.querySelector('.hero .hero-ctas .btn-azul')).transform")
    pg.mouse.up()
    encolheu = tf_press.startswith('matrix(') and float(tf_press[7:-1].split(',')[0]) < 0.995
    if encolheu:
        ok('CTA encolhe ao ser pressionado (%s)' % tf_press)
    else:
        falha('pressão no CTA', tf_press)

    # 4) acessibilidade: skip link, FAQ aria, menu aria
    a11y = pg.evaluate("""() => {
      const pular = document.querySelector('a.pular');
      const faq = document.querySelector('.faq-perg');
      const menu = document.querySelector('.btn-menu');
      return {
        pular: !!pular && (pular.getAttribute('href') || '').startsWith('#'),
        faqExp: !!faq && faq.hasAttribute('aria-expanded') && faq.hasAttribute('aria-controls'),
        menuExp: !!menu && menu.hasAttribute('aria-expanded')
      };
    }""")
    if a11y['pular'] and a11y['faqExp'] and a11y['menuExp']:
        ok('acessibilidade (skip link + aria-expanded FAQ/menu)')
    else:
        falha('acessibilidade', str(a11y))

    # FAQ: o segundo item começa fechado; clicar abre e fecha o primeiro
    pg.locator('.faq-perg').nth(1).click()
    exp = pg.locator('.faq-perg').nth(1).get_attribute('aria-expanded')
    exp0 = pg.locator('.faq-perg').nth(0).get_attribute('aria-expanded')
    if exp == 'true' and exp0 == 'false':
        ok('FAQ abre, fecha o anterior e atualiza aria-expanded')
    else:
        falha('FAQ aria-expanded', 'clicado=%s primeiro=%s' % (exp, exp0))

    # 5) scrollspy: rolar até uma seção do menu marca o link como ativo
    pg.evaluate("document.querySelector('#pacotes').scrollIntoView()")
    # o scrollspy só troca quando o scroll suave assenta dentro da faixa do
    # observer; esperar a condição em vez de um tempo fixo
    try:
        pg.wait_for_function(
            "() => { const a = document.querySelector('nav.principal a.ativa');"
            " return a && a.getAttribute('href') === '#pacotes'; }", timeout=6000)
    except Exception:
        pass
    ativa = pg.evaluate("""() => {
      const a = document.querySelector('nav.principal a.ativa');
      return a ? a.getAttribute('href') : null;
    }""")
    if ativa == '#pacotes':
        ok('scrollspy marca o link ativo (#pacotes)')
    else:
        falha('scrollspy', str(ativa))

    # 5b) scroll-padding: âncora não esconde a seção sob o header fixo
    spt = pg.evaluate("getComputedStyle(document.documentElement).scrollPaddingTop")
    if spt == '86px':
        ok('scroll-padding-top 86px (âncoras respeitam o header)')
    else:
        falha('scroll-padding-top', str(spt))

    # 5c) cascata: filhos da grade de serviços têm delays crescentes e terminam visíveis
    pg.evaluate("document.querySelector('.servicos-grade').scrollIntoView({block:'center'})")
    # o scroll é suave e o observer só dispara quando chega: esperar a condição,
    # não um tempo fixo (era isso que fazia o teste medir a animação pela metade)
    pg.wait_for_function(
        "() => { const g = document.querySelector('.servicos-grade');"
        " return g.classList.contains('visivel') &&"
        " [...g.children].every(c => parseFloat(getComputedStyle(c).opacity) > 0.98); }",
        timeout=6000)
    casc = pg.evaluate("""() => {
      const g = document.querySelector('.servicos-grade');
      return {
        visivel: g.classList.contains('visivel'),
        delays: Array.from(g.children).map(c => c.style.animationDelay),
        opacidades: Array.from(g.children).map(c => getComputedStyle(c).opacity)
      };
    }""")
    delays_ok = casc['delays'] == ['0ms', '30ms', '60ms', '90ms']
    op_ok = all(abs(float(o) - 1) < .02 for o in casc['opacidades'])
    if casc['visivel'] and delays_ok and op_ok:
        ok('cascata diagonal da grade de serviços (delays 0/30/60/90ms, tudo visível)')
    else:
        falha('cascata', str(casc))

    # 5d) hover do cartão continua rápido depois da cascata (transition própria, não a da entrada)
    tr_cartao = pg.evaluate("getComputedStyle(document.querySelector('.servicos-grade .cartao')).transitionDuration")
    if '0.24s' in tr_cartao:
        ok('hover do cartão continua em .24s após a cascata')
    else:
        falha('transition do cartão', tr_cartao)

    # 5e) faixa-marquee rolando (linear, infinita)
    fx = pg.evaluate("""() => {
      const t = document.querySelector('.faixa-trilho');
      if (!t) return null;
      const cs = getComputedStyle(t);
      return { nome: cs.animationName, dur: cs.animationDuration, tf: cs.animationTimingFunction, n: t.children.length };
    }""")
    if fx and fx['nome'] == 'faixa-rolar' and fx['tf'] == 'linear' and fx['n'] == 14:
        ok('faixa de serviços em marquee (linear, 14 itens duplicados)')
    else:
        falha('faixa marquee', str(fx))

    # 5f) FAQ fechado sem fresta (altura 0) e aberto com altura real
    faq_h = pg.evaluate("""() => {
      const fechado = document.querySelectorAll('.faq-item')[2].querySelector('.faq-resp');
      const aberto = document.querySelector('.faq-item.aberto .faq-resp');
      return { fechado: fechado.getBoundingClientRect().height, aberto: aberto ? aberto.getBoundingClientRect().height : -1 };
    }""")
    if faq_h['fechado'] < 1 and faq_h['aberto'] > 30:
        ok('FAQ anima altura real (fechado 0px, aberto %.0fpx)' % faq_h['aberto'])
    else:
        falha('FAQ altura', str(faq_h))

    # 6) marca: cavalo no cabeçalho e no rodapé
    marca = pg.evaluate("""() => {
      const svgs = document.querySelectorAll('.logo-icone svg');
      return { n: svgs.length, viewBox: svgs.length ? svgs[0].getAttribute('viewBox') : null };
    }""")
    if marca['n'] == 2 and marca['viewBox'].startswith('314'):
        ok('logo do cavalo no cabeçalho e no rodapé')
    else:
        falha('logo', str(marca))

    # 7) honestidade: nenhum número de resultado inventado no site
    txt = pg.evaluate("document.body.innerText")
    inventados = [t for t in ['+212', '212%', '486', '+40 marcas', '2 milhões', 'R$ 1.500', 'R$ 2.900'] if t in txt]
    if not inventados:
        ok('sem números/preços de exemplo no texto público')
    else:
        falha('números de exemplo ainda no site', str(inventados))

    # 7b) cidade real (SEO local): rodapé, title e JSON-LD
    local = pg.evaluate("""() => {
      const ld = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
      return {
        rodape: document.querySelector('footer').innerText.includes('Alexandria/RN'),
        titulo: document.title.includes('Alexandria/RN'),
        desc: (document.querySelector('meta[name=description]').content || '').includes('Alexandria/RN'),
        cidade: ld.address && ld.address.addressLocality,
        uf: ld.address && ld.address.addressRegion
      };
    }""")
    if local['rodape'] and local['titulo'] and local['desc'] and local['cidade'] == 'Alexandria' and local['uf'] == 'RN':
        ok('Alexandria/RN no rodapé, no title, na description e no JSON-LD')
    else:
        falha('cidade Alexandria/RN', str(local))

    # 8) Instagram real
    igs = pg.evaluate("Array.from(document.querySelectorAll('a[href*=instagram]')).map(a => a.href)")
    if igs and all('cavalcante.media' in u for u in igs):
        ok('Instagram @cavalcante.media (%d links)' % len(igs))
    else:
        falha('Instagram', str(igs))


    # 9) BUG CORRIGIDO: o CTA secundário do herói se apagava sozinho quando o
    #    portfólio estava vazio (o seletor a[href="#portfolio"] pegava ele junto)
    sec = pg.evaluate("""() => {
      const b = document.querySelector('.hero-ctas .btn-fantasma');
      return b ? { display: getComputedStyle(b).display, href: b.getAttribute('href') } : null;
    }""")
    if sec and sec['display'] != 'none' and sec['href'] == '#protocolo':
        ok('herói mantém os dois caminhos mesmo com portfólio vazio')
    else:
        falha('CTA secundário do herói', str(sec))

    # 10) BUG CORRIGIDO: os 2 CTAs de maior intenção eram href="#" (mortos sem JS)
    mortos = pg.evaluate("""() =>
      Array.from(document.querySelectorAll('[data-whats]'))
        .map(a => a.getAttribute('href'))
        .filter(h => h === '#')""")
    if not mortos:
        ok('nenhum CTA de WhatsApp com href="#" no HTML')
    else:
        falha('CTA morto sem JS', '%d encontrados' % len(mortos))

    # 11) BUG CORRIGIDO: todo CTA leva contexto (o header mandava "quero saber mais")
    sem_msg = pg.evaluate("""() =>
      Array.from(document.querySelectorAll('a[data-whats]'))
        .filter(a => !a.hasAttribute('data-msg')).length""")
    if sem_msg <= 1:  # o botão flutuante pode usar a mensagem padrão
        ok('CTAs qualificam o lead na origem (%d sem data-msg)' % sem_msg)
    else:
        falha('CTAs sem contexto', '%d sem data-msg' % sem_msg)

    # 12) a risca fixa no topo dos cartões foi REMOVIDA (virava ruído com dez
    #     quadrados na tela) e virou luz que corre a borda, só no hover
    # tira o ponteiro de cima de qualquer cartão antes de medir o repouso —
    # senão o hover de um teste anterior conta como "risca parada"
    pg.mouse.move(4, 4)
    pg.evaluate("""() => { const r = document.querySelector('#pacotes').getBoundingClientRect();
      window.scrollTo({ top: scrollY + r.top - (innerHeight - r.height) / 2, behavior: 'instant' }); }""")
    pg.wait_for_timeout(1200)
    # a luz de um cartão hover anterior leva --t-base para apagar: esperar
    # ela sumir de verdade, senão o teste flagra o fade de saída como "risca"
    pg.wait_for_function(
        "() => [...document.querySelectorAll('.cartao')].filter(c => !c.matches(':hover'))"
        ".every(c => parseFloat(getComputedStyle(c, '::before').opacity) <= 0.01)",
        timeout=6000)
    # a asserção certa é sobre cartões EM REPOUSO — um cartão sob o ponteiro
    # deve mesmo mostrar a luz; o que não pode é risca em quem ninguém tocou
    repouso = pg.evaluate("""() => [...document.querySelectorAll('.cartao')]
      .filter(c => !c.matches(':hover'))
      .filter(c => parseFloat(getComputedStyle(c, '::before').opacity) > 0.01)
      .map(c => c.className.slice(0, 40))""")
    if not repouso:
        ok('nenhum cartão com risca azul parada em repouso')
    else:
        falha('risca em repouso', str(repouso))

    # locator.hover() cuida de rolar até o alvo e esperar ele ficar acionável,
    # em vez de mirar numa caixa que pode estar desatualizada
    alvo = pg.locator('#pacotes .cartao').first
    alvo.hover()
    # espera a luz acender de fato, em vez de dormir um tempo fixo e torcer
    pg.wait_for_function(
        "() => { const b = getComputedStyle(document.querySelector('#pacotes .cartao'), '::before');"
        " return parseFloat(b.opacity) > 0.9 && b.animationName === 'correr-borda'; }",
        timeout=6000)
    g1 = pg.evaluate("getComputedStyle(document.querySelector('#pacotes .cartao'),'::before').getPropertyValue('--giro')")
    # e espera o ângulo MUDAR — é isso que prova que a luz percorre a borda
    pg.wait_for_function(
        "(g) => getComputedStyle(document.querySelector('#pacotes .cartao'), '::before')"
        ".getPropertyValue('--giro').trim() !== g", arg=g1.strip(), timeout=6000)
    g2 = pg.evaluate("getComputedStyle(document.querySelector('#pacotes .cartao'),'::before').getPropertyValue('--giro')")
    luz = pg.evaluate("""() => {
      const c = document.querySelector('#pacotes .cartao');
      const b = getComputedStyle(c, '::before');
      return { op: parseFloat(b.opacity), anim: b.animationName, hov: c.matches(':hover') };
    }""")
    girou = g1.strip() != g2.strip() and luz['op'] > 0.9 and luz['anim'] == 'correr-borda'
    if girou:
        ok('luz corre a borda no hover (%s -> %s)' % (g1.strip(), g2.strip()))
    else:
        falha('luz de borda', '%s -> %s | %s' % (g1, g2, luz))
    pg.mouse.move(5, 5)

    # a linha que atravessa o Protocolo continua existindo — ela não é
    # decoração de quadrado, é o que mostra que 01 vem antes de 02
    # a linha espelha o avanço do palco preso: só chega em 1 no FIM da seção
    pg.evaluate("""() => { const p = document.querySelector('.protocolo-palco');
      const r = p.getBoundingClientRect();
      window.scrollTo({ top: scrollY + r.top + r.height - innerHeight, behavior: 'instant' }); }""")
    pg.wait_for_function(
        "() => { const t = getComputedStyle(document.querySelector('.marchas'), '::before').transform;"
        " return t === 'none' || (t.startsWith('matrix(') && parseFloat(t.slice(7).split(',')[0]) > 0.98); }",
        timeout=6000)
    ok('linha das 4 marchas preenche até o fim do palco preso')

    # e as marchas acendem em sequência conforme o palco avança
    pa = pg.evaluate("""() => { const r = document.querySelector('.protocolo-palco').getBoundingClientRect();
      return { t: r.top + scrollY, h: r.height }; }""")
    sequencia = []
    for fr in (0.02, 0.35, 0.6, 0.9):
        pg.evaluate("(y) => window.scrollTo({top: y, behavior: 'instant'})", pa['t'] + (pa['h'] - 880) * fr)
        pg.wait_for_timeout(320)
        sequencia.append(pg.evaluate("""() => [...document.querySelectorAll('.marcha')]
          .findIndex(l => l.hasAttribute('data-ativa')) + 1"""))
    if sequencia == sorted(sequencia) and sequencia[0] == 1 and sequencia[-1] == 4:
        ok('marchas acendem em sequência ao rolar (%s)' % ' -> '.join(map(str, sequencia)))
    else:
        falha('sequência das marchas', str(sequencia))

    # 13) régua de progresso de leitura acompanha o scroll
    pg.evaluate("window.scrollTo({top: document.documentElement.scrollHeight * 0.5, behavior: 'instant'})")
    # a barra pinta num requestAnimationFrame: esperar ela convergir, não dormir
    pg.wait_for_function(
        "() => { const b = document.querySelector('.progresso-leitura');"
        " const al = document.documentElement.scrollHeight - window.innerHeight;"
        " const p = parseFloat(getComputedStyle(b).getPropertyValue('--p'));"
        " return al > 0 && Math.abs(p - window.scrollY / al) < 0.01; }",
        timeout=6000)
    med = pg.evaluate("""() => {
      const b = document.querySelector('.progresso-leitura');
      const alcance = document.documentElement.scrollHeight - window.innerHeight;
      return { p: b ? parseFloat(getComputedStyle(b).getPropertyValue('--p')) : -1,
               esperado: alcance > 0 ? window.scrollY / alcance : -1 };
    }""")
    # a barra tem que espelhar a posição real, seja ela qual for
    if abs(med['p'] - med['esperado']) < 0.02 and med['p'] > 0.05:
        ok('régua de progresso espelha o scroll real (%.2f vs %.2f)' % (med['p'], med['esperado']))
    else:
        falha('progresso de leitura', str(med))

    # 14) BUG CORRIGIDO: o herói apagava o próprio CTA ao rolar (opacity .3)
    pg.evaluate("window.scrollTo(0, 480)")
    pg.wait_for_timeout(600)
    op = pg.evaluate("getComputedStyle(document.querySelector('.hero-ctas .btn-azul')).opacity")
    if float(op) > 0.95:
        ok('CTA do herói continua opaco ao rolar (%s)' % op)
    else:
        falha('CTA do herói desbota ao rolar', op)

    # 15) seções novas existem e o menu leva a elas
    novas = pg.evaluate("""() => ({
      protocolo: !!document.querySelector('#protocolo'),
      marchas: document.querySelectorAll('#protocolo .marcha').length,
      ficha: !!document.querySelector('#ficha'),
      menu: !!document.querySelector('nav.principal a[href="#protocolo"]'),
    })""")
    if novas['protocolo'] and novas['marchas'] == 4 and novas['ficha'] and novas['menu']:
        ok('Protocolo (4 marchas), Ficha da agência e link no menu')
    else:
        falha('seções novas', str(novas))

    pg.close()

    # 7) prefers-reduced-motion: nada some, sem orquestração
    pg2 = nav.new_page(viewport={'width': 1380, 'height': 900}, reduced_motion='reduce')
    pg2.goto(URL)
    pg2.wait_for_timeout(500)
    rm = pg2.evaluate("""() => {
      const h1 = document.querySelector('.hero h1');
      const faixa = getComputedStyle(document.querySelector('.faixa-trilho')).animationName;
      const filho = getComputedStyle(document.querySelector('.servicos-grade > *')).opacity;
      return { inline: h1.style.opacity, comp: getComputedStyle(h1).opacity, faixa, filho };
    }""")
    if rm['inline'] == '' and rm['comp'] == '1' and rm['faixa'] == 'none' and abs(float(rm['filho']) - 1) < .02:
        ok('reduced motion: herói e grades visíveis, marquee parada')
    else:
        falha('reduced motion', str(rm))

    # reduced motion tem que matar TAMBÉM os transforms de hover — antes o bloco
    # listava 8 seletores a mão e deixava 8 transforms de interação intactos,
    # inclusive o único com overshoot do arquivo (scale(1.1) rotate(-4deg))
    pg2.evaluate("document.querySelector('#servicos').scrollIntoView({block:'center'})")
    pg2.wait_for_timeout(400)
    alvo = pg2.locator('.servicos-grade .cartao').first
    alvo.hover()
    pg2.wait_for_timeout(300)
    hov = pg2.evaluate('''() => {
      const c = document.querySelector('.servicos-grade .cartao');
      const ic = c.querySelector('.servico-icone');
      return { cartao: getComputedStyle(c).transform,
               icone: ic ? getComputedStyle(ic).transform : 'none' };
    }''')
    if hov['cartao'] == 'none' and hov['icone'] == 'none':
        ok('reduced motion zera também os transforms de hover')
    else:
        falha('hover sob reduced motion', str(hov))

    # e os tokens de tempo tem que estar todos em 1ms
    toks = pg2.evaluate('''() => {
      const cs = getComputedStyle(document.documentElement);
      return ['--t-instante','--t-rapido','--t-base','--t-lento','--t-amb']
        .map(t => cs.getPropertyValue(t).trim());
    }''')
    if all(t == '1ms' for t in toks):
        ok('escala de tempo inteira zerada sob reduced motion (%s)' % ', '.join(toks))
    else:
        falha('tokens de tempo sob reduced motion', str(toks))
    pg2.close()

    # 8) mobile 390px: sem scroll horizontal, menu abre
    pg3 = nav.new_page(viewport={'width': 390, 'height': 844})
    pg3.goto(URL)
    pg3.wait_for_timeout(1200)
    largura = pg3.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    if largura <= 1:
        ok('mobile sem scroll horizontal')
    else:
        falha('mobile scroll horizontal', '%dpx a mais' % largura)
    pg3.locator('.btn-menu').click()
    pg3.wait_for_timeout(400)
    menu_vis = pg3.evaluate("""() => {
      const m = document.querySelector('.menu-mobile');
      const cs = getComputedStyle(m);
      return { vis: cs.visibility, op: cs.opacity, exp: document.querySelector('.btn-menu').getAttribute('aria-expanded') };
    }""")
    if menu_vis['vis'] == 'visible' and float(menu_vis['op']) > 0.9 and menu_vis['exp'] == 'true':
        ok('menu mobile abre com animação e aria-expanded')
    else:
        falha('menu mobile', str(menu_vis))
    pg3.close()

    nav.close()

print()
if falhas:
    print('TOTAL: %d falha(s)' % len(falhas))
    raise SystemExit(1)
print('TOTAL: site verificado, tudo passou')

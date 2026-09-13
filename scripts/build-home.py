"""Generate the buildless cinematic home from the verified project catalog."""
from pathlib import Path
import json
from html import escape

ROOT = Path(__file__).resolve().parents[1]
catalog = json.loads((ROOT / "project-catalog.json").read_text())["itens"]
featured = [item for item in catalog if item.get("destaque")][:3]


def icon(name: str) -> str:
    paths = {
        "arrow": '<path d="M5 19 19 5M8 5h11v11"/>',
        "down": '<path d="M12 3v18m-7-7 7 7 7-7"/>',
        "menu": '<path d="M4 8h16M4 16h16"/>',
        "close": '<path d="m5 5 14 14M19 5 5 19"/>',
    }
    return (
        f'<svg class="icon icon-{name}" viewBox="0 0 24 24" fill="none" '
        'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" '
        f'stroke-linejoin="round" aria-hidden="true">{paths[name]}</svg>'
    )


case_panels = []
for index, item in enumerate(featured, start=1):
    case_panels.append(f'''<article class="case-scene" data-case="{index - 1}">
          <div class="case-media"><img src="{escape(item['capa'])}" width="1080" height="1920" loading="{'eager' if index == 1 else 'lazy'}" decoding="async" alt="{escape(item['titulo'])} — {escape(item['cliente'])}"></div>
          <div class="case-shade"></div>
          <span class="case-index">0{index} / 03</span>
          <div class="case-copy"><span>{escape(item['categoria'])}</span><h3>{escape(item['cliente'])}</h3><p>{escape(item['titulo'])}</p><a href="{escape(item['url'])}" target="_blank" rel="noopener noreferrer" data-event="case_open" data-label="{escape(item['id'])}">Ver trabalho {icon('arrow')}</a></div>
        </article>''')

page = f'''<!doctype html>
<html lang="pt-BR" data-performance="fallback">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#060914">
  <meta name="description" content="Estratégia, direção criativa, audiovisual e mídia em Alexandria/RN. A Agência Cavalcante transforma marcas em experiências impossíveis de ignorar.">
  <title>Agência Cavalcante — Estratégia, Audiovisual e Movimento</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="app/img/icone-ios-180.png">
  <link rel="canonical" href="https://agenciacavalcante.com/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Agência Cavalcante">
  <meta property="og:title" content="Agência Cavalcante — Impossível de ignorar.">
  <meta property="og:description" content="Estratégia, direção criativa, audiovisual e mídia. Conheça o trabalho da Cavalcante.">
  <meta property="og:url" content="https://agenciacavalcante.com/">
  <meta property="og:image" content="https://agenciacavalcante.com/og.png">
  <meta property="og:image:width" content="2400"><meta property="og:image:height" content="1260">
  <meta property="og:image:alt" content="Agência Cavalcante — Estratégia e audiovisual">
  <meta property="og:locale" content="pt_BR"><meta name="twitter:card" content="summary_large_image">
  <link rel="preload" href="assets/fonts/InstrumentSans-Regular.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="assets/fonts/InstrumentSans-Bold.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="site-studio.css?v=20260913-1">
  <script src="assets/vendor/gsap.min.js?v=3.13.0" defer></script>
  <script src="assets/vendor/ScrollTrigger.min.js?v=3.13.0" defer></script>
  <script src="site.js?v=20260913-1" defer></script>
  <script src="site-motion.js?v=20260913-1" defer></script>
  <script type="application/ld+json">{{"@context":"https://schema.org","@type":"ProfessionalService","name":"Agência Cavalcante","url":"https://agenciacavalcante.com/","image":"https://agenciacavalcante.com/og.png","description":"Estratégia, direção criativa, produção audiovisual, conteúdo e mídia.","telephone":"+5584999492725","address":{{"@type":"PostalAddress","addressLocality":"Alexandria","addressRegion":"RN","addressCountry":"BR"}},"areaServed":["Alexandria","Rio Grande do Norte","Brasil"],"sameAs":["https://instagram.com/cavalcante.media"]}}</script>
</head>
<body>
  <a class="skip-link" href="#main">Pular para o conteúdo</a>
  <div class="world" id="world" aria-hidden="true"><div class="world-aurora"></div><div class="world-grid"></div><img class="world-fallback" src="app/img/logo.svg" width="480" height="760" alt=""><canvas id="global-canvas"></canvas></div>
  <div class="grain" aria-hidden="true"></div><div class="reading-progress" aria-hidden="true"><i></i></div>
  <header class="site-header" id="site-header">
    <a class="brand" href="#arrival" aria-label="Agência Cavalcante — início"><img src="app/img/logo.svg" width="24" height="38" alt=""><span>CAVALCANTE</span></a>
    <nav class="desktop-nav" aria-label="Navegação principal"><a href="#system">Expertise</a><a href="#work">Work</a><a href="#hub">AgênciaHub</a></nav>
    <a class="header-cta" href="https://wa.me/5584999492725?text=Ol%C3%A1!%20Quero%20come%C3%A7ar%20um%20projeto%20com%20a%20Cavalcante." target="_blank" rel="noopener noreferrer" data-event="start_project_click" data-label="header">Começar um projeto {icon('arrow')}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Abrir menu">{icon('menu')}</button>
  </header>
  <nav class="mobile-menu" id="mobile-menu" aria-label="Navegação móvel" hidden><button type="button" class="menu-close" aria-label="Fechar menu">{icon('close')}</button><a href="#arrival"><span>01</span>Início</a><a href="#system"><span>02</span>Expertise</a><a href="#work"><span>03</span>Work</a><a href="#hub"><span>04</span>AgênciaHub</a><a href="#contact"><span>05</span>Começar</a><small>Alexandria, RN · Brasil</small></nav>
  <main id="main">
    <section class="chapter arrival" id="arrival" aria-labelledby="hero-title">
      <div class="sticky-stage arrival-stage"><span class="scene-label">Scene 01 / Arrival</span>
        <div class="hero-copy"><h1 id="hero-title"><span>Sua marca</span><span>não precisa de</span><span>mais conteúdo.</span><span class="hero-answer">Precisa ser</span><span class="hero-answer">impossível de</span><span class="hero-answer">ignorar.</span></h1></div>
        <div class="arrival-meta"><span>Strategy</span><span>Film</span><span>Performance</span><span>Technology</span></div>
        <a class="arrival-cta" href="#system">Scroll to move {icon('down')}</a><div class="scene-counter" aria-hidden="true"><span>01</span><i></i><span>06</span></div>
      </div>
    </section>
    <section class="chapter system" id="system" aria-labelledby="system-title">
      <div class="sticky-stage system-stage"><span class="scene-label">Scene 02 / The system</span><h2 class="sr-only" id="system-title">Pensar, criar e escalar</h2>
        <div class="phase is-active" data-phase="0"><div class="phase-word">PEN<br>SAR.</div><div class="phase-detail"><span>01 / Direction</span><h3>Clareza antes da câmera.</h3><p>Diagnóstico, posicionamento e uma direção criativa que torna cada escolha intencional.</p></div></div>
        <div class="phase" data-phase="1"><div class="phase-word">CRI<br>AR.</div><div class="phase-detail"><span>02 / Production</span><h3>Forma, ritmo e presença.</h3><p>Conceito, roteiro, captação, edição, design e conteúdo constroem uma imagem que permanece.</p></div></div>
        <div class="phase" data-phase="2"><div class="phase-word">ESCA<br>LAR.</div><div class="phase-detail"><span>03 / Distribution</span><h3>O trabalho encontra o público.</h3><p>Mídia, distribuição e leitura de desempenho mantêm a campanha viva depois da publicação.</p></div></div>
        <div class="phase-nav" aria-hidden="true"><span class="is-active">Think</span><span>Create</span><span>Scale</span></div>
      </div>
    </section>
    <section class="chapter work" id="work" aria-labelledby="work-title">
      <div class="sticky-stage work-stage"><div class="work-heading"><span class="scene-label">Scene 03 / Selected work</span><h2 id="work-title">Trabalho que<br><em>move a cena.</em></h2></div><div class="case-stack">{''.join(case_panels)}</div><div class="case-progress" aria-hidden="true"><span>01</span><i><b></b></i><span>03</span></div></div>
    </section>
    <section class="chapter hub" id="hub" aria-labelledby="hub-title">
      <div class="sticky-stage hub-stage"><span class="scene-label">Scene 04 / No black box</span>
        <div class="hub-copy"><span>AgênciaHub · Produto Cavalcante</span><h2 id="hub-title">Você vê<br>o trabalho<br><em>acontecer.</em></h2><p>Projetos, aprovações e entregas ficam no mesmo lugar. Cada etapa mostra o que avançou e qual é a próxima decisão.</p><a href="portal/" data-event="portal_view" data-label="hub">Entrar no portal {icon('arrow')}</a></div>
        <div class="hub-device" aria-label="Representação fiel dos módulos do AgênciaHub"><div class="hub-chrome"><span><img src="app/img/logo.svg" width="14" height="22" alt=""> AgênciaHub</span><span>Portal do cliente</span><i></i></div><div class="hub-layer layer-projects"><small>PROJETOS / EM PRODUÇÃO</small><h3>Campanha da marca</h3><div class="hub-status"><i></i><span>Direção aprovada</span><b>03 / 05</b></div></div><div class="hub-layer layer-approval"><small>APROVAÇÃO</small><strong>Material pronto para revisar</strong><span>Contexto, versão e retorno no mesmo fluxo.</span><span class="hub-action">Revisar entrega</span></div><div class="hub-layer layer-flow"><span>Briefing</span><i></i><span>Direção</span><i></i><span>Produção</span><i></i><span>Entrega</span></div><small class="hub-note">Interface demonstrativa baseada nos módulos reais do AgênciaHub.</small></div>
      </div>
    </section>
    <section class="chapter knight" id="method" aria-labelledby="knight-title">
      <div class="sticky-stage knight-stage"><span class="scene-label">Scene 05 / Knight move</span><h2 id="knight-title">A próxima jogada<br><em>tem método.</em></h2>
        <div class="knight-map" aria-hidden="true"><svg viewBox="0 0 1000 560" preserveAspectRatio="none"><path class="knight-base" d="M85 455H300V325H485V195H690V90H915"/><path class="knight-active" d="M85 455H300V325H485V195H690V90H915" pathLength="1"/></svg><span class="knight-node" style="--x:8.5%;--y:81%" data-name="Diagnóstico"></span><span class="knight-node" style="--x:30%;--y:58%" data-name="Estratégia"></span><span class="knight-node" style="--x:48.5%;--y:35%" data-name="Produção"></span><span class="knight-node" style="--x:69%;--y:16%" data-name="Distribuição"></span><span class="knight-node" style="--x:91.5%;--y:16%" data-name="Próxima jogada"></span></div>
        <div class="knight-detail" aria-live="polite"><strong>01 / Diagnóstico</strong><p>A direção começa pelo que precisa mudar.</p></div>
      </div>
    </section>
    <section class="finale" id="contact" aria-labelledby="contact-title"><div class="finale-inner"><span class="scene-label">Scene 06 / Start a project</span><h2 id="contact-title">Sua próxima campanha<br><em>pode começar aqui.</em></h2><a class="finale-cta" href="https://wa.me/5584999492725?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20quero%20conversar%20sobre%20um%20projeto." target="_blank" rel="noopener noreferrer" data-event="start_project_click" data-label="finale"><span>Começar<br>um projeto</span>{icon('arrow')}</a><div class="finale-meta"><p>Da primeira ideia ao último frame.<br>Estratégia, audiovisual e mídia.</p><p>Alexandria / Rio Grande do Norte<br><a href="https://instagram.com/cavalcante.media" target="_blank" rel="noopener noreferrer">@cavalcante.media</a></p></div></div></section>
  </main>
  <footer class="site-footer"><a href="#arrival" aria-label="Voltar ao início"><img src="app/img/logo.svg" width="28" height="44" alt=""> Cavalcante</a><span>© <span id="year"></span></span><nav aria-label="Links do rodapé"><a href="portal/">Portal</a><a href="privacidade.html">Privacidade</a><a href="#arrival">Topo ↑</a></nav></footer>
  <aside class="motion-debug" id="motion-debug" hidden aria-hidden="true"></aside>
</body>
</html>
'''

(ROOT / "index.html").write_text(page, encoding="utf-8")

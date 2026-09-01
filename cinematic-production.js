(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-head');
  const work = document.querySelector('.work');
  const reel = document.querySelector('.reel');
  // Production media slots. Keep empty until the real assets are delivered.
  const SHOWREEL_DESKTOP = '';
  const SHOWREEL_MOBILE = '';
  const SHOWREEL_POSTER = '';
  const knight = document.querySelector('.knight');
  const finale = document.querySelector('.finale');
  const workLive = document.querySelector('#work-live');
  const evidence = document.querySelector('#evidence');
  const evidenceLive = document.querySelector('#evidence-live');
  const knightNodes = [...document.querySelectorAll('.knight-node')];
  const knightDetail = document.querySelector('.knight-detail');
  const year = document.querySelector('#current-year');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const ease = value => 1 - Math.pow(1 - clamp(value), 3);

  if (!work || !portal || !knight || !finale) return;
  if (year) year.textContent = String(new Date().getFullYear());

  const methodSteps = [
    ['01 / Diagnóstico', 'A direção começa pelo que precisa mudar, não pelo que precisa ser postado.'],
    ['02 / Estratégia', 'A próxima jogada combina posicionamento, linguagem, canais e uma meta clara.'],
    ['03 / Produção', 'Roteiro, direção, captação e design transformam intenção em presença.'],
    ['04 / Distribuição', 'O conteúdo encontra contexto, formato e audiência para circular com força.'],
    ['05 / Otimização', 'Leitura e ajustes mantêm a campanha viva depois da primeira publicação.'],
    ['06 / Resultado', 'A operação fecha o ciclo com clareza sobre o que avançou e qual é a próxima jogada.'],
  ];

  const progressWithin = (section, y) => {
    const distance = Math.max(1, section.offsetHeight - innerHeight);
    return clamp((y - section.offsetTop) / distance);
  };

  const progressThroughViewport = (section, y) => {
    const start = section.offsetTop - innerHeight;
    const distance = section.offsetHeight + innerHeight;
    return clamp((y - start) / Math.max(1, distance));
  };

  let activeStep = -1;
  window.CavalcantePermanent = {
    update(state) {
      const y = state.smoothY;
      const workProgress = progressWithin(work, y);
      const portalProgress = progressWithin(portal, y);
      const knightProgress = progressWithin(knight, y);
      const finaleProgress = progressThroughViewport(finale, y);

      root.style.setProperty('--work-progress', workProgress.toFixed(4));
      root.style.setProperty('--portal-progress', portalProgress.toFixed(4));
      root.style.setProperty('--knight-progress', knightProgress.toFixed(4));
      root.style.setProperty('--finale-progress', ease(finaleProgress).toFixed(4));

      const nextStep = Math.min(methodSteps.length - 1, Math.floor(knightProgress * methodSteps.length));
      if (nextStep !== activeStep) {
        activeStep = nextStep;
        knightNodes.forEach((node, index) => node.classList.toggle('is-active', index === activeStep));
        if (knightDetail) {
          knightDetail.querySelector('strong').textContent = methodSteps[activeStep][0];
          knightDetail.querySelector('p').textContent = methodSteps[activeStep][1];
        }
      }

      const onLightScene = y >= portal.offsetTop - 80 && y < knight.offsetTop - 80;
      header?.classList.toggle('is-light', onLightScene);
      header?.classList.toggle('is-finale', finaleProgress > .32);
      state.work = workProgress;
      state.portal = portalProgress;
      state.knight = knightProgress;
      state.finale = finaleProgress;
    },
  };

  const hideUnavailableChapters = () => {
    if (!reel || (!SHOWREEL_DESKTOP && !SHOWREEL_MOBILE)) reel?.setAttribute('hidden', '');
    if (!work || window.__portfolioItems?.length) return;
    work.setAttribute('hidden', '');
    document.querySelectorAll('a[href="#work"], a[href="#prova"], a[href="#evidence"]').forEach(link => link.remove());
  };

  const setPortfolio = async () => {
    try {
      const response = await fetch('portfolio.json', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const items = Array.isArray(data.itens) ? data.itens.filter(item => item && item.url) : [];
      window.__portfolioItems = items;
      if (!items.length) {
        hideUnavailableChapters();
        return;
      }

      const first = items[0];
      const title = String(first.titulo || 'Trabalho Cavalcante');
      const link = document.createElement('a');
      link.href = first.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = `01 / ${title}`;
      workLive.textContent = 'Case disponível';
      workLive.appendChild(link);
      workLive.classList.add('is-ready');

      const proofItems = items.filter(item => item.metrica || item.resultado || item.logo);
      if (proofItems.length) {
        evidence.hidden = false;
        evidenceLive.textContent = `${proofItems.length} evidência${proofItems.length > 1 ? 's' : ''} verificável${proofItems.length > 1 ? 'eis' : ''}`;
      }
    } catch {
      /* O portfólio vazio não interrompe a experiência. */
    }
  };

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-cta-origin]');
    if (!link) return;
    const origin = link.dataset.ctaOrigin || 'unknown';
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'whatsapp_click', origin });
  });

  let scroll50 = false;
  let scroll90 = false;
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? scrollY / max : 0;
    window.dataLayer = window.dataLayer || [];
    if (!scroll50 && progress >= .5) {
      scroll50 = true;
      window.dataLayer.push({ event: 'scroll_50' });
    }
    if (!scroll90 && progress >= .9) {
      scroll90 = true;
      window.dataLayer.push({ event: 'scroll_90' });
    }
  }, { passive: true });

  hideUnavailableChapters();
  setPortfolio();
})();

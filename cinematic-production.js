(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-head');
  const work = document.querySelector('.work');
  const reel = document.querySelector('.reel');
  const portal = document.querySelector('.portal');
  const knight = document.querySelector('.knight');
  const finale = document.querySelector('.finale');
  const evidence = document.querySelector('#evidence');
  const knightNodes = [...document.querySelectorAll('.knight-node')];
  const knightDetail = document.querySelector('.knight-detail');
  const year = document.querySelector('#current-year');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection?.saveData);
  const coarse = matchMedia('(pointer: coarse)').matches;
  const constrained = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  const performanceMode = reducedMotion ? 'fallback' : (saveData || constrained || coarse ? 'reduced' : 'full');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const ease = value => 1 - Math.pow(1 - clamp(value), 3);

  root.dataset.performance = performanceMode;
  window.CavalcantePerformanceMode = performanceMode;
  if (year) year.textContent = String(new Date().getFullYear());
  if (!work || !portal || !knight || !finale) return;

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

  const configureOptionalShowreel = async () => {
    if (!reel) return;
    let showreel;
    try {
      const response = await fetch('showreel-config.json', { cache: 'no-store' });
      showreel = response.ok ? await response.json() : null;
    } catch {
      return;
    }
    if (!showreel?.desktop && !showreel?.mobile) return;

    const video = document.querySelector('#showreel-video');
    const useMobile = innerWidth < 760 && showreel.mobile;
    video.src = useMobile ? showreel.mobile : (showreel.desktop || showreel.mobile);
    if (showreel.poster) video.poster = showreel.poster;
    reel.hidden = false;
    document.querySelector('.reel-film-study')?.remove();
    document.querySelector('#work-scene-label')?.replaceChildren(document.createTextNode('Scene 06 / Work'));
    document.querySelector('#portal-scene-label')?.replaceChildren(document.createTextNode('Scene 07 / No black box'));
    document.querySelector('#knight-scene-label')?.replaceChildren(document.createTextNode('Scene 08 / Knight move'));
    document.querySelector('#finale-scene-label')?.replaceChildren(document.createTextNode('Scene 09 / Start a project'));
    window.CavalcanteMotion?.refresh();
  };

  // Evidence stays unpublished until metrics/resultados-reais.md contains verified numbers.
  if (evidence) evidence.hidden = true;
  configureOptionalShowreel();

  document.addEventListener('click', event => {
    const link = event.target.closest('[data-cta-origin], [data-work-case]');
    if (!link) return;
    window.dataLayer = window.dataLayer || [];
    if (link.dataset.workCase) {
      window.dataLayer.push({ event: 'work_case_click', case: link.dataset.workCase });
      return;
    }
    window.dataLayer.push({ event: 'whatsapp_click', origin: link.dataset.ctaOrigin || 'unknown' });
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
})();

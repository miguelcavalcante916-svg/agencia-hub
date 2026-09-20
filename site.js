(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const saveData = Boolean(navigator.connection?.saveData);
  const memory = Number(navigator.deviceMemory || 8);
  const canvas = document.querySelector('#global-canvas');
  let webgl = false;
  try {
    const probe = document.createElement('canvas');
    webgl = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {}
  const mode = reducedMotion.matches || !webgl ? 'fallback' : (saveData || coarse || memory <= 4 || innerWidth < 900 ? 'reduced' : 'full');
  root.dataset.performance = mode;
  root.classList.add('js');
  document.querySelector('#year').textContent = new Date().getFullYear();

  const header = document.querySelector('#site-header');
  const menu = document.querySelector('#mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const close = document.querySelector('.menu-close');
  const pageNodes = [document.querySelector('main'), document.querySelector('.site-footer'), document.querySelector('.world')];
  const setMenu = (open, restore = false) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
    pageNodes.forEach(node => { if (node) node.inert = open; });
    if (open) menu.querySelector('a')?.focus();
    else if (restore) toggle.focus();
  };
  toggle.addEventListener('click', () => setMenu(menu.hidden, true));
  close.addEventListener('click', () => setMenu(false, true));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) setMenu(false, true);
  });
  matchMedia('(min-width: 901px)').addEventListener('change', event => {
    if (event.matches && !menu.hidden) setMenu(false);
  });

  let lastScroll = 0;
  const hub = document.querySelector('#hub');
  const knight = document.querySelector('#method');
  const finale = document.querySelector('#contact');
  const updateHeader = () => {
    const marker = scrollY + header.offsetHeight;
    const onLight = (marker >= hub.offsetTop && marker < knight.offsetTop) || marker >= finale.offsetTop;
    header.classList.toggle('is-scrolled', scrollY > 24);
    header.classList.toggle('is-light', onLight);
    header.classList.toggle('is-hidden', scrollY > lastScroll && scrollY > innerHeight * .8);
    lastScroll = scrollY;
  };
  addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  window.dataLayer = window.dataLayer || [];
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-event]');
    if (!link) return;
    window.dataLayer.push({
      event: link.dataset.event,
      origin: link.dataset.label || 'unknown',
      href: link.getAttribute('href') || ''
    });
  });
  let sent50 = false;
  let sent90 = false;
  addEventListener('scroll', () => {
    const distance = document.documentElement.scrollHeight - innerHeight;
    const progress = distance > 0 ? scrollY / distance : 0;
    if (!sent50 && progress >= .5) {
      sent50 = true;
      window.dataLayer.push({ event: 'scroll_50' });
    }
    if (!sent90 && progress >= .9) {
      sent90 = true;
      window.dataLayer.push({ event: 'scroll_90' });
    }
  }, { passive: true });

  /* O three.js sao 671 KB. Antes ele baixava em TODO aparelho que nao fosse
     'fallback' — inclusive celular no 4G, que e onde o cliente daqui abre o site.
     Agora so desce quando ha folga real; os demais ficam com a atmosfera em CSS
     (world-aurora + world-grid + logo), que ja existe e ja e bonita. */
  const cabe3d = mode === 'full'
    || (mode === 'reduced' && !saveData && memory > 4 && innerWidth >= 700);
  if (cabe3d && canvas) {
    const load = () => import('./site-scene.js?v=20260913-1')
      .then(module => module.initGlobalScene(canvas, { mode, reducedMotion }))
      .catch(() => { root.dataset.performance = 'fallback'; });
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 900 });
    else setTimeout(load, 80);
  }
})();

(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = matchMedia('(pointer: coarse)').matches;
  const saveData = Boolean(navigator.connection?.saveData);
  const deviceMemory = Number(navigator.deviceMemory || 8);
  const canvas = document.querySelector('#global-canvas');
  let webgl = false;

  try {
    const probe = document.createElement('canvas');
    webgl = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {}

  const shouldFallback = reducedMotion.matches || !webgl || saveData || coarsePointer || innerWidth < 900 || deviceMemory <= 2;
  const shouldReduce = deviceMemory <= 4;
  const mode = shouldFallback ? 'fallback' : (shouldReduce ? 'reduced' : 'full');
  root.dataset.performance = mode;
  root.classList.add('js');

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  const enabledScenes = [...document.querySelectorAll('[data-scene]')]
    .filter(scene => !scene.hidden && scene.dataset.sceneEnabled !== 'false');
  const pad = value => String(value).padStart(2, '0');

  enabledScenes.forEach((scene, index) => {
    const number = pad(index + 1);
    const label = scene.querySelector('.scene-label');
    if (label) label.textContent = `Scene ${number} / ${scene.dataset.sceneName || ''}`;
    document.querySelectorAll(`[data-scene-ref="${scene.id}"]`)
      .forEach(node => { node.textContent = number; });
  });
  document.querySelectorAll('[data-scene-start]').forEach(node => { node.textContent = '01'; });
  document.querySelectorAll('[data-scene-total]').forEach(node => { node.textContent = pad(enabledScenes.length); });

  const header = document.querySelector('#site-header');
  const menu = document.querySelector('#mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const close = document.querySelector('.menu-close');
  const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-menu a')];
  const pageNodes = [document.querySelector('main'), document.querySelector('.site-footer'), document.querySelector('.world')];

  const setMenu = (open, restoreFocus = false) => {
    if (!menu || !toggle) return;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
    pageNodes.forEach(node => { if (node) node.inert = open; });
    if (open) menu.querySelector('a')?.focus();
    else if (restoreFocus) toggle.focus();
  };

  toggle?.addEventListener('click', () => setMenu(menu?.hidden !== false, true));
  close?.addEventListener('click', () => setMenu(false, true));
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', event => {
    if (!menu || menu.hidden) return;
    if (event.key === 'Escape') {
      setMenu(false, true);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...menu.querySelectorAll('a, button')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', event => {
    if (event.matches && menu?.hidden === false) setMenu(false);
  });

  const workStage = document.querySelector('.work-stage');
  const caseCursor = document.querySelector('.case-cursor');
  const finePointer = matchMedia('(pointer: fine)').matches;
  let cursorFrame = 0;
  const cursorState = { x: 0, y: 0, tx: 0, ty: 0, opacity: 0, targetOpacity: 0, scale: .72, targetScale: .72, ready: false };
  const drawCursor = () => {
    cursorFrame = 0;
    const ease = .18;
    cursorState.x += (cursorState.tx - cursorState.x) * ease;
    cursorState.y += (cursorState.ty - cursorState.y) * ease;
    cursorState.opacity += (cursorState.targetOpacity - cursorState.opacity) * .22;
    cursorState.scale += (cursorState.targetScale - cursorState.scale) * .2;
    if (caseCursor) {
      caseCursor.style.opacity = cursorState.opacity.toFixed(3);
      caseCursor.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0) translate(-50%, -50%) scale(${cursorState.scale})`;
    }
    const moving = Math.abs(cursorState.tx - cursorState.x) > .15 || Math.abs(cursorState.ty - cursorState.y) > .15;
    const fading = Math.abs(cursorState.targetOpacity - cursorState.opacity) > .015 || Math.abs(cursorState.targetScale - cursorState.scale) > .015;
    if (moving || fading) cursorFrame = requestAnimationFrame(drawCursor);
  };
  const wakeCursor = () => {
    if (!cursorFrame) cursorFrame = requestAnimationFrame(drawCursor);
  };
  if (finePointer && workStage && caseCursor) {
    workStage.addEventListener('pointermove', event => {
      const preciseTarget = Boolean(event.target.closest('a, button'));
      cursorState.tx = Math.max(48, Math.min(innerWidth - 48, event.clientX));
      cursorState.ty = Math.max(48, Math.min(innerHeight - 48, event.clientY));
      if (!cursorState.ready) {
        cursorState.x = cursorState.tx;
        cursorState.y = cursorState.ty;
        cursorState.ready = true;
      }
      cursorState.targetOpacity = preciseTarget ? 0 : 1;
      cursorState.targetScale = preciseTarget ? .72 : 1;
      document.body.classList.toggle('case-cursor-active', !preciseTarget);
      wakeCursor();
    }, { passive: true });
    workStage.addEventListener('pointerleave', () => {
      cursorState.targetOpacity = 0;
      cursorState.targetScale = .72;
      document.body.classList.remove('case-cursor-active');
      wakeCursor();
    });
    addEventListener('pagehide', () => {
      if (cursorFrame) cancelAnimationFrame(cursorFrame);
    }, { once: true });
  }

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
  let uiFrame = 0;
  const updateUi = () => {
    uiFrame = 0;
    const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, scrollY / distance));
    root.style.setProperty('--page-progress', progress.toFixed(4));
    header?.classList.toggle('is-scrolled', scrollY > 24);

    const marker = (header?.offsetHeight || 0) + 2;
    const activeScene = enabledScenes.find(scene => {
      const rect = scene.getBoundingClientRect();
      return rect.top <= marker && rect.bottom > marker;
    }) || enabledScenes.at(-1);
    header?.classList.toggle('is-light', activeScene?.dataset.headerTheme === 'light');
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${activeScene?.id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    if (!sent50 && progress >= .5) {
      sent50 = true;
      window.dataLayer.push({ event: 'scroll_50' });
    }
    if (!sent90 && progress >= .9) {
      sent90 = true;
      window.dataLayer.push({ event: 'scroll_90' });
    }
  };
  const scheduleUi = () => {
    if (!uiFrame) uiFrame = requestAnimationFrame(updateUi);
  };
  addEventListener('scroll', scheduleUi, { passive: true });
  addEventListener('resize', scheduleUi, { passive: true });
  updateUi();

  if (mode !== 'fallback' && canvas) {
    const loadScene = () => import('./site-scene.js?v=20260915-5')
      .then(module => module.initGlobalScene(canvas, { mode, reducedMotion }))
      .catch(() => { root.dataset.performance = 'fallback'; });
    if ('requestIdleCallback' in window) requestIdleCallback(loadScene, { timeout: 900 });
    else setTimeout(loadScene, 80);
  }
})();

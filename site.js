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
  const themeRegions = [...document.querySelectorAll('[data-header-theme]')];
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

  const initWorkLibrary = async () => {
    const dataNode = document.querySelector('#work-library-data');
    const track = document.querySelector('[data-archive-track]');
    const tabs = document.querySelector('[data-archive-tabs]');
    const nav = document.querySelector('[data-archive-nav]');
    const status = document.querySelector('[data-archive-status]');
    const progressBar = document.querySelector('[data-archive-progress]');
    const previous = document.querySelector('[data-archive-prev]');
    const next = document.querySelector('[data-archive-next]');
    if (!dataNode || !track || !tabs || !nav) return;

    const showUnavailable = () => {
      const message = document.createElement('p');
      message.className = 'work-library-loading';
      message.append('Não foi possível carregar o arquivo. ');
      const link = document.createElement('a');
      link.href = 'https://instagram.com/cavalcante.media';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Ver no Instagram';
      message.append(link);
      track.replaceChildren(message);
    };

    let projects;
    try {
      projects = JSON.parse(dataNode.textContent || '[]');
    } catch {
      showUnavailable();
      return;
    }
    if (/^https?:$/.test(location.protocol)) {
      try {
        const [portfolioResponse, catalogResponse] = await Promise.all([
          fetch('portfolio.json', { cache: 'no-store' }),
          fetch('project-catalog.json', { cache: 'no-store' })
        ]);
        if (portfolioResponse.ok && catalogResponse.ok) {
          const [portfolioData, catalogData] = await Promise.all([portfolioResponse.json(), catalogResponse.json()]);
          const normalizeUrl = value => String(value || '').split(/[?#]/)[0].replace(/\/$/, '');
          const catalogByUrl = new Map((catalogData.itens || []).map(item => [normalizeUrl(item.url), item]));
          const liveProjects = (portfolioData.itens || []).map((entry, index) => {
            const metadata = catalogByUrl.get(normalizeUrl(entry.url)) || {};
            return {
              id: metadata.id || `work-live-${index + 1}`,
              url: entry.url,
              titulo: entry.titulo || metadata.titulo || 'Trabalho Cavalcante',
              cliente: metadata.cliente || 'Outros trabalhos',
              grupo: metadata.grupo || 'outros',
              capa: metadata.capa || '',
              categoria: metadata.categoria || 'Filme'
            };
          }).filter(project => project.url);
          if (liveProjects.length) projects = liveProjects;
        }
      } catch {}
    }
    if (!Array.isArray(projects) || !projects.length) {
      showUnavailable();
      return;
    }

    const initials = name => {
      const words = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(word => word && !['de', 'da', 'do', 'dos', 'das', 'e', 'anos'].includes(word.toLowerCase()));
      if (/^[A-Z]{2,4}$/.test(words[0] || '')) return words[0];
      return words.slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'AC';
    };
    const playIcon = () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'icon icon-play');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.75');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'm9 7 8 5-8 5V7Z');
      svg.append(path);
      return svg;
    };
    const createCard = project => {
      const card = document.createElement('a');
      card.className = 'archive-card';
      card.href = project.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.dataset.group = project.grupo;
      card.dataset.event = 'archive_open';
      card.dataset.label = project.id || project.grupo;
      card.setAttribute('aria-label', `${project.titulo}, ${project.cliente}. Assistir no Instagram`);

      const media = document.createElement('span');
      media.className = 'archive-card-media';
      if (project.capa) {
        const image = document.createElement('img');
        image.src = project.capa;
        image.alt = `${project.titulo} — ${project.cliente}`;
        image.width = 1080;
        image.height = 1920;
        image.loading = 'lazy';
        image.decoding = 'async';
        media.append(image);
      } else {
        const poster = document.createElement('span');
        poster.className = 'archive-card-poster';
        const mark = document.createElement('b');
        mark.className = 'archive-card-mark';
        mark.textContent = initials(project.cliente);
        const signature = document.createElement('small');
        signature.textContent = 'Film / Cavalcante';
        poster.append(mark, signature);
        media.append(poster);
      }

      const topline = document.createElement('span');
      topline.className = 'archive-card-topline';
      const category = document.createElement('span');
      category.textContent = project.categoria || 'Filme';
      const open = document.createElement('span');
      open.className = 'archive-card-open';
      open.append(playIcon());
      topline.append(category, open);
      media.append(topline);

      const meta = document.createElement('span');
      meta.className = 'archive-card-meta';
      const client = document.createElement('span');
      client.className = 'archive-card-client';
      client.textContent = project.cliente;
      const title = document.createElement('strong');
      title.className = 'archive-card-title';
      title.textContent = project.titulo;
      meta.append(client, title);
      card.append(media, meta);
      return card;
    };

    const fragment = document.createDocumentFragment();
    projects.forEach(project => fragment.append(createCard(project)));
    track.replaceChildren(fragment);
    const cards = [...track.querySelectorAll('.archive-card')];
    const clients = [...new Map(projects.map(project => [project.grupo, project.cliente])).entries()];
    const filters = [['all', 'Todos'], ...clients];
    const tabButtons = filters.map(([group, label], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = `work-filter-${group}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', track.id);
      button.setAttribute('aria-selected', String(index === 0));
      button.tabIndex = index === 0 ? 0 : -1;
      button.dataset.filter = group;
      button.textContent = label;
      tabs.append(button);
      return button;
    });

    let archiveFrame = 0;
    const updateArchiveUi = () => {
      archiveFrame = 0;
      const limit = Math.max(0, track.scrollWidth - track.clientWidth);
      const ratio = limit ? Math.max(.08, Math.min(1, track.scrollLeft / limit)) : 1;
      if (progressBar) progressBar.style.transform = `scaleX(${ratio})`;
      if (previous) previous.disabled = track.scrollLeft <= 3;
      if (next) next.disabled = track.scrollLeft >= limit - 3;
    };
    const scheduleArchiveUi = () => {
      if (!archiveFrame) archiveFrame = requestAnimationFrame(updateArchiveUi);
    };
    const selectFilter = (group, announce = true) => {
      const selected = tabButtons.find(button => button.dataset.filter === group) || tabButtons[0];
      cards.forEach(card => { card.hidden = group !== 'all' && card.dataset.group !== group; });
      tabButtons.forEach(button => {
        const active = button === selected;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      const label = selected.textContent || 'Todos';
      track.setAttribute('aria-label', group === 'all' ? 'Trabalhos de todos os clientes' : `Trabalhos de ${label}`);
      track.setAttribute('aria-labelledby', selected.id);
      if (status && announce) status.textContent = group === 'all' ? 'Exibindo todos os trabalhos.' : `Exibindo trabalhos de ${label}.`;
      track.scrollTo({ left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      const tabLeft = selected.offsetLeft - (tabs.clientWidth - selected.offsetWidth) / 2;
      tabs.scrollTo({ left: Math.max(0, tabLeft), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      requestAnimationFrame(updateArchiveUi);
    };

    tabButtons.forEach(button => button.addEventListener('click', () => selectFilter(button.dataset.filter)));
    tabs.addEventListener('keydown', event => {
      const activeIndex = tabButtons.indexOf(document.activeElement);
      if (activeIndex < 0) return;
      let targetIndex = activeIndex;
      if (event.key === 'ArrowRight') targetIndex = (activeIndex + 1) % tabButtons.length;
      else if (event.key === 'ArrowLeft') targetIndex = (activeIndex - 1 + tabButtons.length) % tabButtons.length;
      else if (event.key === 'Home') targetIndex = 0;
      else if (event.key === 'End') targetIndex = tabButtons.length - 1;
      else return;
      event.preventDefault();
      tabButtons[targetIndex].focus();
      selectFilter(tabButtons[targetIndex].dataset.filter);
    });
    const moveTrack = direction => track.scrollBy({
      left: direction * Math.max(240, track.clientWidth * .82),
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
    previous?.addEventListener('click', () => moveTrack(-1));
    next?.addEventListener('click', () => moveTrack(1));
    track.addEventListener('scroll', scheduleArchiveUi, { passive: true });
    addEventListener('resize', scheduleArchiveUi, { passive: true });
    nav.hidden = false;
    selectFilter('all', false);
  };
  initWorkLibrary().catch(() => {});

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
    const activeTheme = themeRegions.filter(region => {
      const rect = region.getBoundingClientRect();
      return rect.top <= marker && rect.bottom > marker;
    }).at(-1) || activeScene;
    header?.classList.toggle('is-light', activeTheme?.dataset.headerTheme === 'light');
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
    const loadScene = () => import('./site-scene.js?v=20260915-7')
      .then(module => module.initGlobalScene(canvas, { mode, reducedMotion }))
      .catch(() => { root.dataset.performance = 'fallback'; });
    if ('requestIdleCallback' in window) requestIdleCallback(loadScene, { timeout: 900 });
    else setTimeout(loadScene, 80);
  }
})();

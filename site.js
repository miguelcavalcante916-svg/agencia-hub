(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  $('#year').textContent = new Date().getFullYear();
  const header = $('#site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const menu = $('#mobile-menu');
  const toggle = $('.menu-toggle');
  const background = [$('main'), $('.site-footer')];
  function setMenu(open, restore = false) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
    background.forEach(node => { node.inert = open; });
    if (open) $('a', menu).focus();
    else if (restore) toggle.focus();
  }
  toggle.addEventListener('click', () => setMenu(menu.hidden, !menu.hidden));
  $$('a', menu).forEach(link => link.addEventListener('click', () => {
    setMenu(false);
    const destination = $(link.getAttribute('href'));
    if (destination) {
      destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
      destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
    }
  }));
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') { setMenu(false, true); return; }
    if (event.key !== 'Tab') return;
    const focusable = [$('.brand'), $('.header-contact'), toggle, ...$$('a', menu)];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  // Keep the AgencyHub exporter contract: portfolio.json contains only URL + title.
  // Match its entries to the local catalog to add verified images and project details.
  const catalog = JSON.parse($('#project-catalog').textContent);
  const normalize = value => {
    try { const url = new URL(value); return url.hostname.replace(/^www\./, '') + url.pathname.replace(/\/$/, ''); }
    catch { return ''; }
  };
  const safeURL = value => {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; }
    catch { return null; }
  };
  let works = catalog.slice().sort((a, b) => Number(b.destaque) - Number(a.destaque));
  let filter = 'all', expanded = false;
  const grid = $('#work-grid');
  const more = $('#more-work');
  const dialog = $('#project-dialog');
  let dialogTrigger = null;
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function card(item, index) {
    const article = element('article', 'work-card'); article.dataset.group = item.grupo;
    const link = element('a', 'work-cover');
    link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Conhecer o projeto ${item.titulo}`);
    if (item.capa) {
      link.dataset.project = item.id;
      const img = element('img'); img.src = item.capa; img.alt = `${item.titulo} — ${item.cliente}`;
      img.width = 1080; img.height = 1920; img.loading = 'lazy'; img.decoding = 'async'; link.append(img);
    } else {
      link.classList.add('work-cover-fallback');
      link.append(element('strong', '', item.titulo));
    }
    link.append(element('span', 'work-number', `${String(index + 1).padStart(2, '0')} / FILMES & CAMPANHAS`));
    const arrow = element('span', 'work-open', '↗'); arrow.setAttribute('aria-hidden', 'true'); link.append(arrow);
    const caption = element('span', 'work-caption', item.capa ? 'Conhecer o projeto' : 'Ver o trabalho');
    const arrow2 = element('span', '', '↗'); arrow2.setAttribute('aria-hidden', 'true'); caption.append(arrow2); link.append(caption);
    const meta = element('div', 'work-meta'); meta.append(element('h3', '', item.cliente || item.titulo), element('p', '', item.categoria || 'Projeto Cavalcante'));
    article.append(link, meta); return article;
  }
  function renderWorks(announce = true) {
    const selected = filter === 'all' ? works : works.filter(item => item.grupo === filter);
    const visible = filter === 'all' && !expanded ? selected.slice(0, 3) : selected;
    grid.replaceChildren(...visible.map(card));
    if (!visible.length) {
      const message = element('p', 'work-empty', 'Novos trabalhos por aqui em breve. Acompanhe nossas publicações no Instagram.'); grid.append(message);
    }
    more.hidden = filter !== 'all' || selected.length <= 3;
    more.firstChild.textContent = expanded ? 'Mostrar projetos selecionados ' : `Ver todos os ${works.length} trabalhos `;
    more.setAttribute('aria-expanded', String(expanded));
    $$('.work-filters button').forEach(button => {
      const active = button.dataset.filter === filter; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active));
    });
    if (announce) $('#work-announcement').textContent = `${visible.length} ${visible.length === 1 ? 'projeto exibido' : 'projetos exibidos'}.`;
  }
  $$('.work-filters button').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; expanded = false; renderWorks(); }));
  more.addEventListener('click', () => {
    expanded = !expanded; renderWorks();
    if (!expanded) $('#work-title').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
  });
  function closeProject() { dialog.close(); }
  $('.dialog-close').addEventListener('click', closeProject);
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); dialogTrigger?.focus({ preventScroll: true }); });
  grid.addEventListener('click', event => {
    const link = event.target.closest('a[data-project]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const item = works.find(work => work.id === link.dataset.project);
    if (!item || typeof dialog.showModal !== 'function') return;
    event.preventDefault(); dialogTrigger = link;
    $('#project-title').textContent = item.titulo;
    $('#project-client').textContent = item.cliente;
    $('#project-category').textContent = item.categoria;
    $('#project-description').textContent = item.descricao;
    $('#project-image').src = item.capa; $('#project-image').alt = item.titulo;
    $('#project-link').href = item.url;
    $('#project-contact').href = `https://wa.me/5584999492725?text=${encodeURIComponent(`Olá! Vi o projeto “${item.titulo}” no site e quero conversar sobre algo para a minha marca.`)}`;
    dialog.showModal(); dialog.scrollTop = 0; document.body.classList.add('dialog-open');
  });
  renderWorks(false);
  fetch('portfolio.json', { cache: 'no-cache' }).then(response => {
    if (!response.ok) throw new Error('Portfolio unavailable'); return response.json();
  }).then(data => {
    if (!Array.isArray(data.itens)) return;
    const seen = new Set();
    const entries = data.itens.flatMap((entry, index) => {
      if (!entry || typeof entry.titulo !== 'string' || typeof entry.url !== 'string') return [];
      const url = safeURL(entry.url), key = normalize(entry.url);
      if (!url || seen.has(key)) return []; seen.add(key);
      const known = catalog.find(item => normalize(item.url) === key);
      return [{ ...(known || { id: `external-${index}`, grupo: 'other', cliente: '', categoria: 'Projeto Cavalcante' }), titulo: entry.titulo, url }];
    });
    // Invalid nonempty payloads should not erase the verified static portfolio.
    if (data.itens.length && !entries.length) return;
    works = entries; renderWorks(false);
  }).catch(() => { /* The embedded verified catalog remains usable offline. */ });

  const steps = $$('.method-steps li');
  const captions = ['Primeiro, entender o seu negócio.', 'Uma ideia encontra sua direção.', 'A estratégia ganha forma.', 'A mensagem encontra seu público.', 'Aprender. Ajustar. Continuar.'];
  let activeStep = 0, drawMethod = () => {};
  function selectStep(index) {
    activeStep = index;
    steps.forEach((step, i) => { step.classList.toggle('is-active', i === index); $('button', step).setAttribute('aria-pressed', String(i === index)); });
    $('#method-count').textContent = `${String(index + 1).padStart(2, '0')} / 05`;
    $('#method-caption').textContent = captions[index]; drawMethod(index);
  }
  steps.forEach((step, index) => $('button', step).addEventListener('click', () => selectStep(index)));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (innerWidth <= 800) return;
      const visible = entries.filter(entry => entry.isIntersecting);
      if (visible.length) selectStep(Number(visible[0].target.dataset.step));
    }, { rootMargin: '-30% 0px -50% 0px' });
    steps.forEach(step => observer.observe(step));
  }
  // Progressive enhancement: typography, navigation and case links work without WebGL.
  const loadScene = () => import('./site-scene.js?v=20260910').then(scene => {
    drawMethod = scene.initMethod($('#method-canvas'), reduceMotion); drawMethod(activeStep);
    if (!reduceMotion.matches && !navigator.connection?.saveData) scene.initHero($('#hero-canvas'), reduceMotion).catch(() => {});
  }).catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(loadScene, { timeout: 1800 });
  else setTimeout(loadScene, 150);
})();

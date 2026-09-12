/* Native scrolling: cached document measurements, grouped reads and writes. */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const shell = hero.parentElement;
  const progress = document.querySelector('.reading-progress');
  const vision = document.querySelector('#vision');
  const lines = [...document.querySelectorAll('.manifesto-line')];
  const links = [...document.querySelectorAll('.chapter-nav a')];
  const nav = [...document.querySelectorAll('.desktop-nav a')];
  const sections = links.map(link => document.querySelector(link.hash));
  let frame = 0, measureFrame = 0, current = -1, bounds;
  const clamp = value => Math.max(0, Math.min(1, value));
  function measure() {
    measureFrame = 0;
    const top = scrollY;
    const shellRect = shell.getBoundingClientRect();
    const visionRect = vision.getBoundingClientRect();
    bounds = {
      start: shellRect.top + top,
      travel: getComputedStyle(hero).position === 'sticky' ? Math.max(0, shell.offsetHeight - innerHeight) : 0,
      visionTop: visionRect.top + top,
      visionHeight: visionRect.height,
      height: innerHeight,
      distance: Math.max(1, document.documentElement.scrollHeight - innerHeight),
      sections: sections.map(section => section.getBoundingClientRect().top + top)
    };
    schedule();
  }
  function update() {
    frame = 0;
    if (!bounds) return;
    const y = scrollY;
    const phase = clamp((y + bounds.height * .8 - bounds.visionTop) / Math.max(1, bounds.visionHeight * .65));
    const heroPhase = !motion.matches && bounds.travel > 1 ? clamp((y - bounds.start) / bounds.travel) : 0;
    let active = 0;
    bounds.sections.forEach((top, index) => { if (top <= y + bounds.height * .45) active = index; });
    // All geometry above is cached. The remaining operations only update compositor styles.
    document.querySelector('.chapter-nav').classList.toggle('is-quiet', y < bounds.start + bounds.height * .7);
    progress.style.setProperty('--reading', clamp(y / bounds.distance));
    hero.style.setProperty('--hero-progress', heroPhase);
    hero.style.setProperty('--word-change', clamp((heroPhase - .12) / .4));
    hero.style.setProperty('--stage-opacity', 1 - clamp((heroPhase - .65) / .35) * .6);
    lines.forEach((line, index) => line.style.setProperty('--line-light', motion.matches ? 1 : .4 + .6 * clamp(phase * 4 - index + .6)));
    if (active !== current) {
      current = active;
      links.forEach((link, index) => index === active ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
      nav.forEach(link => link.hash === links[active].hash ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function scheduleMeasure() { if (!measureFrame) measureFrame = requestAnimationFrame(measure); }
  const resize = new ResizeObserver(scheduleMeasure);
  resize.observe(document.body); resize.observe(shell); resize.observe(vision);
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', scheduleMeasure, {passive: true});
  addEventListener('pageshow', scheduleMeasure);
  document.fonts.ready.then(scheduleMeasure);
  motion.addEventListener('change', scheduleMeasure);
  addEventListener('pagehide', event => {
    cancelAnimationFrame(frame); cancelAnimationFrame(measureFrame); frame = measureFrame = 0;
    if (event.persisted) return;
    resize.disconnect();
    removeEventListener('scroll', schedule); removeEventListener('resize', scheduleMeasure);
    removeEventListener('pageshow', scheduleMeasure); motion.removeEventListener('change', scheduleMeasure);
  });
  measure();
})();

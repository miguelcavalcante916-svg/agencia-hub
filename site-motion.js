/* Native scrolling, with optional visual enhancements and no scroll interception. */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const progress = document.querySelector('.reading-progress');
  const vision = document.querySelector('#vision');
  const lines = [...document.querySelectorAll('.manifesto-line')];
  const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
  const chapters = chapterLinks.map(link => document.querySelector(link.hash));
  let frame = 0;
  function update() {
    frame = 0;
    const rect = vision.getBoundingClientRect();
    const phase = Math.max(0, Math.min(1, (innerHeight * .75 - rect.top) / Math.max(1, rect.height * .7)));
    lines.forEach((line, index) => line.style.setProperty('--line-light', motion.matches ? 1 : .35 + .65 * Math.max(0, Math.min(1, phase * 3 - index + .6))));
    let active = 0;
    chapters.forEach((section, index) => { if (section.getBoundingClientRect().top <= innerHeight * .45) active = index; });
    chapterLinks.forEach((link, index) => { if (index === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--reading', distance > 0 ? scrollY / distance : 0);
    hero.style.setProperty('--hero-progress', motion.matches ? 0 : Math.min(1, scrollY / hero.offsetHeight));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  motion.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(document.body);
  update();

  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.remove('is-pending');
        target.classList.add('is-visible');
        reveals.unobserve(target);
      });
    }, { rootMargin: '0px 0px -35px 0px', threshold: .08 });
    if (!motion.matches) {
      document.querySelectorAll('.manifesto-bottom,.section-heading,.services-intro,.service,.portal-copy,.portal-preview,.faq-layout,.contact-main').forEach(node => {
        if (node.getBoundingClientRect().top < innerHeight) return;
        node.classList.add('reveal-target', 'is-pending');
        reveals.observe(node);
      });
    }
    motion.addEventListener('change', () => {
      if (motion.matches) {
        reveals.disconnect();
        document.querySelectorAll('.is-pending').forEach(node => node.classList.remove('is-pending'));
      }
    });
    const nav = [...document.querySelectorAll('.desktop-nav a')];
    const sections = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        nav.forEach(link => {
          if (link.hash === '#' + target.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    document.querySelectorAll('main > section').forEach(section => sections.observe(section));
  }
})();

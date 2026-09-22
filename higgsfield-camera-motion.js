(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const heroImage = document.querySelector('.hero-art-generated .hero-fallback');
  if (heroImage) {
    gsap.timeline({
      scrollTrigger: { trigger: '#arrival', start: 'top top', end: 'bottom top', scrub: 1.15 }
    })
      .to(heroImage, { scale: 1.2, xPercent: -6, yPercent: 3, rotate: .6, ease: 'none' }, 0)
      .to('.hero-copy', { yPercent: -28, opacity: .25, ease: 'none' }, 0)
      .to('.hero-aside', { yPercent: -18, opacity: 0, ease: 'none' }, 0)
      .to('.hero-wordmark', { xPercent: -5, opacity: .2, ease: 'none' }, 0);
  }

  gsap.fromTo('.art-glass-section', { '--camera-x': '5%' }, {
    '--camera-x': '-5%', ease: 'none',
    scrollTrigger: { trigger: '.art-glass-section', start: 'top bottom', end: 'bottom top', scrub: 1.4 }
  });
  gsap.to('.art-glass-section', {
    backgroundPosition: '45% 50%', ease: 'none',
    scrollTrigger: { trigger: '.art-glass-section', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
  });

  document.querySelectorAll('.section-heading, .work-compact-head, .portal-copy, .faq-layout').forEach((block) => {
    gsap.from(block.children, {
      y: 64, opacity: 0, rotateX: 5, transformOrigin: '50% 100%',
      duration: 1.15, stagger: .1, ease: 'power3.out',
      scrollTrigger: { trigger: block, start: 'top 84%', once: true }
    });
  });

  gsap.to('.art-film-section', {
    backgroundPosition: '55% 50%', ease: 'none',
    scrollTrigger: { trigger: '.art-film-section', start: 'top bottom', end: 'bottom top', scrub: 1.35 }
  });

  const cards = gsap.utils.toArray('.archive-card');
  if (cards.length) gsap.from(cards, {
    y: 80, opacity: 0, scale: .96, duration: 1, stagger: .055, ease: 'power3.out',
    scrollTrigger: { trigger: '#work-library-track', start: 'top 88%', once: true }
  });
})();

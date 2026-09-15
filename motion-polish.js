(() => {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('motion-ready');

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (min, value, max) => Math.max(min, Math.min(value, max));
  const animations = [];
  let workAnimations = [];
  let workRefreshTimer = 0;

  const hero = document.querySelector('.hero');
  const heroLight = hero?.querySelector('.hero-light');
  const heroArt = document.querySelector('.hero-art');
  const heroWordmark = document.querySelector('.hero-wordmark');
  const heroCopy = document.querySelector('.hero-copy');
  const heroAside = document.querySelector('.hero-aside');
  const methodVisual = document.querySelector('.method-visual');

  if ('IntersectionObserver' in window) {
    const activityObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-motion-visible', entry.isIntersecting));
    }, { rootMargin: '12% 0px', threshold: .05 });
    if (hero) activityObserver.observe(hero);
    if (methodVisual) activityObserver.observe(methodVisual);
  }

  function add(animation) {
    animations.push(animation);
    return animation;
  }

  function buildHeroMotion() {
    if (!hero || !heroWordmark || !heroArt) return;

    add(gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(heroArt, { scale: .965, opacity: .72 }, { scale: 1, opacity: 1, duration: .8 }, 0)
      .fromTo(heroWordmark,
        { clipPath: 'inset(0 100% 0 0)', xPercent: -1.5 },
        { clipPath: 'inset(0 0% 0 0)', xPercent: 0, duration: .8 }, 0)
      .fromTo(['.hero-topline', '.hero-copy', '.hero-aside', '.hero-bottom'],
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: .64, stagger: .055 }, .16));

    add(gsap.timeline({
      scrollTrigger: {
        trigger: '.experience-shell',
        start: 'top top',
        end: 'bottom top',
        scrub: .9,
        invalidateOnRefresh: true
      },
      defaults: { ease: 'none' }
    })
      .to(heroWordmark, { yPercent: -13, scale: 1.045 }, 0)
      .to(heroCopy, { yPercent: -24 }, 0)
      .to(heroAside, { yPercent: -14 }, 0)
      .to('.hero-topline', { yPercent: -55, opacity: .18 }, 0)
      .to('.hero-bottom', { yPercent: 55, opacity: 0 }, .08)
      .to(heroArt, { yPercent: -4, scale: 1.035 }, 0));

    if (!finePointer.matches) return;
    const moveWordmark = gsap.quickTo(heroWordmark, 'x', { duration: .8, ease: 'power3.out' });
    const moveCopy = gsap.quickTo(heroCopy, 'x', { duration: .8, ease: 'power3.out' });
    const moveAside = gsap.quickTo(heroAside, 'x', { duration: .8, ease: 'power3.out' });
    const moveTopline = gsap.quickTo('.hero-topline', 'x', { duration: .8, ease: 'power3.out' });
    const moveLightX = heroLight ? gsap.quickTo(heroLight, 'x', { duration: 1.1, ease: 'power3.out' }) : null;
    const moveLightY = heroLight ? gsap.quickTo(heroLight, 'y', { duration: 1.1, ease: 'power3.out' }) : null;

    const move = event => {
      const rect = hero.getBoundingClientRect();
      const x = clamp(-1, ((event.clientX - rect.left) / rect.width) * 2 - 1, 1);
      const y = clamp(-1, ((event.clientY - rect.top) / rect.height) * 2 - 1, 1);
      moveWordmark(x * 4);
      moveCopy(x * 2.5);
      moveAside(x * -3.5);
      moveTopline(x * 3);
      moveLightX?.(x * 22);
      moveLightY?.(y * 14);
    };
    const reset = () => {
      moveWordmark(0);
      moveCopy(0);
      moveAside(0);
      moveTopline(0);
      moveLightX?.(0);
      moveLightY?.(0);
    };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', reset);
  }

  function buildManifestoMotion() {
    const lines = [...document.querySelectorAll('.manifesto-line')];
    if (!lines.length) return;

    lines.forEach((line, index) => {
      add(gsap.fromTo(line,
        {
          clipPath: index % 2 ? 'inset(0 0 0 16%)' : 'inset(0 16% 0 0)',
          xPercent: index % 2 ? 5 : -5
        },
        {
          clipPath: 'inset(0 0% 0 0%)',
          xPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '#vision',
            start: `top ${88 - index * 7}%`,
            end: `top ${51 - index * 5}%`,
            scrub: .75
          }
        }));
    });
  }

  function clearWorkMotion() {
    workAnimations.forEach(animation => {
      animation.scrollTrigger?.kill();
      animation.kill();
    });
    workAnimations = [];
  }

  function buildWorkMotion() {
    clearWorkMotion();
    const cards = [...document.querySelectorAll('.work-grid.is-featured .work-card')];
    cards.forEach((card, index) => {
      const cover = card.querySelector('.work-cover');
      const story = card.querySelector('.work-story');
      if (!cover || !story) return;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 94%',
          end: 'top 20%',
          scrub: .85,
          invalidateOnRefresh: true
        },
        defaults: { ease: 'none' }
      })
        .fromTo(card,
          { clipPath: 'inset(7% 2.5% 7% 2.5% round 4px)', scale: .985 },
          { clipPath: 'inset(0% 0% 0% 0% round 4px)', scale: 1 }, 0)
        .fromTo(cover,
          { yPercent: index % 2 ? 3 : -3, scale: 1.045 },
          { yPercent: 0, scale: 1 }, 0)
        .fromTo(story,
          { xPercent: index % 2 ? -5 : 5 },
          { xPercent: 0 }, .08);
      workAnimations.push(timeline);

      const next = cards[index + 1];
      if (next && innerWidth >= 1000) {
        const settle = gsap.to(card, {
          scale: .965,
          yPercent: -1.5,
          ease: 'none',
          scrollTrigger: {
            trigger: next,
            start: 'top 92%',
            end: 'top 18%',
            scrub: .7
          }
        });
        workAnimations.push(settle);
      }
    });
    ScrollTrigger.refresh();
  }

  function buildSectionMotion() {
    const workHeading = document.querySelector('#work .section-heading');
    if (workHeading) {
      add(gsap.fromTo(workHeading.querySelector('h2'),
        { clipPath: 'inset(0 0 100% 0)', yPercent: 14 },
        {
          clipPath: 'inset(0 0 0% 0)', yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: workHeading, start: 'top 88%', end: 'top 56%', scrub: .7 }
        }));
      add(gsap.fromTo(workHeading.querySelector('p'),
        { xPercent: 12 },
        { xPercent: 0, ease: 'none', scrollTrigger: { trigger: workHeading, start: 'top 88%', end: 'top 58%', scrub: .7 } }));
    }

    if (methodVisual) {
      add(gsap.fromTo(methodVisual,
        { rotateY: -7, rotateX: 3, yPercent: 5, transformPerspective: 1200 },
        {
          rotateY: 0, rotateX: 0, yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: '#method', start: 'top 88%', end: 'top 40%', scrub: .8 }
        }));
    }

    const portal = document.querySelector('#portal');
    const preview = portal?.querySelector('.portal-preview');
    const portalLight = portal?.querySelector('.portal-light');
    if (portal && preview) {
      add(gsap.timeline({
        scrollTrigger: { trigger: portal, start: 'top 88%', end: 'center 48%', scrub: .9 },
        defaults: { ease: 'none' }
      })
        .fromTo(preview,
          { xPercent: 10, rotateY: -14, rotateX: 5, scale: .94, transformPerspective: 1400 },
          { xPercent: 0, rotateY: -4, rotateX: 1, scale: 1 }, 0)
        .fromTo('.preview-greeting', { y: 34, z: 80 }, { y: 0, z: 26 }, .05)
        .fromTo('.preview-project', { y: 54, z: 120 }, { y: 0, z: 42 }, .12)
        .fromTo('.preview-approval', { y: 72, z: 150 }, { y: 0, z: 56 }, .2)
        .fromTo('.preview-footer', { y: 28, z: 70 }, { y: 0, z: 18 }, .28));

      if (finePointer.matches) {
        const movePortalLightX = portalLight ? gsap.quickTo(portalLight, 'x', { duration: .9, ease: 'power3.out' }) : null;
        const movePortalLightY = portalLight ? gsap.quickTo(portalLight, 'y', { duration: .9, ease: 'power3.out' }) : null;
        portal.addEventListener('pointermove', event => {
          const rect = portal.getBoundingClientRect();
          const x = clamp(-1, ((event.clientX - rect.left) / rect.width) * 2 - 1, 1);
          const y = clamp(-1, ((event.clientY - rect.top) / rect.height) * 2 - 1, 1);
          movePortalLightX?.(x * 18);
          movePortalLightY?.(y * 12);
        }, { passive: true });
        portal.addEventListener('pointerleave', () => {
          movePortalLightX?.(0);
          movePortalLightY?.(0);
        });
      }
    }

    const contactKnight = document.querySelector('.contact-knight');
    if (contactKnight) {
      add(gsap.fromTo(contactKnight,
        { xPercent: 34, yPercent: 16, rotate: -11, opacity: 0 },
        {
          xPercent: 0, yPercent: 0, rotate: -2, opacity: .1, ease: 'none',
          scrollTrigger: { trigger: '#contact', start: 'top 90%', end: 'center 55%', scrub: .85 }
        }));
    }
  }

  function buildCaseCursor() {
    if (!finePointer.matches) return;
    const cursor = document.createElement('div');
    cursor.className = 'case-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = 'Ver case';
    document.body.append(cursor);
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const moveX = gsap.quickTo(cursor, 'x', { duration: .32, ease: 'power3.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: .32, ease: 'power3.out' });

    addEventListener('pointermove', event => {
      moveX(event.clientX);
      moveY(event.clientY);
    }, { passive: true });

    document.addEventListener('pointerover', event => {
      if (!event.target.closest?.('.work-cover')) return;
      gsap.to(cursor, { opacity: 1, scale: 1, duration: .18, ease: 'power3.out', overwrite: true });
    });
    document.addEventListener('pointerout', event => {
      const cover = event.target.closest?.('.work-cover');
      if (!cover || cover.contains(event.relatedTarget)) return;
      gsap.to(cursor, { opacity: 0, scale: .88, duration: .14, ease: 'power3.out', overwrite: true });
    });
  }

  function buildDiagnostics() {
    window.CavalcanteVitals = { fps: null, lcp: null, cls: 0, inp: null };
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) window.CavalcanteVitals.lcp = Math.round(last.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {}
      try {
        new PerformanceObserver(list => list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) window.CavalcanteVitals.cls += entry.value;
        })).observe({ type: 'layout-shift', buffered: true });
      } catch {}
      try {
        new PerformanceObserver(list => list.getEntries().forEach(entry => {
          window.CavalcanteVitals.inp = Math.max(window.CavalcanteVitals.inp || 0, entry.duration || 0);
        })).observe({ type: 'event', buffered: true, durationThreshold: 40 });
      } catch {}
    }

    if (new URLSearchParams(location.search).get('motionDebug') !== '1') return;
    const panel = document.createElement('div');
    panel.className = 'motion-debug';
    panel.setAttribute('aria-hidden', 'true');
    document.body.append(panel);
    let frames = 0;
    let started = performance.now();
    const countFrames = now => {
      frames += 1;
      if (now - started >= 1000) {
        window.CavalcanteVitals.fps = Math.round(frames * 1000 / (now - started));
        frames = 0;
        started = now;
      }
      requestAnimationFrame(countFrames);
    };
    requestAnimationFrame(countFrames);
    setInterval(() => {
      const values = window.CavalcanteVitals;
      panel.textContent = [
        `motion / ${reducedMotion.matches ? 'reduced' : 'full'}`,
        `fps / ${values.fps ?? '—'}`,
        `lcp / ${values.lcp ? `${values.lcp}ms` : '—'}`,
        `cls / ${values.cls.toFixed(3)}`,
        `inp / ${values.inp ? `${Math.round(values.inp)}ms` : '—'}`
      ].join('\n');
    }, 500);
  }

  const build = () => {
    buildDiagnostics();
    if (reducedMotion.matches) return;
    buildHeroMotion();
    buildManifestoMotion();
    buildSectionMotion();
    buildWorkMotion();
    buildCaseCursor();

    const grid = document.querySelector('#work-grid');
    if (grid) {
      const observer = new MutationObserver(() => {
        clearTimeout(workRefreshTimer);
        workRefreshTimer = setTimeout(buildWorkMotion, 80);
      });
      observer.observe(grid, { childList: true });
      addEventListener('pagehide', () => observer.disconnect(), { once: true });
    }
  };

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', build, { once: true });
  else build();

  addEventListener('pagehide', event => {
    if (event.persisted) return;
    clearWorkMotion();
    animations.forEach(animation => {
      animation.scrollTrigger?.kill();
      animation.kill?.();
    });
  }, { once: true });
})();

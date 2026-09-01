(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const debug = new URLSearchParams(location.search).get('debugMotion') === '1';
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const clamp = (value, min = -1, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;

  if (reduced || !gsap || !ScrollTrigger) {
    root.classList.add('motion-native-fallback');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const debugPanel = debug ? (() => {
    const panel = document.createElement('aside');
    panel.className = 'motion-debug-panel';
    panel.setAttribute('aria-hidden', 'true');
    document.body.appendChild(panel);
    return panel;
  })() : null;

  const updateDebug = state => {
    if (!debugPanel) return;
    debugPanel.textContent = [
      'CAVALCANTE / MOTION DEBUG',
      `scene: ${state.scene || 'arrival'}`,
      `progress: ${(state.progress || 0).toFixed(3)}`,
      `velocity: ${(state.velocity || 0).toFixed(3)}`,
      `reduced: ${reduced ? 'yes' : 'no'}`,
    ].join('\n');
  };

  let lastState = { scene: 'arrival', progress: 0, velocity: 0 };
  const setState = (scene, progress, velocity = 0) => {
    lastState = { scene, progress, velocity };
    root.style.setProperty('--motion-progress', progress.toFixed(4));
    root.style.setProperty('--scroll-velocity', velocity.toFixed(4));
    root.style.setProperty('--scroll-speed', Math.abs(velocity).toFixed(4));
    updateDebug(lastState);
  };

  const settleVelocity = () => {
    gsap.to(root, {
      '--scroll-velocity': 0,
      duration: .6,
      ease: 'power3.out',
      overwrite: true,
    });
  };

  const context = gsap.context(() => {
    const arrival = document.querySelector('.arrival');
    const method = document.querySelector('.method');
    const reel = document.querySelector('.reel');
    const work = document.querySelector('.work');
    const portal = document.querySelector('.portal');
    const phaseWords = [...document.querySelectorAll('.phase-word')];
    const phaseSymbols = [...document.querySelectorAll('.phase-symbols span')];
    const portalLayers = [...document.querySelectorAll('.portal-layer')];
    const workPlanes = [...document.querySelectorAll('.work-plane')];
    const canvas = document.querySelector('.global-webgl');

    const track = (scene, self) => {
      const velocity = clamp(self.getVelocity() / 1800);
      setState(scene, self.progress, velocity);
      if (Math.abs(velocity) > .08) {
        gsap.to(root, {
          '--scroll-velocity': velocity,
          duration: .24,
          ease: 'power3.out',
          overwrite: true,
        });
      } else {
        settleVelocity();
      }
    };

    if (arrival) {
      gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: arrival,
          start: 'top top',
          end: 'bottom bottom',
          scrub: .72,
          invalidateOnRefresh: true,
          onUpdate: self => track('arrival', self),
        },
      })
        .to(root, { '--camera-arrival': 1, duration: .28, ease: 'expo.out' }, 0)
        .to('.hero-copy.back .line-a', { x: '-5vw', y: '-7vh', rotation: -3, duration: .22 }, 0)
        .to('.hero-copy.back .line-b', { x: '6vw', y: '8vh', rotation: 2, duration: .24 }, .08)
        .to('.hero-copy.front', { x: '2vw', y: '-2vh', scale: 1.06, duration: .26, ease: 'power4.out' }, .28)
        .to('.move-path', { x: '3vw', y: '-2vh', rotation: 4, duration: .3, ease: 'power3.inOut' }, .2)
        .to(canvas, { scale: 1.08, y: '-1.5vh', duration: .34, ease: 'expo.out' }, .1)
        .to('.arrival-meta', { x: '-2vw', duration: .36, ease: 'power2.inOut' }, .5)
        .to('.arrival-status', { x: '2vw', duration: .36, ease: 'power2.inOut' }, .5);
    }

    if (method) {
      const timeline = gsap.timeline({
        defaults: { ease: 'power4.inOut' },
        scrollTrigger: {
          trigger: method,
          start: 'top top',
          end: 'bottom bottom',
          scrub: .85,
          invalidateOnRefresh: true,
          onUpdate: self => track('think/create/scale', self),
        },
      });

      if (phaseWords[0]) timeline.to(phaseWords[0], { x: '-5vw', y: '-1.5vh', rotation: -5, scale: .94, duration: .28 }, 0);
      if (phaseWords[1]) timeline.to(phaseWords[1], { x: '0vw', y: '0vh', rotation: 0, scale: 1.07, duration: .28, ease: 'expo.out' }, .34);
      if (phaseWords[2]) timeline.to(phaseWords[2], { x: '5vw', y: '2vh', rotation: 5, scale: 1.04, duration: .32, ease: 'power3.out' }, .65);
      if (phaseSymbols.length) timeline.to(phaseSymbols, { rotation: '+=18', scale: 1.12, duration: .5, stagger: .06, ease: 'power3.inOut' }, .25);
      timeline.to(root, { '--method-camera': 1, duration: .34, ease: 'power3.inOut' }, .48);
    }

    if (reel && !reel.hidden) {
      gsap.timeline({
        scrollTrigger: {
          trigger: reel,
          start: 'top top',
          end: 'bottom bottom',
          scrub: .9,
          invalidateOnRefresh: true,
          onUpdate: self => track('horse/showreel', self),
        },
      })
        .to('.reel-window', { rotation: 0, scale: 1.08, duration: .36, ease: 'expo.out' }, .08)
        .to('.reel-window', { borderRadius: 0, duration: .4, ease: 'power3.inOut' }, .34)
        .to('.reel-overlays', { letterSpacing: '.28em', duration: .28, ease: 'power2.out' }, .44)
        .to(root, { '--reel-camera': 1, duration: .3, ease: 'power4.out' }, .6);
    }

    if (work && !work.hidden) {
      gsap.timeline({
        scrollTrigger: {
          trigger: work,
          start: 'top top',
          end: 'bottom bottom',
          scrub: .8,
          invalidateOnRefresh: true,
          onUpdate: self => {
            track('work/cases', self);
            const velocity = clamp(self.getVelocity() / 2000);
            workPlanes.forEach((plane, index) => {
              gsap.to(plane, {
                skewX: velocity * (index % 2 ? -2.5 : 2.5),
                duration: .35,
                overwrite: true,
                ease: 'power3.out',
              });
            });
          },
          onScrubComplete: settleVelocity,
        },
      })
        .to(workPlanes, { y: '-4vh', duration: .25, stagger: .12, ease: 'power3.out' }, 0)
        .to(workPlanes, { scale: 1.06, duration: .35, stagger: .1, ease: 'expo.out' }, .35)
        .to(root, { '--work-camera': 1, duration: .34, ease: 'power3.inOut' }, .62);
    }

    if (portal) {
      const portalTimeline = gsap.timeline({
        defaults: { ease: 'power4.inOut' },
        scrollTrigger: {
          trigger: portal,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: self => track('portal/no black box', self),
          onScrubComplete: settleVelocity,
        },
      });

      if (portalLayers[0]) portalTimeline.to(portalLayers[0], { x: '-4vw', y: '-5vh', z: 90, rotationY: 7, duration: .2 }, .16);
      if (portalLayers[1]) portalTimeline.to(portalLayers[1], { x: '5vw', y: '3vh', z: 160, rotationY: -8, duration: .22 }, .38);
      if (portalLayers[2]) portalTimeline.to(portalLayers[2], { x: '-2vw', y: '7vh', z: 230, rotationY: 10, duration: .22 }, .58);
      portalTimeline
        .to('.portal-device', { rotationX: 0, rotationY: -4, scale: 1.06, duration: .32, ease: 'expo.out' }, .42)
        .to('.portal-headline', { x: '-3vw', duration: .38, ease: 'power3.inOut' }, .45)
        .to(root, { '--portal-camera': 1, duration: .28, ease: 'power3.out' }, .7);
    }

    ScrollTrigger.refresh();
  });

  const refresh = () => ScrollTrigger.refresh();
  addEventListener('load', refresh, { once: true, passive: true });
  addEventListener('resize', refresh, { passive: true });
  addEventListener('orientationchange', refresh, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});

  window.CavalcanteMotion = {
    refresh,
    destroy: () => context.revert(),
    state: () => ({ ...lastState }),
  };

  updateDebug(lastState);
})();

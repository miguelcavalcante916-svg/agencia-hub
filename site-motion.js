(() => {
  'use strict';

  const root = document.documentElement;
  const phases = [...document.querySelectorAll('.phase')];
  const phaseNav = [...document.querySelectorAll('.phase-nav span')];
  const nodes = [...document.querySelectorAll('.knight-node')];
  const detail = document.querySelector('.knight-detail');
  const debugPanel = document.querySelector('#motion-debug');
  const debug = new URLSearchParams(location.search).get('motionDebug') === '1';
  const motionReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 900px)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const clamp = value => Math.max(0, Math.min(1, value));
  const sceneState = { scene: 'arrival', progress: 0, velocity: 0 };
  const method = [
    ['01 / Diagnóstico', 'A direção começa pelo que precisa mudar.'],
    ['02 / Direção', 'Briefing, posicionamento e linguagem apontam a próxima jogada.'],
    ['03 / Produção', 'Roteiro, captação, edição e design transformam intenção em presença.'],
    ['04 / Distribuição', 'A mensagem encontra formato, contexto e público.'],
    ['05 / Acompanhamento', 'A leitura do trabalho orienta os ajustes que mantêm a campanha viva.'],
    ['06 / Resultado', 'A consequência do processo aparece: cada decisão se conecta ao objetivo inicial.']
  ];

  window.CavalcanteMotionState = sceneState;
  const setScene = (scene, progress, velocity = 0) => {
    sceneState.scene = scene;
    sceneState.progress = clamp(progress);
    sceneState.velocity = Math.max(-1, Math.min(1, velocity));
    window.CavalcanteScene?.setState(sceneState);
  };
  const track = scene => self => {
    const velocity = self.getVelocity ? self.getVelocity() / 2100 : 0;
    setScene(scene, self.progress, velocity);
  };

  let debugFrame = 0;
  let frameCount = 0;
  let fps = 60;
  let stamp = performance.now();
  const countFrame = now => {
    frameCount += 1;
    if (now - stamp >= 500) {
      fps = Math.round(frameCount * 1000 / (now - stamp));
      frameCount = 0;
      stamp = now;
      if (debugPanel) {
        debugPanel.hidden = false;
        debugPanel.textContent = [
          'CAVALCANTE / MOTION',
          `scene      ${sceneState.scene}`,
          `progress   ${sceneState.progress.toFixed(3)}`,
          `velocity   ${sceneState.velocity.toFixed(3)}`,
          `fps        ${fps}`,
          `mode       ${root.dataset.performance}`
        ].join('\n');
      }
    }
    debugFrame = requestAnimationFrame(countFrame);
  };
  if (debug) debugFrame = requestAnimationFrame(countFrame);
  addEventListener('pagehide', () => {
    if (debugFrame) cancelAnimationFrame(debugFrame);
  }, { once: true });

  if (motionReduced || !gsap || !ScrollTrigger) {
    root.classList.add('motion-fallback');
    root.style.setProperty('--system-progress', '1');
    root.style.setProperty('--knight-progress', '1');
    phases.forEach(phase => {
      phase.style.opacity = '1';
      phase.style.visibility = 'visible';
    });
    cases.forEach(item => {
      item.style.opacity = '1';
      item.style.visibility = 'visible';
      item.style.clipPath = 'none';
    });
    nodes.forEach(node => node.classList.add('is-active'));
    if (location.hash) {
      const alignHash = () => {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start' });
      };
      if (document.readyState === 'complete') setTimeout(alignHash, 50);
      else addEventListener('load', () => setTimeout(alignHash, 50), { once: true });
    }
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const softBlur = mobile ? 'blur(0px)' : 'blur(6px)';

  gsap.set(phases, { autoAlpha: 1 });
  gsap.set(phases.slice(1).map(phase => phase.querySelector('.phase-word')), {
    clipPath: 'inset(100% 0 0 0)',
    scale: .84,
    filter: softBlur
  });
  gsap.set(phases.slice(1).map(phase => phase.querySelector('.phase-detail')), { autoAlpha: 0, y: 28 });

  if (!location.hash || location.hash === '#arrival') {
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .fromTo('.site-header', { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: .7 }, 0)
      .fromTo('.arrival .scene-label', { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: .7 }, .12)
      .fromTo('.hero-copy', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.2 }, .08)
      .fromTo('.arrival-meta span', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: .055, duration: .48 }, .55)
      .fromTo('.arrival-cta', { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, .72);
  }

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.arrival',
      start: 'top top',
      end: 'bottom bottom',
      scrub: mobile ? .48 : .72,
      invalidateOnRefresh: true,
      onUpdate: track('arrival')
    }
  })
    .to(root, { '--arrival-light': 1, '--world-scale': mobile ? 1.07 : 1.16, duration: .38 }, .08)
    .to('.hero-copy h1 span:nth-child(1)', { x: mobile ? '-2vw' : '-6vw', y: mobile ? '-2vh' : '-4vh', rotation: mobile ? 0 : -1.6, duration: .32 }, 0)
    .to('.hero-copy h1 span:nth-child(2)', { x: mobile ? '2vw' : '7vw', y: mobile ? '2vh' : '4vh', rotation: mobile ? 0 : 1.3, duration: .34 }, .03)
    .to('.hero-answer', { color: 'rgba(207,224,255,.98)', textShadow: '0 0 40px rgba(114,158,255,.24)', duration: .32 }, .14)
    .to(root, { '--world-x': mobile ? '-5vw' : '3vw', '--world-y': mobile ? '-2vh' : '0vh', duration: .38 }, .12)
    .to('.hero-copy', { autoAlpha: 0, scale: mobile ? 1.025 : 1.06, filter: mobile ? 'none' : 'blur(5px)', duration: .28 }, .7)
    .to(root, { '--world-scale': mobile ? .78 : .7, '--world-x': mobile ? '-16vw' : '-24vw', duration: .28 }, .7);

  const phaseTimeline = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    scrollTrigger: {
      trigger: '.system',
      start: 'top top',
      end: 'bottom bottom',
      scrub: mobile ? .56 : .82,
      invalidateOnRefresh: true,
      onUpdate(self) {
        track('think/create/scale')(self);
        root.style.setProperty('--system-progress', self.progress.toFixed(4));
        const index = Math.min(2, Math.floor(self.progress * 3));
        phaseNav.forEach((item, i) => item.classList.toggle('is-active', i === index));
      }
    }
  });
  const phase0Word = phases[0].querySelector('.phase-word');
  const phase1Word = phases[1].querySelector('.phase-word');
  const phase2Word = phases[2].querySelector('.phase-word');
  const phase0Detail = phases[0].querySelector('.phase-detail');
  const phase1Detail = phases[1].querySelector('.phase-detail');
  const phase2Detail = phases[2].querySelector('.phase-detail');
  phaseTimeline
    .fromTo(phase0Word, { xPercent: -4, scale: .96 }, { xPercent: 0, scale: 1, duration: .32 }, 0)
    .to(phase0Word, { xPercent: -9, scale: 1.14, clipPath: 'inset(0 0 100% 0)', filter: softBlur, duration: .34 }, .63)
    .to(phase0Detail, { autoAlpha: 0, y: -24, duration: .24 }, .62)
    .fromTo(phase1Word, { xPercent: 10, scale: .84, clipPath: 'inset(100% 0 0 0)', filter: softBlur }, { xPercent: 0, scale: 1, clipPath: 'inset(0% 0 0 0)', filter: 'blur(0px)', duration: .42 }, .68)
    .to(phase1Detail, { autoAlpha: 1, y: 0, duration: .3 }, .78)
    .to(root, { '--world-x': mobile ? '8vw' : '22vw', '--world-y': '-4vh', '--world-scale': .82, duration: .34 }, .7)
    .to(phase1Word, { yPercent: -12, scale: 1.12, clipPath: 'inset(0 0 100% 0)', filter: softBlur, duration: .34 }, 1.43)
    .to(phase1Detail, { autoAlpha: 0, y: -24, duration: .24 }, 1.42)
    .fromTo(phase2Word, { yPercent: 14, scale: .84, clipPath: 'inset(100% 0 0 0)', filter: softBlur }, { yPercent: 0, scale: 1, clipPath: 'inset(0% 0 0 0)', filter: 'blur(0px)', duration: .42 }, 1.48)
    .to(phase2Detail, { autoAlpha: 1, y: 0, duration: .3 }, 1.58)
    .to(root, { '--world-x': mobile ? '-8vw' : '-20vw', '--world-y': '5vh', '--world-scale': .62, duration: .36 }, 1.5);

  gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: {
      trigger: '.work-compact',
      start: 'top 88%',
      end: 'top 28%',
      scrub: mobile ? .35 : .52,
      invalidateOnRefresh: true,
      onUpdate: track('selected work')
    }
  })
    .to(root, { '--world-opacity': 0, duration: .45 }, 0)
    .fromTo('.work-compact-head', { autoAlpha: .42, y: 28 }, { autoAlpha: 1, y: 0, duration: .72 }, .05)
    .fromTo('.client-gallery', { autoAlpha: .34, y: 24 }, { autoAlpha: 1, y: 0, duration: .68 }, .22);

  const hubLayers = [...document.querySelectorAll('.hub-layer')];
  let hubStep = -2;
  const updateHubStep = progress => {
    const next = progress < .16 ? -1 : progress < .32 ? 0 : progress < .46 ? 1 : progress < .6 ? 2 : progress < .74 ? 3 : -1;
    if (next === hubStep) return;
    hubStep = next;
    hubLayers.forEach((layer, index) => layer.classList.toggle('is-focused', index === next));
    document.querySelector('.hub-device')?.setAttribute('data-stage', next < 0 ? 'complete' : String(next + 1));
  };
  gsap.timeline({
    defaults: { ease: 'power4.inOut' },
    scrollTrigger: {
      trigger: '.hub',
      start: 'top top',
      end: 'bottom bottom',
      scrub: mobile ? .58 : .9,
      invalidateOnRefresh: true,
      onUpdate(self) {
        track('agenciahub')(self);
        updateHubStep(self.progress);
      }
    }
  })
    .fromTo('.hub-copy', { y: mobile ? 10 : 24, opacity: .74 }, { y: 0, opacity: 1, duration: .25 }, 0)
    .fromTo('.hub-device', { y: mobile ? 18 : 54, rotateX: 6, rotateY: mobile ? -2 : -10, scale: .92, opacity: .72 }, { y: 0, rotateX: 3, rotateY: mobile ? 0 : -4, scale: 1, opacity: 1, duration: .32 }, .03)
    .to('.layer-projects', { x: mobile ? -10 : -48, y: mobile ? -14 : -46, z: mobile ? 40 : 150, rotateY: 5, duration: .26 }, .34)
    .to('.layer-approval', { x: mobile ? 10 : 54, y: mobile ? -8 : -26, z: mobile ? 62 : 220, rotateY: -6, duration: .26 }, .43)
    .to('.layer-media', { x: mobile ? -8 : -38, y: mobile ? 12 : 38, z: mobile ? 78 : 280, rotateY: 5, duration: .26 }, .52)
    .to('.layer-results', { x: mobile ? 8 : 48, y: mobile ? 14 : 44, z: mobile ? 94 : 340, rotateY: -5, duration: .26 }, .61)
    .to(hubLayers, { x: 0, y: 0, z: 0, rotateY: 0, duration: .3, stagger: .025 }, .76)
    .to('.hub-device', { rotateX: 1, rotateY: 0, scale: 1, duration: .3 }, .78);
  updateHubStep(0);

  let knightStep = -1;
  const updateKnight = index => {
    if (index === knightStep || !detail) return;
    knightStep = index;
    nodes.forEach((node, nodeIndex) => node.classList.toggle('is-active', nodeIndex <= index));
    gsap.killTweensOf(detail);
    gsap.to(detail, {
      autoAlpha: 0,
      y: 7,
      duration: .1,
      ease: 'power2.in',
      onComplete() {
        detail.querySelector('strong').textContent = method[index][0];
        detail.querySelector('p').textContent = method[index][1];
        gsap.to(detail, { autoAlpha: 1, y: 0, duration: .2, ease: 'power3.out' });
      }
    });
  };
  gsap.fromTo('.knight-stage h2', { yPercent: 7, opacity: .72 }, {
    yPercent: 0,
    opacity: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.knight', start: 'top top', end: '+=55%', scrub: .55 }
  });
  ScrollTrigger.create({
    trigger: '.knight',
    start: 'top top',
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onUpdate(self) {
      track('knight move')(self);
      root.style.setProperty('--knight-progress', self.progress.toFixed(4));
      root.style.setProperty('--world-opacity', String(clamp((self.progress - .64) / .23)));
      root.style.setProperty('--world-scale', String(.4 + self.progress * .42));
      root.style.setProperty('--world-x', mobile ? '12vw' : '21vw');
      updateKnight(Math.min(method.length - 1, Math.floor(self.progress * method.length)));
    }
  });
  updateKnight(0);

  gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: '.finale', start: 'top 72%', end: 'top 10%', scrub: .58 }
  })
    .fromTo('.finale h2', { y: mobile ? 34 : 58, clipPath: 'inset(0 0 100% 0)' }, { y: 0, clipPath: 'inset(0 0 0% 0)', duration: .72 }, 0)
    .fromTo('.finale-cta', { scale: .84, rotate: 5, opacity: .55 }, { scale: 1, rotate: 0, opacity: 1, duration: .62 }, .14);
  ScrollTrigger.create({
    trigger: '.finale',
    start: 'top 65%',
    end: 'bottom bottom',
    onUpdate(self) {
      track('start a project')(self);
      root.style.setProperty('--world-opacity', String(.25 * (1 - self.progress)));
      root.style.setProperty('--world-x', mobile ? '12vw' : '23vw');
      root.style.setProperty('--world-y', '4vh');
      root.style.setProperty('--world-scale', String(.7 + self.progress * .16));
    }
  });

  const alignInitialHash = () => {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start' });
      ScrollTrigger.update();
    });
  };
  const refresh = () => ScrollTrigger.refresh();
  addEventListener('load', () => {
    refresh();
    alignInitialHash();
  }, { once: true });
  addEventListener('orientationchange', refresh, { passive: true });
  document.fonts?.ready.then(() => {
    refresh();
    if (document.readyState === 'complete') alignInitialHash();
  }).catch(() => {});
  addEventListener('pagehide', () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }, { once: true });
  window.CavalcanteMotion = { refresh, state: () => ({ ...sceneState }) };
})();

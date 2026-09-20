(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('#site-header');
  const phases = [...document.querySelectorAll('.phase')];
  const phaseNav = [...document.querySelectorAll('.phase-nav span')];
  const cases = [...document.querySelectorAll('.case-scene')];
  const nodes = [...document.querySelectorAll('.knight-node')];
  const detail = document.querySelector('.knight-detail');
  const debugPanel = document.querySelector('#motion-debug');
  const debug = new URLSearchParams(location.search).get('motionDebug') === '1';
  const motionReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const clamp = value => Math.max(0, Math.min(1, value));
  const sceneState = { scene: 'arrival', progress: 0, velocity: 0 };
  const method = [
    ['01 / Diagnóstico', 'A direção começa pelo que precisa mudar.'],
    ['02 / Estratégia', 'Posicionamento, linguagem e objetivo apontam a próxima jogada.'],
    ['03 / Produção', 'Roteiro, captação, edição e design transformam intenção em presença.'],
    ['04 / Distribuição', 'A mensagem encontra formato, contexto e público.'],
    ['05 / Próxima jogada', 'Leitura e ajuste mantêm o trabalho em movimento.']
  ];

  window.CavalcanteMotionState = sceneState;
  const setScene = (scene, progress, velocity = 0) => {
    sceneState.scene = scene;
    sceneState.progress = clamp(progress);
    sceneState.velocity = Math.max(-1, Math.min(1, velocity));
    window.CavalcanteScene?.setState(sceneState);
  };

  const updatePage = () => {
    const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    root.style.setProperty('--page-progress', clamp(scrollY / distance).toFixed(4));
  };
  addEventListener('scroll', updatePage, { passive: true });
  updatePage();

  let frames = 0;
  let fps = 60;
  let stamp = performance.now();
  const countFrame = now => {
    frames += 1;
    if (now - stamp >= 500) {
      fps = Math.round(frames * 1000 / (now - stamp));
      frames = 0;
      stamp = now;
      if (debug) {
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
    requestAnimationFrame(countFrame);
  };
  if (debug) requestAnimationFrame(countFrame);

  if (motionReduced || !gsap || !ScrollTrigger) {
    root.classList.add('motion-fallback');
    phases.forEach(phase => {
      phase.style.opacity = '1';
      phase.style.visibility = 'visible';
    });
    cases.forEach(item => {
      item.style.opacity = '1';
      item.style.visibility = 'visible';
      item.style.clipPath = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- rolagem com inercia (Lenis 1.3.26, auto-hospedado) ----------
     E o que separa a sensacao deste site da das referencias: elas nao rolam,
     elas deslizam. Lenis intercepta a roda e interpola a posicao, e o
     ScrollTrigger passa a ser atualizado por ele em vez de pelo evento nativo.

     Tres cuidados que fazem isso nao virar dor de cabeca:
     - sob prefers-reduced-motion nao entra (o return la em cima ja cortou);
     - em ponteiro grosso fica desligado: no celular a rolagem nativa e melhor
       e o toque com inercia artificial atrapalha;
     - o scroll-behavior:smooth do CSS briga com o Lenis, entao e desligado. */
  let lenis = null;
  const podeInercia = typeof window.Lenis === 'function'
    && !matchMedia('(pointer: coarse)').matches;

  if (podeInercia) {
    document.documentElement.style.scrollBehavior = 'auto';
    lenis = new window.Lenis({
      duration: 1.05,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tempo => lenis.raf(tempo * 1000));
    gsap.ticker.lagSmoothing(0);

    /* ancoras do menu passam a ser conduzidas pelo Lenis */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', ev => {
        const alvo = document.querySelector(link.getAttribute('href'));
        if (!alvo) return;
        ev.preventDefault();
        lenis.scrollTo(alvo, { offset: -1 });
      });
    });

    /* menu aberto trava o corpo: o Lenis tem de parar junto, senao a pagina
       continua deslizando por baixo do painel */
    const corpo = document.body;
    new MutationObserver(() => {
      corpo.classList.contains('menu-open') ? lenis.stop() : lenis.start();
    }).observe(corpo, { attributes: true, attributeFilter: ['class'] });

    /* ---------- encaixe entre cenas (lenis-snap) ----------
       type 'proximity': só age quando você PARA perto do começo de uma cena.
       Snap obrigatório brigaria com o scrub interno — cada cena tem de 320 a
       480svh de conteúdo rolado, e ser puxado no meio disso é péssimo. Assim
       ele só arruma o pouso, não conduz a viagem. */
    if (typeof window.Snap === 'function') {
      let encaixe = null;
      const montarEncaixe = () => {
        /* destroy + new, nao add/remove: o lenis-snap expoe add() e destroy(),
           mas nao um removeAll. Reaproveitar a instancia empilharia pontos a
           cada resize ate o snap ficar imprevisivel. */
        encaixe?.destroy();
        encaixe = new window.Snap(lenis, {
          type: 'proximity',
          distanceThreshold: '18%',
          duration: .8,
          velocityThreshold: 1.2
        });
        document.querySelectorAll('.chapter, .finale')
          .forEach(cena => encaixe.add(cena.offsetTop));
      };
      montarEncaixe();
      let relogioEncaixe;
      addEventListener('resize', () => {
        clearTimeout(relogioEncaixe);
        relogioEncaixe = setTimeout(montarEncaixe, 220);
      }, { passive: true });
    }

    root.classList.add('inercia');
  }

  gsap.set(phases, { autoAlpha: 0 });
  gsap.set(phases[0], { autoAlpha: 1 });
  gsap.set(cases, { autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' });
  gsap.set(cases[0], { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)' });

  const track = scene => self => {
    const velocity = self.getVelocity ? self.getVelocity() / 2100 : 0;
    setScene(scene, self.progress, velocity);
  };

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.arrival', start: 'top top', end: 'bottom bottom', scrub: .72,
      invalidateOnRefresh: true, onUpdate: track('arrival')
    }
  })
    .to('.hero-copy h1 span:nth-child(1)', { x: '-7vw', y: '-5vh', rotation: -2.5, filter: 'blur(2px)', duration: .28 }, 0)
    .to('.hero-copy h1 span:nth-child(2)', { x: '8vw', y: '5vh', rotation: 2, duration: .3 }, .04)
    .fromTo('.hero-answer', { opacity: .55 }, { opacity: 1, letterSpacing: '-.055em', duration: .28 }, .18)
    .to(root, { '--world-scale': 1.18, '--world-x': '3vw', duration: .38 }, .12)
    .to('.hero-copy', { opacity: 0, scale: 1.08, filter: 'blur(8px)', duration: .25 }, .7)
    .to(root, { '--world-scale': .72, '--world-x': '-25vw', duration: .28 }, .7);

  const phaseTimeline = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    scrollTrigger: {
      trigger: '.system', start: 'top top', end: 'bottom bottom', scrub: .85,
      invalidateOnRefresh: true,
      onUpdate(self) {
        track('think/create/scale')(self);
        const index = Math.min(2, Math.floor(self.progress * 3));
        phaseNav.forEach((item, i) => item.classList.toggle('is-active', i === index));
      }
    }
  });
  phaseTimeline
    .fromTo(phases[0].querySelector('.phase-word'), { x: '-5vw', rotation: -3 }, { x: '0vw', rotation: 0, duration: .35 }, 0)
    .to(phases[0], { autoAlpha: 0, x: '-8vw', duration: .22 }, .76)
    .fromTo(phases[1], { autoAlpha: 0, x: '9vw' }, { autoAlpha: 1, x: 0, duration: .22 }, .82)
    .to(root, { '--world-x': '23vw', '--world-y': '-4vh', '--world-scale': .82, duration: .3 }, .84)
    .to(phases[1], { autoAlpha: 0, y: '-7vh', duration: .22 }, 1.62)
    .fromTo(phases[2], { autoAlpha: 0, y: '8vh' }, { autoAlpha: 1, y: 0, duration: .22 }, 1.68)
    .to(root, { '--world-x': '-22vw', '--world-y': '5vh', '--world-scale': .6, duration: .35 }, 1.7);

  const workTimeline = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    scrollTrigger: {
      trigger: '.work', start: 'top top', end: 'bottom bottom', scrub: .78,
      invalidateOnRefresh: true,
      onEnter: () => header.classList.remove('is-light'),
      onEnterBack: () => header.classList.remove('is-light'),
      onUpdate(self) {
        track('selected work')(self);
        root.style.setProperty('--case-progress', self.progress.toFixed(4));
      }
    }
  });
  workTimeline
    .to(root, { '--world-opacity': 0, duration: .18 }, 0)
    .to('.work-heading h2', { autoAlpha: 0, y: '-5vh', duration: .18 }, .16)
    .fromTo(cases[0].querySelector('img'), { scale: 1.16 }, { scale: 1.02, duration: .9, ease: 'none' }, .2)
    .fromTo(cases[1], { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: .32 }, 1)
    .fromTo(cases[1].querySelector('img'), { scale: 1.15, xPercent: 4 }, { scale: 1.02, xPercent: 0, duration: .8, ease: 'none' }, 1)
    .fromTo(cases[2], { autoAlpha: 1, clipPath: 'inset(100% 0 0 0)' }, { autoAlpha: 1, clipPath: 'inset(0% 0 0 0)', duration: .32 }, 2)
    .fromTo(cases[2].querySelector('img'), { scale: 1.16, yPercent: 5 }, { scale: 1.02, yPercent: 0, duration: .8, ease: 'none' }, 2);

  gsap.timeline({
    defaults: { ease: 'power4.inOut' },
    scrollTrigger: {
      trigger: '.hub', start: 'top top', end: 'bottom bottom', scrub: .95,
      invalidateOnRefresh: true,
      onEnter: () => header.classList.add('is-light'),
      onEnterBack: () => header.classList.add('is-light'),
      onLeave: () => header.classList.remove('is-light'),
      onLeaveBack: () => header.classList.remove('is-light'),
      onUpdate: track('agenciahub')
    }
  })
    .fromTo('.hub-copy', { x: '-5vw', opacity: .72 }, { x: 0, opacity: 1, duration: .26 }, 0)
    .fromTo('.hub-device', { yPercent: 14, rotateY: -13, scale: .88 }, { yPercent: 0, rotateY: -4, scale: 1, duration: .35 }, .05)
    .to('.layer-projects', { x: '-4vw', y: '-5vh', z: 130, rotateY: 7, duration: .28 }, .36)
    .to('.layer-approval', { x: '4vw', y: '4vh', z: 210, rotateY: -8, duration: .28 }, .52)
    .to('.layer-flow', { y: '5vh', z: 270, duration: .24 }, .66);

  let knightStep = -1;
  ScrollTrigger.create({
    trigger: '.knight', start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
    onEnter: () => header.classList.remove('is-light'),
    onEnterBack: () => header.classList.remove('is-light'),
    onUpdate(self) {
      track('knight move')(self);
      root.style.setProperty('--knight-progress', self.progress.toFixed(4));
      root.style.setProperty('--world-opacity', String(clamp((self.progress - .62) / .25)));
      root.style.setProperty('--world-scale', String(.35 + self.progress * .45));
      root.style.setProperty('--world-x', '22vw');
      const index = Math.min(method.length - 1, Math.floor(self.progress * method.length));
      if (index !== knightStep) {
        knightStep = index;
        nodes.forEach((node, i) => node.classList.toggle('is-active', i <= index));
        detail.querySelector('strong').textContent = method[index][0];
        detail.querySelector('p').textContent = method[index][1];
      }
    }
  });

  ScrollTrigger.create({
    trigger: '.finale', start: 'top 65%', end: 'bottom bottom',
    onEnter: () => header.classList.add('is-light'),
    onEnterBack: () => header.classList.add('is-light'),
    onLeaveBack: () => header.classList.remove('is-light'),
    onUpdate(self) {
      track('start a project')(self);
      root.style.setProperty('--world-opacity', String(.28 * (1 - self.progress)));
      root.style.setProperty('--world-x', '24vw');
      root.style.setProperty('--world-y', '4vh');
      root.style.setProperty('--world-scale', String(.7 + self.progress * .18));
    }
  });

  const refresh = () => ScrollTrigger.refresh();
  addEventListener('load', refresh, { once: true });
  addEventListener('orientationchange', refresh, { passive: true });
  document.fonts?.ready.then(refresh).catch(() => {});
  window.CavalcanteMotion = { refresh, state: () => ({ ...sceneState }), lenis: () => lenis };
})();

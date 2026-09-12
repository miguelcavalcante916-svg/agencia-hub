// Visual enhancements use local modules to respect the site's existing CSP.
export async function initHero(canvas, motion) {
  const [THREE, { SVGLoader }] = await Promise.all([
    import('./assets/vendor/three.module.min.js'), import('./assets/vendor/SVGLoader.js')
  ]);
  if (!canvas?.isConnected || motion.matches) return;
  // Finish loading the brand before allocating GPU resources.
  const response = await fetch('app/img/logo.svg');
  if (!response.ok) throw new Error('Brand asset unavailable');
  const source = await response.text();
  if (!canvas.isConnected || motion.matches) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070b14, .025);
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100); camera.position.set(0, 0, 12.8);
  let environmentMap;
  function updateEnvironment() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    // Narrow softboxes against black give the silver clear light/dark reflections.
    // These panels exist only while baking the environment, never in the live scene.
    const environment = new THREE.Scene();
    environment.background = new THREE.Color(0x000000);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const materials = [];
    const panels = [
      { size: [1.6, 9], position: [-6, 1, 7], color: 0xffffff, intensity: 3.2 },
      { size: [3, 8], position: [5, -1, 4], color: 0x7298ff, intensity: 2.5 },
      { size: [8, 1.8], position: [0, 6, 1], color: 0xffffff, intensity: 3 },
      { size: [5, 6], position: [0, 0, -7], color: 0xffffff, intensity: 1.2 }
    ];
    panels.forEach(({ size, position, color, intensity }) => {
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false });
      materials.push(material);
      const panel = new THREE.Mesh(geometry, material);
      panel.scale.set(size[0], size[1], 1); panel.position.set(...position); panel.lookAt(0, 0, 0);
      environment.add(panel);
    });
    try {
      const next = pmrem.fromScene(environment, .01);
      scene.environment = next.texture;
      environmentMap?.dispose(); environmentMap = next;
    } finally {
      geometry.dispose(); materials.forEach(material => material.dispose()); pmrem.dispose();
    }
  }

  updateEnvironment();
  // SVGLoader cannot resolve CSS currentColor outside a document style context.
  const data = new SVGLoader().parse(source.replace(/currentColor/g, '#ffffff'));
  const knight = new THREE.Group();
  const front = new THREE.MeshPhysicalMaterial({ color: 0xf2f3f8, metalness: 1, roughness: .22, clearcoat: .8, clearcoatRoughness: .12, envMapIntensity: 2.2 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xb6c0d3, metalness: 1, roughness: .17, envMapIntensity: 2 });
  // Fine surface variation catches highlights without a full-screen postprocess.
  const grain = new Uint8Array(128 * 128 * 4);
  let seed = 73;
  for (let i = 0; i < grain.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const value = 160 + (seed >>> 26);
    grain[i] = grain[i + 1] = grain[i + 2] = value; grain[i + 3] = 255;
  }
  const finish = new THREE.DataTexture(grain, 128, 128, THREE.RGBAFormat);
  finish.wrapS = finish.wrapT = THREE.RepeatWrapping; finish.repeat.set(.08, .08);
  finish.magFilter = THREE.LinearFilter; finish.minFilter = THREE.LinearFilter; finish.needsUpdate = true;
  front.bumpMap = finish; front.bumpScale = .012;
  data.paths.forEach(path => SVGLoader.createShapes(path).forEach(shape => {
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 72, bevelEnabled: true, bevelThickness: 9, bevelSize: 6, bevelSegments: 4, curveSegments: 14, steps: 1 });
    geometry.translate(-540, -540, -36); geometry.scale(.009, -.009, .009);
    geometry.computeVertexNormals(); knight.add(new THREE.Mesh(geometry, [front, edge]));
  }));
  knight.rotation.set(-.08, -.48, -.1); scene.add(knight);
  const key = new THREE.DirectionalLight(0xe4f6ff, 4); key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x72b4e3, 5); rim.position.set(5, 1, -2); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xbfd2ff, 2); fill.position.set(2, -4, 3); scene.add(fill);
  const positions = new Float32Array(620 * 3);
  for (let i = 0; i < 620; i++) { const angle = i * 2.39996, radius = 4.1 + (i % 21) * .08; positions[i * 3] = Math.cos(angle) * radius; positions[i * 3 + 1] = Math.sin(angle) * radius * .8; positions[i * 3 + 2] = -3 - (i % 17) / 4; }
  const pointsGeometry = new THREE.BufferGeometry(); pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(pointsGeometry, new THREE.PointsMaterial({ color: 0xc1e6f8, size: .013, transparent: true, opacity: .12, depthWrite: false })); scene.add(points);
  // A curved wire cyclorama gives the sculpture a continuous architectural space.
  const roomVertices = [];
  function surface(x, z) { return [x, -4.6 + Math.pow(Math.max(0, -z - 3), 2) * .032, z]; }
  for (let x = -30; x <= 30; x += 1.5) {
    for (let z = -34; z < 14; z += .6) roomVertices.push(...surface(x, z), ...surface(x, z + .6));
  }
  for (let z = -34; z <= 14; z += 1.5) {
    for (let x = -30; x < 30; x += 1.5) roomVertices.push(...surface(x, z), ...surface(x + 1.5, z));
  }
  const roomGeometry = new THREE.BufferGeometry();
  roomGeometry.setAttribute('position', new THREE.Float32BufferAttribute(roomVertices, 3));
  const roomMaterial = new THREE.LineBasicMaterial({color:0x7b8eaf,transparent:true,opacity:.12,depthWrite:false});
  const room = new THREE.LineSegments(roomGeometry, roomMaterial); scene.add(room);
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(5.1, .018, 8, 160), new THREE.MeshBasicMaterial({color:0xa7caf9,transparent:true,opacity:.6}));
  orbit.rotation.set(1.25, .2, -.3); orbit.position.y = -.7;
  const shell = canvas.closest('.experience-shell') || canvas.closest('.hero');
  const owner = canvas.parentElement;
  let baseCamera = 12.8, shellTop = 0, scrollDistance = 0;
  let frame = 0, visible = false, lost = false, disposed = false, ready = false;
  let previousTime = 0, elapsed = 0, scroll = 0, pointerX = 0, pointerY = 0;
  let pointerTargetX = 0, pointerTargetY = 0, canvasBounds;
  let renderWidth = 0, renderHeight = 0, pixelRatio = 0;
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
  const start = () => {
    if (!frame && !disposed && !lost && visible && !document.hidden) frame = requestAnimationFrame(render);
  };
  function render(time) {
    frame = 0;
    if (disposed || lost || !visible || document.hidden) return;
    // Seconds, rather than a fixed fraction per frame, give 60/120 Hz the same motion.
    const delta = previousTime ? Math.min((time - previousTime) / 1000, .05) : 1 / 60;
    previousTime = time;
    if (!motion.matches) elapsed += delta;
    const smooth = 1 - Math.exp(-delta / .16);
    const scrollTarget = motion.matches || scrollDistance <= 1 ? 0 : Math.max(0, Math.min(1, (scrollY - shellTop) / scrollDistance));
    scroll += (scrollTarget - scroll) * (motion.matches ? 1 : 1 - Math.exp(-delta / .1));
    pointerX += ((motion.matches ? 0 : pointerTargetX) - pointerX) * (motion.matches ? 1 : smooth);
    pointerY += ((motion.matches ? 0 : pointerTargetY) - pointerY) * (motion.matches ? 1 : smooth);
    const t = motion.matches ? 0 : elapsed * .35;
    camera.position.z = baseCamera - scroll * 2;
    camera.position.x += ((pointerX * .5 + scroll * 1.3) - camera.position.x) * (motion.matches ? 1 : 1 - Math.exp(-delta / .4));
    camera.lookAt(0, -.1 + scroll * .6, 0);
    room.rotation.y = scroll * .12;
    orbit.rotation.z = -.3 + scroll * .8 + t * .06;
    knight.rotation.y = -.28 + Math.sin(t * .6) * .08 + pointerX * .12 + scroll * 1.1;
    knight.rotation.x = -.08 + pointerY * .08;
    knight.rotation.z = -.12 + Math.sin(t * .7) * .025 - scroll * .12;
    knight.position.y = (camera.aspect < .8 ? 1.4 : 0) + (motion.matches ? 0 : Math.sin(t * .8) * .06);
    points.rotation.z = motion.matches ? 0 : t * .035;
    renderer.render(scene, camera);
    if (!ready) { owner.classList.add('is-ready'); ready = true; }
    if (!motion.matches) start();
  }
  function resize() {
    if (disposed || lost) return;
    canvasBounds = canvas.getBoundingClientRect();
    const { width, height } = canvasBounds;
    if (!width || !height) return;
    // Keep small screens crisp without asking large displays to draw millions of extra pixels.
    const nextRatio = Math.min(devicePixelRatio || 1, 1.75, Math.sqrt(3200000 / (width * height)));
    if (width !== renderWidth || height !== renderHeight || nextRatio !== pixelRatio) {
      renderWidth = width; renderHeight = height; pixelRatio = nextRatio;
      renderer.setPixelRatio(nextRatio); renderer.setSize(width, height, false);
      camera.aspect = width / height; baseCamera = camera.aspect < .8 ? 17 : 13.4;
      knight.scale.setScalar(camera.aspect < .8 ? .72 : 1);
      camera.updateProjectionMatrix();
    }
    // Cache document geometry only when layout changes; the render loop reads scrollY alone.
    const bounds = shell.getBoundingClientRect();
    shellTop = bounds.top + scrollY; scrollDistance = getComputedStyle(canvas.closest('.hero')).position === 'sticky' ? Math.max(0, shell.offsetHeight - innerHeight) : 0;
    start();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas); resizeObserver.observe(shell);
  const visibility = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { resize(); start(); } else stop();
  });
  visibility.observe(canvas);
  const onVisibility = () => { if (document.hidden) stop(); else start(); };
  const onPointerEnter = () => { canvasBounds = canvas.getBoundingClientRect(); };
  const onPointer = event => {
    if (event.pointerType === 'touch' || motion.matches || !visible || !canvasBounds?.width) return;
    pointerTargetX = Math.max(-1, Math.min(1, (event.clientX - canvasBounds.left) / canvasBounds.width * 2 - 1));
    pointerTargetY = Math.max(-1, Math.min(1, (event.clientY - canvasBounds.top) / canvasBounds.height * 2 - 1));
  };
  const resetPointer = () => { pointerTargetX = pointerTargetY = 0; };
  const onMotion = () => { stop(); resetPointer(); start(); };
  const onContextLost = event => { event.preventDefault(); lost = true; ready = false; stop(); owner.classList.remove('is-ready'); };
  const onContextRestored = () => { lost = false; updateEnvironment(); resize(); start(); };
  const onPageShow = () => { resize(); start(); };
  function onPageHide(event) {
    stop();
    if (event.persisted) return;
    disposed = true; resizeObserver.disconnect(); visibility.disconnect();
    owner.removeEventListener('pointerenter', onPointerEnter); owner.removeEventListener('pointermove', onPointer); owner.removeEventListener('pointerleave', resetPointer);
    document.removeEventListener('visibilitychange', onVisibility); motion.removeEventListener('change', onMotion);
    canvas.removeEventListener('webglcontextlost', onContextLost); canvas.removeEventListener('webglcontextrestored', onContextRestored);
    removeEventListener('resize', resize); removeEventListener('pageshow', onPageShow); removeEventListener('pagehide', onPageHide);
    knight.children.forEach(mesh => mesh.geometry.dispose()); front.dispose(); edge.dispose(); finish.dispose(); pointsGeometry.dispose(); points.material.dispose(); environmentMap.dispose(); roomGeometry.dispose(); roomMaterial.dispose(); orbit.geometry.dispose(); orbit.material.dispose(); renderer.dispose();
  }
  owner.addEventListener('pointerenter', onPointerEnter, { passive: true }); owner.addEventListener('pointermove', onPointer, { passive: true }); owner.addEventListener('pointerleave', resetPointer, { passive: true });
  document.addEventListener('visibilitychange', onVisibility); motion.addEventListener('change', onMotion);
  canvas.addEventListener('webglcontextlost', onContextLost); canvas.addEventListener('webglcontextrestored', onContextRestored);
  addEventListener('resize', resize, { passive: true }); addEventListener('pagehide', onPageHide); addEventListener('pageshow', onPageShow);
  resize();
}

export function initMethod(canvas, motion) {
  const ctx = canvas?.getContext('2d'); if (!ctx) return () => {};
  const total = 850, positions = new Float32Array(total * 2);
  let width = 0, height = 0, pixelRatio = 0, step = 0, frame = 0;
  let visible = false, initialized = false, disposed = false, previousTime = 0, ready = false;
  const owner = canvas.closest('.method-visual');
  function target(index, phase) {
    const ratio = index / total, angle = ratio * Math.PI * 2;
    if (phase === 0) { const phi = Math.acos(1 - 2 * (index + .5) / total), theta = index * 2.399963; return [Math.cos(theta) * Math.sin(phi) * .33, Math.cos(phi) * .33]; }
    if (phase === 1) { const ring = index % 7, a = angle * 7; return [Math.cos(a) * (.2 + ring * .02), Math.sin(a) * (.2 + ring * .02) * .45 + Math.cos(a) * .1]; }
    if (phase === 2) { const side = index % 4, t = Math.floor(index / 4) / (total / 4); const inset = Math.floor(index / 60) % 3 * .025; const a = .29 - inset, b = .22 - inset; return side === 0 ? [-a + t * 2 * a, -b] : side === 1 ? [a, -b + t * 2 * b] : side === 2 ? [a - t * 2 * a, b] : [-a, b - t * 2 * b]; }
    if (phase === 3) { const arm = index % 6, t = Math.floor(index / 6) / (total / 6), a = arm / 6 * Math.PI * 2; return [Math.cos(a) * t * .37, Math.sin(a) * t * .37]; }
    return [Math.sin(angle) * .33, Math.sin(angle * 2) * .16];
  }
  // All five shapes are static. Calculate their trigonometry once, not for every particle/frame.
  const targets = Array.from({ length: 5 }, (_, phase) => {
    const points = new Float32Array(total * 2);
    for (let index = 0; index < total; index++) points.set(target(index, phase), index * 2);
    return points;
  });
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
  const start = () => { if (!frame && !disposed && visible && width && height && !document.hidden) frame = requestAnimationFrame(draw); };
  function draw(time) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, .05) : 1 / 60;
    previousTime = time;
    const speed = motion.matches ? 1 : 1 - Math.exp(-delta / .214);
    const destination = targets[step];
    let distance = 0;
    for (let i = 0; i < positions.length; i++) {
      positions[i] += (destination[i] - positions[i]) * speed;
      distance += Math.abs(destination[i] - positions[i]);
    }
    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width, height) * 1.05, centerX = width / 2, centerY = height / 2;
    ctx.strokeStyle = '#a0b2ee12'; ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(centerX, centerY, scale * (.12 * i), 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(centerX, 25); ctx.lineTo(centerX, height - 25); ctx.moveTo(25, centerY); ctx.lineTo(width - 25, centerY); ctx.stroke();
    // Five paint batches replace 850 individual fills and style changes.
    for (let group = 0; group < 5; group++) {
      const radius = group === 0 ? 1.5 : .85;
      ctx.fillStyle = group === 0 ? '#edfaff' : '#98c9de'; ctx.globalAlpha = .28 + group * .16;
      ctx.beginPath();
      for (let index = group; index < total; index += 5) {
        const x = centerX + positions[index * 2] * scale, y = centerY + positions[index * 2 + 1] * scale;
        ctx.moveTo(x + radius, y); ctx.arc(x, y, radius, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!ready) { owner?.classList.add('is-ready'); ready = true; }
    if (!motion.matches && distance > .025) start(); else previousTime = 0;
  }
  function resize() {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect(), nextRatio = Math.min(devicePixelRatio || 1, 2);
    if (!rect.width || !rect.height) return;
    if (width === rect.width && height === rect.height && pixelRatio === nextRatio) return;
    width = rect.width; height = rect.height; pixelRatio = nextRatio;
    canvas.width = Math.round(width * pixelRatio); canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (!initialized) { positions.set(targets[step]); initialized = true; }
    // Do not draw synchronously here: that could orphan an already scheduled animation frame.
    start();
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) start(); else stop();
  });
  visibilityObserver.observe(canvas);
  const onVisibility = () => { if (document.hidden) stop(); else start(); };
  const onMotion = () => { stop(); start(); };
  const onPageShow = () => { resize(); start(); };
  function onPageHide(event) {
    stop();
    if (event.persisted) return;
    disposed = true; resizeObserver.disconnect(); visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility); motion.removeEventListener('change', onMotion);
    removeEventListener('resize', resize); removeEventListener('pagehide', onPageHide); removeEventListener('pageshow', onPageShow);
  }
  document.addEventListener('visibilitychange', onVisibility); motion.addEventListener('change', onMotion);
  addEventListener('resize', resize, { passive: true }); addEventListener('pagehide', onPageHide); addEventListener('pageshow', onPageShow);
  resize();
  return index => {
    if (!Number.isInteger(index) || index < 0 || index >= targets.length || disposed) return;
    step = index; start();
  };
}

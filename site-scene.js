// Visual enhancements use local modules to respect the site's existing CSP.
export async function initHero(canvas, motion) {
  const [THREE, { SVGLoader }, { RoomEnvironment }] = await Promise.all([
    import('./assets/vendor/three.module.min.js'), import('./assets/vendor/SVGLoader.js'), import('./assets/vendor/RoomEnvironment.js')
  ]);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070b14, .025);
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100); camera.position.set(0, 0, 12.8);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const environmentMap = pmrem.fromScene(environment, .04); scene.environment = environmentMap.texture;
  environment.dispose(); pmrem.dispose();
  const response = await fetch('app/img/logo.svg'); if (!response.ok) throw new Error('Brand asset unavailable');
  // SVGLoader cannot resolve CSS currentColor outside a document style context.
  const data = new SVGLoader().parse((await response.text()).replace(/currentColor/g, '#ffffff'));
  const knight = new THREE.Group();
  const front = new THREE.MeshPhysicalMaterial({ color: 0xc5e1ed, metalness: .98, roughness: .135, clearcoat: 1, clearcoatRoughness: .1, envMapIntensity: 1.65 });
  const edge = new THREE.MeshStandardMaterial({ color: 0x4c839e, metalness: .98, roughness: .17, envMapIntensity: 1.6 });
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
  const points = new THREE.Points(pointsGeometry, new THREE.PointsMaterial({ color: 0xc1e6f8, size: .016, transparent: true, opacity: .4, depthWrite: false })); scene.add(points);
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
  const roomMaterial = new THREE.LineBasicMaterial({color:0x7390c7,transparent:true,opacity:.25,depthWrite:false});
  const room = new THREE.LineSegments(roomGeometry, roomMaterial); scene.add(room);
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(5.1, .018, 8, 160), new THREE.MeshBasicMaterial({color:0xa7caf9,transparent:true,opacity:.6}));
  orbit.rotation.set(1.25, .2, -.3); orbit.position.y = -.7; scene.add(orbit);
  const shell = canvas.closest('.experience-shell');
  let baseCamera = 12.8;
  let frame = 0, visible = true, pointerX = 0, pointerY = 0, lost = false, disposed = false;
  const render = time => {
    frame = 0; if (disposed || lost) return;
    const animate = visible && !document.hidden && !motion.matches;
    const t = motion.matches ? 0 : time * .00035;
    const scroll = motion.matches ? 0 : Math.max(0, Math.min(1, -shell.getBoundingClientRect().top / Math.max(1, shell.offsetHeight - innerHeight)));
    camera.position.z = baseCamera - scroll * 2;
    camera.position.x += ((pointerX * .5 + scroll * 1.3) - camera.position.x) * .04;
    camera.lookAt(0, -.1 + scroll * .6, 0);
    room.rotation.y = scroll * .12;
    orbit.rotation.z = -.3 + scroll * .8 + t * .06;
    knight.rotation.y = -.36 + Math.sin(t) * .19 + pointerX * .2 + scroll * 1.8;
    knight.rotation.x = -.08 + pointerY * .08;
    knight.rotation.z = -.12 + Math.sin(t * .7) * .025 - scroll * .12;
    knight.position.y = (camera.aspect < .8 ? 1.4 : 0) + (motion.matches ? 0 : Math.sin(t * 1.4) * .11);
    knight.scale.setScalar(camera.aspect < .8 ? .72 : 1);
    points.rotation.z = motion.matches ? 0 : t * .035;
    renderer.render(scene, camera);
    if (animate) frame = requestAnimationFrame(render);
  };
  const start = () => { if (!frame && !disposed && !lost && visible && !document.hidden) frame = requestAnimationFrame(render); };
  const resize = () => { const { width, height } = canvas.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; baseCamera = width / height < .8 ? 17 : 13.4; camera.position.z = baseCamera; camera.updateProjectionMatrix(); start(); };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);
  const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); else { cancelAnimationFrame(frame); frame = 0; } }); visibility.observe(canvas);
  const onVisibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else start(); };
  const onPointer = event => { if (event.pointerType === 'touch' || motion.matches) return; const rect = canvas.getBoundingClientRect(); pointerX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)); pointerY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)); };
  const resetPointer = () => { pointerX = pointerY = 0; };
  canvas.parentElement.addEventListener('pointermove', onPointer); canvas.parentElement.addEventListener('pointerleave', resetPointer);
  document.addEventListener('visibilitychange', onVisibility); motion.addEventListener('change', start);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); frame = 0; canvas.parentElement.classList.remove('is-ready'); });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; canvas.parentElement.classList.add('is-ready'); start(); });
  resize(); renderer.render(scene, camera); canvas.parentElement.classList.add('is-ready'); start();
  addEventListener('pagehide', event => {
    if (event.persisted) return; disposed = true; cancelAnimationFrame(frame); resizeObserver.disconnect(); visibility.disconnect();
    document.removeEventListener('visibilitychange', onVisibility); motion.removeEventListener('change', start);
    knight.children.forEach(mesh => mesh.geometry.dispose()); front.dispose(); edge.dispose(); pointsGeometry.dispose(); points.material.dispose(); environmentMap.dispose(); roomGeometry.dispose(); roomMaterial.dispose(); orbit.geometry.dispose(); orbit.material.dispose(); renderer.dispose();
  }, { once: true });
}

export function initMethod(canvas, motion) {
  const ctx = canvas.getContext('2d'); if (!ctx) return () => {};
  const total = 850, positions = Array.from({ length: total }, () => ({ x: 0, y: 0 }));
  let width = 0, height = 0, step = 0, frame = 0, visible = false, settling = 0, initialized = false;
  function target(index) {
    const ratio = index / total, angle = ratio * Math.PI * 2;
    if (step === 0) { const phi = Math.acos(1 - 2 * (index + .5) / total), theta = index * 2.399963; return [Math.cos(theta) * Math.sin(phi) * .33, Math.cos(phi) * .33]; }
    if (step === 1) { const ring = index % 7, a = angle * 7; return [Math.cos(a) * (.2 + ring * .02), Math.sin(a) * (.2 + ring * .02) * .45 + Math.cos(a) * .1]; }
    if (step === 2) { const side = index % 4, t = Math.floor(index / 4) / (total / 4); const inset = Math.floor(index / 60) % 3 * .025; const a = .29 - inset, b = .22 - inset; return side === 0 ? [-a + t * 2 * a, -b] : side === 1 ? [a, -b + t * 2 * b] : side === 2 ? [a - t * 2 * a, b] : [-a, b - t * 2 * b]; }
    if (step === 3) { const arm = index % 6, t = Math.floor(index / 6) / (total / 6), a = arm / 6 * Math.PI * 2; return [Math.cos(a) * t * .37, Math.sin(a) * t * .37]; }
    const a = ratio * Math.PI * 2; return [Math.sin(a) * .33, Math.sin(a * 2) * .16];
  }
  function draw() {
    frame = 0; ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width, height) * 1.05, centerX = width / 2, centerY = height / 2;
    ctx.strokeStyle = '#a0b2ee12'; ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(centerX, centerY, scale * (.12 * i), 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(centerX, 25); ctx.lineTo(centerX, height - 25); ctx.moveTo(25, centerY); ctx.lineTo(width - 25, centerY); ctx.stroke();
    let distance = 0;
    positions.forEach((position, index) => {
      const [x, y] = target(index); const speed = motion.matches ? 1 : .075;
      position.x += (x - position.x) * speed; position.y += (y - position.y) * speed;
      distance += Math.abs(x - position.x) + Math.abs(y - position.y);
      ctx.fillStyle = index % 5 === 0 ? '#edfaff' : '#98c9de'; ctx.globalAlpha = .28 + (index % 5) * .16;
      ctx.beginPath(); ctx.arc(centerX + position.x * scale, centerY + position.y * scale, index % 5 === 0 ? 1.5 : .85, 0, Math.PI * 2); ctx.fill();
    }); ctx.globalAlpha = 1;
    if (!motion.matches && visible && !document.hidden && distance > .025 && settling++ < 160) frame = requestAnimationFrame(draw);
  }
  const start = () => { settling = 0; if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); };
  new ResizeObserver(() => { const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height; const dpr = Math.min(devicePixelRatio, 2); canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (!initialized) { positions.forEach((p, i) => { [p.x, p.y] = target(i); }); initialized = true; } draw(); }).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); else { cancelAnimationFrame(frame); frame = 0; } }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else start(); });
  motion.addEventListener('change', start);
  canvas.closest('.method-visual').classList.add('is-ready');
  return index => { step = index; start(); };
}

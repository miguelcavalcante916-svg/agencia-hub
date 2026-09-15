export async function initGlobalScene(canvas, options = {}) {
  const [THREE, { SVGLoader }] = await Promise.all([
    import('./assets/vendor/three.module.min.js'),
    import('./assets/vendor/SVGLoader.js')
  ]);
  if (!canvas?.isConnected || options.reducedMotion?.matches) return;

  const response = await fetch('app/img/logo.svg');
  if (!response.ok) throw new Error('Brand symbol unavailable');
  const svg = await response.text();
  if (!canvas.isConnected) return;

  const full = options.mode === 'full';
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: full,
    powerPreference: full ? 'high-performance' : 'low-power'
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060914, .035);
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(0, 0, 13.2);

  const group = new THREE.Group();
  const face = new THREE.MeshPhysicalMaterial({
    color: 0xe9eef8,
    metalness: 1,
    roughness: .22,
    clearcoat: .9,
    clearcoatRoughness: .13,
    envMapIntensity: 1.8
  });
  const side = new THREE.MeshStandardMaterial({
    color: 0x7d91b7,
    metalness: 1,
    roughness: .2,
    envMapIntensity: 1.45
  });
  const parsed = new SVGLoader().parse(svg.replace(/currentColor/g, '#ffffff'));
  parsed.paths.forEach(path => {
    SVGLoader.createShapes(path).forEach(shape => {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 70,
        bevelEnabled: true,
        bevelThickness: 9,
        bevelSize: 6,
        bevelSegments: full ? 4 : 2,
        curveSegments: full ? 14 : 8,
        steps: 1
      });
      geometry.translate(-540, -540, -35);
      geometry.scale(.009, -.009, .009);
      geometry.computeVertexNormals();
      group.add(new THREE.Mesh(geometry, [face, side]));
    });
  });
  group.rotation.set(-.08, -.42, -.1);
  scene.add(group);

  const key = new THREE.DirectionalLight(0xf1f6ff, 4.3);
  key.position.set(-4, 5, 6);
  const rim = new THREE.DirectionalLight(0x6ea9ff, 5.2);
  rim.position.set(6, 1, -3);
  const fill = new THREE.DirectionalLight(0x9fb8e8, 2.1);
  fill.position.set(2, -5, 4);
  scene.add(key, rim, fill);

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(5.25, .014, 8, full ? 220 : 110),
    new THREE.MeshBasicMaterial({ color: 0xa9c8ff, transparent: true, opacity: .62 })
  );
  ringA.rotation.set(1.18, .16, -.32);
  ringA.position.y = -.6;
  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(4.6, .008, 6, full ? 180 : 90),
    new THREE.MeshBasicMaterial({ color: 0x7398d5, transparent: true, opacity: .34 })
  );
  ringB.rotation.set(.55, .9, .12);
  scene.add(ringA, ringB);

  const particleCount = full ? 1350 : 480;
  const positions = new Float32Array(particleCount * 3);
  let seed = 8347;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < particleCount; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 3.7 + random() * 5.7;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius * .68;
    positions[i * 3 + 2] = -3 - random() * 7;
  }
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    color: 0xb9d4ff,
    size: full ? .018 : .025,
    transparent: true,
    opacity: full ? .28 : .18,
    depthWrite: false
  });
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  const roomVertices = [];
  const surface = (x, z) => [x, -4.65 + Math.pow(Math.max(0, -z - 2), 2) * .03, z];
  for (let x = -30; x <= 30; x += full ? 1.5 : 3) {
    for (let z = -32; z < 14; z += 1) roomVertices.push(...surface(x, z), ...surface(x, z + 1));
  }
  for (let z = -32; z <= 14; z += full ? 1.7 : 3.4) {
    for (let x = -30; x < 30; x += 1) roomVertices.push(...surface(x, z), ...surface(x + 1, z));
  }
  const roomGeometry = new THREE.BufferGeometry();
  roomGeometry.setAttribute('position', new THREE.Float32BufferAttribute(roomVertices, 3));
  const roomMaterial = new THREE.LineBasicMaterial({ color: 0x6f8abc, transparent: true, opacity: .12, depthWrite: false });
  const room = new THREE.LineSegments(roomGeometry, roomMaterial);
  scene.add(room);

  const state = { scene: 'arrival', progress: 0, velocity: 0 };
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let last = 0;
  let lastDraw = 0;
  let elapsed = 0;
  let disposed = false;
  let lost = false;
  let width = 0;
  let height = 0;

  const sceneTargets = () => {
    const p = state.progress;
    if (state.scene === 'think/create/scale') {
      return { x: p < .34 ? 2.8 : p < .68 ? -2.8 : 2.3, y: (p - .5) * .7, z: 13.8, scale: .82, ry: -.2 + p * 1.15, rz: -.1 + p * .18 };
    }
    if (state.scene === 'knight move') {
      return { x: 2.3 - p * .7, y: .2 - p * .7, z: 14.8 - p * 1.8, scale: .68 + p * .18, ry: .2 + p * .9, rz: -.25 + p * .22 };
    }
    if (state.scene === 'start a project') {
      return { x: 2.7, y: .15, z: 13.4, scale: .83, ry: .75 + p * .18, rz: -.04 };
    }
    return { x: p * 1.1, y: p * .35, z: 13.2 - p * 1.7, scale: 1, ry: -.42 + p * 1.05, rz: -.1 - p * .1 };
  };

  const render = time => {
    frame = 0;
    if (disposed || lost || document.hidden) return;
    if (!full && lastDraw && time - lastDraw < 30) {
      frame = requestAnimationFrame(render);
      return;
    }
    const delta = last ? Math.min((time - last) / 1000, .05) : 1 / 60;
    last = time;
    elapsed += delta;
    const smoothing = 1 - Math.exp(-delta / .18);
    pointerX += (pointerTargetX - pointerX) * smoothing;
    pointerY += (pointerTargetY - pointerY) * smoothing;
    const target = sceneTargets();
    group.position.x += (target.x + pointerX * .35 - group.position.x) * smoothing;
    group.position.y += (target.y - pointerY * .2 - group.position.y) * smoothing;
    group.scale.setScalar(group.scale.x + (target.scale - group.scale.x) * smoothing);
    group.rotation.y += (target.ry + pointerX * .12 - group.rotation.y) * smoothing;
    group.rotation.x += (-.08 + pointerY * .08 - group.rotation.x) * smoothing;
    group.rotation.z += (target.rz + Math.sin(elapsed * .55) * .018 - group.rotation.z) * smoothing;
    key.position.x += (-4 + pointerX * 1.3 - key.position.x) * smoothing;
    key.position.y += (5 - pointerY * .7 - key.position.y) * smoothing;
    rim.position.x += (6 - pointerX * .8 - rim.position.x) * smoothing;
    camera.position.z += (target.z - camera.position.z) * smoothing;
    camera.lookAt(0, 0, 0);
    ringA.rotation.z += delta * (.06 + Math.abs(state.velocity) * .25);
    ringB.rotation.x += delta * .025;
    particles.rotation.z += delta * .012;
    particles.rotation.y += delta * .006;
    room.rotation.y += (state.progress * .1 - room.rotation.y) * smoothing;
    renderer.render(scene, camera);
    lastDraw = time;
    if (state.scene !== 'selected work' && state.scene !== 'agenciahub') {
      frame = requestAnimationFrame(render);
    }
  };

  const resize = () => {
    if (disposed) return;
    const nextWidth = innerWidth;
    const nextHeight = innerHeight;
    if (nextWidth === width && nextHeight === height) return;
    width = nextWidth;
    height = nextHeight;
    const cap = full ? 1.65 : 1;
    const ratio = Math.min(devicePixelRatio || 1, cap, Math.sqrt((full ? 3000000 : 1300000) / Math.max(1, width * height)));
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = camera.aspect < .78 ? 48 : 35;
    camera.updateProjectionMatrix();
    canvas.closest('.world')?.classList.add('is-ready');
  };
  const onPointer = event => {
    if (event.pointerType === 'touch') return;
    pointerTargetX = Math.max(-1, Math.min(1, event.clientX / innerWidth * 2 - 1));
    pointerTargetY = Math.max(-1, Math.min(1, event.clientY / innerHeight * 2 - 1));
  };
  const onContextLost = event => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    canvas.closest('.world')?.classList.remove('is-ready');
  };
  const onContextRestored = () => {
    lost = false;
    resize();
    frame = requestAnimationFrame(render);
  };
  const destroy = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    removeEventListener('resize', resize);
    removeEventListener('pointermove', onPointer);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
    group.children.forEach(mesh => mesh.geometry.dispose());
    face.dispose();
    side.dispose();
    ringA.geometry.dispose();
    ringA.material.dispose();
    ringB.geometry.dispose();
    ringB.material.dispose();
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    roomGeometry.dispose();
    roomMaterial.dispose();
    renderer.dispose();
  };

  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', onPointer, { passive: true });
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  addEventListener('pagehide', event => { if (!event.persisted) destroy(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    else if (!frame && !disposed && !lost) frame = requestAnimationFrame(render);
  });
  window.CavalcanteScene = {
    setState(next) {
      Object.assign(state, next);
      if (!frame && !disposed && !lost && !document.hidden) frame = requestAnimationFrame(render);
    },
    destroy
  };
  if (window.CavalcanteMotionState) Object.assign(state, window.CavalcanteMotionState);
  resize();
  frame = requestAnimationFrame(render);
}

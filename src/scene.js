import * as THREE from 'three';
import gsap from 'gsap';

const destinations = {
  home: { z: 0, color: '#220828' },
  projects: { z: -22, color: '#1d102e' },
  certifications: { z: -44, color: '#281925' },
  about: { z: -66, color: '#0e202b' },
  cv: { z: -88, color: '#151b32' },
  contact: { z: -110, color: '#22112e' },
};

export function initScene(canvas) {
  const compactDevice = window.matchMedia('(max-width: 800px), (pointer: coarse)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !compactDevice, alpha: true, powerPreference: 'low-power' });
  } catch {
    document.body.classList.add('no-webgl');
    canvas.hidden = true;
    return { navigate(route, immediate, onComplete) { onComplete(); } };
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#220828', 0.035);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 70);
  const rig = { z: 0 };
  const mouse = { x: 0, y: 0 };
  const color = new THREE.Color(destinations.home.color);
  let route = 'home';
  let frame;
  let lastTime = 0;
  let flight;
  let arrival;
  let contextLost = false;

  const starPositions = new Float32Array((compactDevice ? 1000 : 2200) * 3);
  for (let i = 0; i < starPositions.length; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 44;
    starPositions[i + 1] = (Math.random() - 0.5) * 30;
    starPositions[i + 2] = -Math.random() * 38 - 2;
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: '#ecdaff', size: 0.018, transparent: true, opacity: 0.65, sizeAttenuation: true }));
  scene.add(stars);

  function wireSphere(color, radius = 1.2) {
    const group = new THREE.Group();
    const surface = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 20), new THREE.MeshBasicMaterial({ color: '#291632', transparent: true, opacity: 0.9 }));
    const wire = new THREE.Mesh(new THREE.SphereGeometry(radius + .008, 32, 20), new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.22 }));
    const dots = new THREE.Points(new THREE.SphereGeometry(radius + .015, 48, 32), new THREE.PointsMaterial({ color, size: .016, transparent: true, opacity: .85 }));
    group.add(surface, wire, dots);
    return group;
  }
  function ring(color, radius, tube = .012) {
    return new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 180), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .55 }));
  }
  const planets = {};
  Object.entries(destinations).forEach(([name, destination]) => {
    const planet = new THREE.Group();
    planet.position.set(2, 0, destination.z - 7);
    scene.add(planet);
    planets[name] = planet;
  });
  const homeSphere = wireSphere('#c4a1e8');
  homeSphere.rotation.z = .22;
  planets.home.add(homeSphere);
  const homeRings = new THREE.Group();
  homeRings.rotation.set(1.15, .25, -.42);
  homeRings.add(ring('#d1b1eb', 1.78), ring('#ac81cb', 1.87, .004), ring('#ac81cb', 2.16, .003));
  planets.home.add(homeRings);
  const satellite = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 12), new THREE.MeshBasicMaterial({ color: '#ebdcfa' }));
  satellite.position.set(1.78, 0, 0);
  homeRings.add(satellite);

  // Preserve the original Projects particle torus and About wireframe sphere.
  const torus = new THREE.Points(new THREE.TorusGeometry(1.25, .3, 32, 180), new THREE.PointsMaterial({ color: '#cbb4ed', size: .016, transparent: true, opacity: .65 }));
  torus.rotation.set(.5, -.55, .3);
  planets.projects.add(torus);
  planets.certifications.add(wireSphere('#e6c38d', 1.05));
  const goldRing = ring('#e6c38d', 1.65, .018);
  goldRing.rotation.set(1.12, .35, -.3);
  planets.certifications.add(goldRing);
  planets.about.add(wireSphere('#9adfe0'));
  planets.cv.add(wireSphere('#adbff5', .95));
  for (let i = 0; i < 2; i++) {
    const orbit = ring('#adbff5', 1.5 + i * .2, .009);
    orbit.rotation.set(1.1, i * 1.2, -.35);
    planets.cv.add(orbit);
  }
  const contactCore = wireSphere('#c09cdd', .8);
  planets.contact.add(contactCore);
  for (let i = 0; i < 3; i++) {
    const orbit = ring('#c09cdd', 1.45 + i * .17, .007);
    orbit.rotation.set(i * .7 + .3, i * .9, .4);
    planets.contact.add(orbit);
  }

  function layout() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactDevice ? 1.25 : 1.75));
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(22.5)) * 7;
    const halfWidth = halfHeight * camera.aspect;
    Object.entries(planets).forEach(([name, planet]) => {
      const mobile = width < 800;
      // Keep the home planet in the right half of the hero at every viewport size.
      const heroCenterY = width < 520 ? 285 : width < 800 ? 345 : width >= 1600 ? 413 : 375;
      planet.position.x = halfWidth * (mobile ? .73 : .49);
      planet.position.y = name === 'home' ? (1 - 2 * heroCenterY / height) * halfHeight : .1;
      planet.scale.setScalar(mobile ? .6 : Math.min(1, width / 1350));
    });
    render();
  }
  function render() {
    if (contextLost) return;
    camera.position.set(reducedMotion.matches ? 0 : mouse.x, reducedMotion.matches ? 0 : mouse.y, rig.z);
    stars.position.z = rig.z;
    renderer.setClearColor(color, 1);
    scene.fog.color.copy(color);
    renderer.render(scene, camera);
  }
  function tick(time) {
    const delta = Math.min((time - lastTime) / 1000 || 0, .05);
    lastTime = time;
    const active = planets[route];
    active.rotation.y += delta * .045;
    homeSphere.rotation.y += delta * .025;
    stars.rotation.z += delta * .0015;
    render();
    frame = requestAnimationFrame(tick);
  }
  function syncAnimation() {
    cancelAnimationFrame(frame);
    lastTime = 0;
    if (!document.hidden && !reducedMotion.matches && !contextLost) frame = requestAnimationFrame(tick);
    else if (!document.hidden) render();
  }
  window.addEventListener('resize', layout);
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
    mouse.x = (event.clientX / window.innerWidth - .5) * .12;
    mouse.y = -(event.clientY / window.innerHeight - .5) * .1;
  }, { passive: true });
  document.addEventListener('visibilitychange', syncAnimation);
  function finishArrival() {
    // Render the final camera position before revealing any page content.
    render();
    const complete = arrival;
    arrival = null;
    if (complete) complete();
  }
  function settleFlight() {
    if (flight) flight.kill();
    rig.z = destinations[route].z;
    color.set(destinations[route].color);
    finishArrival();
  }
  const motionChanged = () => {
    settleFlight();
    syncAnimation();
  };
  // Older Safari uses addListener on MediaQueryList.
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', motionChanged);
  else reducedMotion.addListener(motionChanged);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    canvas.hidden = true;
    document.body.classList.add('no-webgl');
    settleFlight();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    canvas.hidden = false;
    document.body.classList.remove('no-webgl');
    layout();
    syncAnimation();
  });
  layout();
  syncAnimation();
  return {
    navigate(nextRoute, immediate = false, onComplete = () => {}) {
      if (flight) flight.kill();
      route = nextRoute;
      arrival = onComplete;
      if (immediate || reducedMotion.matches || contextLost) {
        settleFlight();
      } else {
        const destination = destinations[route];
        const nextColor = new THREE.Color(destination.color);
        flight = gsap.timeline({ onComplete: finishArrival });
        flight.to(rig, { z: destination.z, duration: 1.65, ease: 'power2.inOut' }, 0);
        flight.to(color, { r: nextColor.r, g: nextColor.g, b: nextColor.b, duration: 1.5, ease: 'power2.inOut' }, 0);
      }
    },
  };
}

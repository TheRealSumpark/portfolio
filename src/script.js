import "./style.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import {
  AdditiveBlending,
  MeshBasicMaterial,
  MultiplyBlending,
  NormalBlending,
  SubtractiveBlending,
} from "three";

let renderer, camera, scene, torus, particlesMesh;

const canvasContainer = document.querySelector("#canvasContainer");
function init() {
  scene = new THREE.Scene();

  //TORUS
  const geometry = new THREE.TorusGeometry(0.9, 0.2, 16, 110);
  const material = new THREE.PointsMaterial({
    size: 0.005,
    color: 0xafffff,
  });

  torus = new THREE.Points(geometry, material);
  torus.position.set(-1.1, 0, 0);
  scene.add(torus);

  //PARTICLES
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 6000;

  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 13;
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(posArray, 3)
  );

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: 0xffffff,
    blending: NormalBlending,
  });

  particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);

  scene.add(particlesMesh);

  //LIGHT
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0, 0, 100);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvasContainer,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(new THREE.Color(0x220828));
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", onWindowResize, false);

/**
 *
 * Mouse
 */

document.addEventListener("mousemove", animateParticles);
let mouse = new THREE.Vector2(0, 0);

let windowX = window.innerWidth / 2;
let windowY = window.innerHeight / 2;

function animateParticles(event) {
  mouse.x = event.clientX - windowX;
  mouse.y = event.clientY - windowY;
}

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  torus.rotation.y += 0.002;

  const targetX = mouse.x * 0.0001;
  const targetY = mouse.y * 0.0001;
  camera.position.y += targetY - camera.position.y;
  camera.position.x += targetX - camera.position.x;

  particlesMesh.rotation.y += 0.0001;
  particlesMesh.rotation.z += 0.0001;
  // Update Orbital Controls
  // controls.update()

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

init();
tick();

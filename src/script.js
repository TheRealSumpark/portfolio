import "./style.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Howl, Howler } from "howler";
import $ from "jquery";
import gsap from "gsap";

import {
  AdditiveBlending,
  MeshBasicMaterial,
  MultiplyBlending,
  NormalBlending,
  SubtractiveBlending,
} from "three";

let renderer, camera, scene, torus, particlesMesh, controls, state;

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

  console.log(posArray);

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

  //camera
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

  //camera controls
  controls = new OrbitControls(camera, renderer.domElement);
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

const tick = () => {
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

  /**
   * state used for navigation
   *
   * states :
   * bio_page
   * projects_page
   * contact_page
   *
   */
  state = "bio_page";
  $("#projects_page").hide();
};

init();
tick();

var contactButton = document.getElementById("contactButton");
contactButton.addEventListener("click", function (event) {
  const timeline = gsap.timeline();

  timeline.to(particlesMesh.position, {
    delay: 0.5,
    z: -990,
    duration: 3,
    ease: Power2.easeOut,
  });

  timeline.to($("#projects_page:before"), {
    zIndex: 1,
    ease: Power3.easeIn,
    display: "block",
  });

  gsap.to([$("#bio_page"), $("#menu")], {
    delay: 0.4,
    opacity: 0,
    display: "none",
    ease: Power3.easeIn,
    duration: 1,
  });

  gsap.to(torus.position, {
    z: 10,
    duration: 1,
    ease: Power2.easeIn,
  });

  gsap.to(camera.position, {
    delay: 0.5,
    z: -990,
    duration: 3,
    ease: Power2.easeOut,
  });

  //animate color when transitioning
  var color = renderer.getClearColor();
  gsap.to(color, {
    r: 0,
    g: 0,
    b: 0,
    duration: 2,
    ease: Power2.easeIn,
    onUpdate() {
      renderer.setClearColor(color);
    },
  });

  controls.update();

  console.log(particlesMesh.position);
});

/**
 * Sound
 */

// set up the site default sounds

let soundOn = true;
var sound = new Howl({
  src: ["sounds/arpeggios_from_heaven.mp3"],
  loop: true,
  volume: 0.5,
  html5: true,

  name: "arpeggios_from_heaven",
});

sound.play(0);

//global mute control
const muteAll = function (ignoreGlobalSoundState) {
  console.log("mute all ");
  $(".footer-sound .sbar").addClass("noAnim");
  clearInterval(window.muteInterval);
  var v = Howler.volume();
  window.muteInterval = setInterval(function () {
    v -= 0.1;
    Howler.volume(v);
    if (v <= 0.0) {
      Howler.volume(0.0);
      clearInterval(window.muteInterval);
    }
    //console.log("ticking");
  }, 50);

  //_this.analyser.minDecibels = -100;

  // flag will
  if (!ignoreGlobalSoundState) {
    soundOn = false;
  }
};

// global unmute control
const unMuteAll = function (ignoreGlobalSoundState) {
  console.log("unMute all ");
  $(".footer-sound .sbar").removeClass("noAnim");
  clearInterval(window.muteInterval);
  var v = Howler.volume();
  window.muteInterval = setInterval(function () {
    v += 0.1;
    Howler.volume(v);
    if (v >= 1) {
      Howler.volume(1);
      clearInterval(window.muteInterval);
    }
    //console.log("ticking");
  }, 50);

  //_this.analyser.minDecibels = -60;

  // flag will
  if (!ignoreGlobalSoundState) {
    soundOn = true;
  }
};

$(".footer-sound").click(function (e) {
  sound.play("arpeggios_from_heaven");

  //_this.audio.playFromTo("click",0,1);
  if (soundOn) {
    $(".footer-sound .sbar").addClass("noAnim");
    soundOn = false;
    muteAll();
  } else {
    $(".footer-sound .sbar").removeClass("noAnim");
    soundOn = true;
    unMuteAll();
  }
});

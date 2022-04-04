import * as THREE from "three";
import * as dat from "dat.gui";

import { Howl, Howler } from "howler";
import $ from "jquery";
import gsap from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import "./style.css";
import github from "../assets/images/github.png";
import VanillaTilt from "vanilla-tilt";

import {
  AdditiveBlending,
  MeshBasicMaterial,
  MultiplyBlending,
  NormalBlending,
  SubtractiveBlending,
} from "three";

let renderer, camera, scene, torus, particlesMesh, state;

const canvasContainer = document.querySelector("#canvasContainer");
function init() {
  $(".list-item").each(function () {
    $(this).find("img").attr("src", github);
  });

  AOS.init({
    useClassNames: true,
    delay: 200,
    offset: 480,
    duration: 400,
    mirror: true,
    once: false,
  });
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

  $("#projects_page").hide();
  transition();
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
};

/**
 * Initialization
 */
init();
initSound();
initValinnaTilt();
tick();

/* end initialization */

function initValinnaTilt() {
  VanillaTilt.init(document.querySelectorAll(".tilt"), {
    reverse: true,
    max: 8,
    scale: 1.04,
    glare: true,
    easing: "cubic-bezier(.03,.98,.52,.99)",
    speed: 300,
    "max-glare": 0.5,
  });
}

var projectsButton = document.getElementById("projectsButton");
projectsButton.addEventListener("click", function (event) {
  transition();
});

function transition() {
  const timeline = gsap.timeline();

  timeline.to([$("#bio_page"), $("#menu")], {
    delay: 0.4,
    opacity: 0,
    display: "none",
    ease: Power3.easeIn,
    duration: 1,
    onComplete() {
      $("#menu").insertAfter($("#projects_title"));
    },
  });

  timeline.to(
    particlesMesh.position,
    {
      delay: 0.5,
      z: -990,
      duration: 3,
      ease: Power2.easeOut,
    },
    0
  );

  timeline.to($("#projects_page"), {
    zIndex: 1,
    ease: Power3.easeIn,
    display: "block",

    onUpdate() {
      $("#menu").fadeIn();
      $("#menu").css("opacity", "1");
    },
  });

  timeline.to(
    torus.position,
    {
      z: 10,
      duration: 1,
      ease: Power2.easeIn,
    },
    0
  );

  timeline.to(
    camera.position,
    {
      delay: 0.5,
      z: -990,
      duration: 3,
      ease: Power2.easeOut,
    },
    0
  );

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

  console.log(particlesMesh.position);
}

/**
 * Sound
 */

// set up the site default sounds
function initSound() {
  let soundOn = true;
  var sound = new Howl({
    src: ["sounds/max_cooper_order_from_chaos.mp3"],
    loop: true,
    volume: 0.5,
    html5: true,

    name: "max_cooper_order_from_chaos",
  });
  //sound init
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
    sound.play("max_cooper_order_from_chaos");

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
}

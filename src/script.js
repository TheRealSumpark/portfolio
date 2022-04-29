import * as THREE from "three";
import * as dat from "dat.gui";

import $ from "jquery";
import gsap from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import "./style.css";
import github from "../assets/icons/github.svg";
import VanillaTilt from "vanilla-tilt";
import { initSound } from "./sound";
import { NormalBlending } from "three";
let renderer, camera, scene, torus, particlesMesh, state, sphere;

/**
 * Setting camera positions used for navigation between sections
 */
let camera_position_home = new THREE.Vector3(0, 0, 2);
let camera_position_projects = new THREE.Vector3(0, 0, -990);
let camera_position_contacts = new THREE.Vector3(3, 5, -1100);

const canvasContainer = document.querySelector("#canvasContainer");
function init() {
  /**
   * states used for navigation
   *
   * states :
   * home_page
   * projects_page
   * bio_page
   *
   */
  state = "home_page";

  // initializing projects icons
  $(".list-item").each(function () {
    $(this).find("img").attr("src", github);
  });

  /**
   *  Creating Torus
   */
  const torus_geometry = new THREE.TorusGeometry(0.9, 0.2, 16, 110);
  const torus_material = new THREE.PointsMaterial({
    size: 0.005,
    color: 0xffffff,
  });

  torus = new THREE.Points(torus_geometry, torus_material);
  torus.position.set(1, 0, camera_position_projects.z - 1);
  /******  End Creating Torus*/

  /**
   *
   *  Creating Sphere
   *
   * */
  const sphere_geometry = new THREE.SphereGeometry();
  const sphere_material = new THREE.LineBasicMaterial({
    color: 0xafffff,
    linewidth: 2,
    size: 0.5,
    linecap: "round", //ignored by WebGLRenderer
    linejoin: "round",
  });
  sphere = new THREE.Line(sphere_geometry, sphere_material);
  sphere.position.z = camera_position_contacts.z - 1;
  sphere.position.x = 2;
  /**** End Creating Sphere*/

  /**
   * Creating Particles
   *  */
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 6000;

  const posArray = new Float32Array(particlesCount * 3);
  //random positions for each particle
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

  /*** End Creating Particles ***/

  /**
   * Creating scene and adding objects to it
   *
   * */
  scene = new THREE.Scene();
  scene.add(torus);
  scene.add(sphere);
  scene.add(particlesMesh);
  /** End creating Scene ***/

  /**
   * Creating Light Source
   * */
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0, 0, 100);
  /**  End light ***/

  /**
   * Creating Camera
   */
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = camera_position_home.z;

  /** End Creating Camera **/

  /**
   * Creating Renderer
   */
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvasContainer,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(new THREE.Color(0x220828)); // background colour

  /** End Creating Renderer */

  /**
   * Sections initialization
   */
  $("#projects_page").hide();
  $("#projects_page").css({ opacity: 0 });
  $("#bio_page").hide();
  $("#bio_page").css({ opacity: 0 });

  // assigning actions to menu buttons
  $("#homeButton").on("click", (event) => goToHome());
  $("#projectsButton").on("click", (event) => goToProjects());
  $("#bioButton").on("click", (event) => goToBio());
}
/** End Sections initialization */

/**
 * Handling webgl render zone when resizing
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", onWindowResize, false);
/** End  */

/**
 *
 * Mouse
 * Moving particles when mouse moves
 */

document.addEventListener("mousemove", animateParticles);
let mouse = new THREE.Vector2(0, 0);

let windowX = window.innerWidth / 2;
let windowY = window.innerHeight / 2;

function animateParticles(event) {
  mouse.x = event.clientX - windowX;
  mouse.y = event.clientY - windowY;
}
/** End Mouse  */

/**
 * Animate
 * Animation Loop
 */

const tick = () => {
  // Update objects
  torus.rotation.y += 0.002;

  sphere.rotation.y += 0.002;
  sphere.rotation.x += 0.001;

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
};
/** End Animate */

/**
 * Initialization
 */
initVanillaTilt();
initAos();
init();
initSound();
tick();
/* end initialization */

/**
 * Initializing AOS Library
 */
function initAos() {
  AOS.init({
    useClassNames: true,
    delay: 300,
    duration: 500,
    mirror: true,
    once: false,
    anchorPlacement: "bottom-bottom",
  });

  window.addEventListener("scroll", function () {
    AOS.refresh();
  });
}
/**End AOS init */

/**
 * Initializing Tilt Library
 */
function initVanillaTilt() {
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
/**End Tilt init */

/**
 * Begin Navigation
 */
function goToHome() {
  if (state == "home_page") return;
  const timeline = gsap.timeline();

  // if coming from projects section, hide projects section
  if (state == "projects_page") {
    timeline.to([$("#projects_page"), $("#menu")], {
      delay: 0.4,
      opacity: 0,
      display: "none",
      ease: Power3.easeIn,
      duration: 1,
      onComplete() {
        $("#menu").appendTo($("#home_page"));
      },
    });
  } else if (state == "bio_page") {
    // if coming from bio section, hide bio section
    timeline.to([$("#bio_page"), $("#menu")], {
      delay: 0.4,
      opacity: 0,
      display: "none",
      ease: Power3.easeIn,
      duration: 1,
      onComplete() {
        $("#menu").appendTo($("#home_page"));
      },
    });
  }
  timeline.to(
    particlesMesh.position,
    {
      delay: 0.5,
      z: camera_position_home.z - 3,
      duration: 3,
      ease: Power2.easeInOut,
    },
    0
  );

  timeline.to(
    camera.position,
    {
      delay: 0.5,
      z: camera_position_home.z,
      duration: 3,
      ease: Power2.easeInOut,
    },
    0
  );

  //animate color when transitioning
  var color = renderer.getClearColor();
  gsap.to(color, {
    r: 0.133,
    g: 0.031,
    b: 0.157,
    duration: 2,
    ease: Power2.easeIn,
    onUpdate() {
      renderer.setClearColor(color);
    },
  });

  //reveal home section
  timeline.to($("#home_page"), {
    zIndex: 1,
    duration: 1,
    ease: Power3.easeIn,
    display: "block",
    opacity: 1,
    onUpdate() {
      // show menu
      $("#menu").fadeIn(12);
      $("#menu").css("opacity", "1");
    },
  });

  state = "home_page";
}

function goToBio() {
  if (state == "bio_page") return;

  const timeline = gsap.timeline();

  if (state == "home_page") {
    timeline.to([$("#home_page"), $("#menu")], {
      delay: 0.4,
      opacity: 0,
      display: "none",
      ease: Power3.easeIn,
      duration: 1,
      onComplete() {
        $("#menu").insertAfter($("#bio_title"));
      },
    });
  } else if (state == "projects_page") {
    timeline.to([$("#projects_page"), $("#menu")], {
      delay: 0.4,
      opacity: 0,
      display: "none",
      ease: Power3.easeIn,
      duration: 1,
      onComplete() {
        $("#menu").insertAfter($("#bio_title"));
      },
    });
  }
  timeline.to(
    particlesMesh.position,
    {
      delay: 0.5,
      z: camera_position_contacts.z + 2,
      duration: 3,
      ease: Power2.easeInOut,
    },
    0
  );
  var color = renderer.getClearColor();
  gsap.to(color, {
    r: 0.031,
    g: 0.063,
    b: 0.098,
    duration: 2,
    ease: Power2.easeIn,
    onUpdate() {
      renderer.setClearColor(color);
    },
  });
  timeline.to(
    camera.position,
    {
      delay: 0.5,
      z: camera_position_contacts.z,
      duration: 3,
      ease: Power2.easeInOut,
    },
    0
  );

  timeline.to($("#bio_page"), {
    zIndex: 1,
    duration: 1,
    ease: Power3.easeIn,
    display: "block",
    opacity: 1,
    onUpdate() {
      $("#menu").fadeIn(12);
      $("#menu").css("opacity", "1");
    },
  });

  state = "bio_page";
}

function goToProjects() {
  if (state == "projects_page") return;
  const timeline = gsap.timeline();

  if (state == "home_page") {
    timeline.to([$("#home_page"), $("#menu")], {
      delay: 0.4,
      opacity: 0,
      display: "none",
      ease: Power3.easeIn,
      duration: 1,
      onComplete() {
        $("#menu").insertAfter($("#projects_title"));
      },
    });
  } else if (state == "bio_page") {
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
  }

  timeline.to(
    particlesMesh.position,
    {
      delay: 0.5,
      z: camera_position_projects.z,
      duration: 3,
      ease: Power2.easeInOut,
    },
    0
  );

  timeline.to(
    camera.position,
    {
      delay: 0.5,
      z: camera_position_projects.z,
      duration: 3,
      ease: Power2.easeInOut,
    },
    0
  );

  //animate color when transitioning
  var color = renderer.getClearColor();
  gsap.to(color, {
    r: 0.071,
    g: 0.043,
    b: 0.114,
    duration: 2,
    ease: Power2.easeIn,
    onUpdate() {
      renderer.setClearColor(color);
    },
  });

  timeline.to($("#projects_page"), {
    zIndex: 1,
    duration: 1,
    ease: Power3.easeIn,
    display: "block",
    opacity: 1,
    onUpdate() {
      $("#menu").fadeIn(12);
      $("#menu").css("opacity", "1");
    },
  });

  state = "projects_page";
  $(".list-item").removeClass("aos-animate");
}

/** End Navigation  */

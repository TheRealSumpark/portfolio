import * as THREE from "three";
import * as dat from "dat.gui";

import $ from "jquery";
import gsap from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import "./style.css";
import github from "../assets/images/github.png";
import VanillaTilt from "vanilla-tilt";
import { initSound } from "./sound";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";

import {
  AdditiveBlending,
  Mesh,
  MeshBasicMaterial,
  MultiplyBlending,
  NormalBlending,
  SubtractiveBlending,
} from "three";
import Aos from "aos";

let renderer, camera, scene, torus, particlesMesh, state, sphere;

let camera_position_home = new THREE.Vector3(0, 0, 2);
let camera_position_projects = new THREE.Vector3(0, 0, -990);
let camera_position_contacts = new THREE.Vector3(3, 5, -1100);

const canvasContainer = document.querySelector("#canvasContainer");
function init() {
  /**
   * state used for navigation
   *
   * states :
   * home_page
   * projects_page
   * bio_page
   *
   */
  state = "home_page";

  $(".list-item").each(function () {
    $(this).find("img").attr("src", github);
  });

  scene = new THREE.Scene();

  //TORUS
  const geometry = new THREE.TorusGeometry(0.9, 0.2, 16, 110);
  const material = new THREE.PointsMaterial({
    size: 0.005,
    color: 0xafffff,
  });

  torus = new THREE.Points(geometry, material);
  torus.position.set(1, 0, camera_position_projects.z - 1);
  scene.add(torus);

  // SCPHERE
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
  scene.add(sphere);

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
  camera.position.z = camera_position_home.z;

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvasContainer,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(new THREE.Color(0x220828));

  $("#projects_page").hide();
  $("#projects_page").css({ opacity: 0 });
  $("#bio_page").hide();
  $("#bio_page").css({ opacity: 0 });
  $("#homeButton").on("click", (event) => goToHome());
  $("#projectsButton").on("click", (event) => goToProjects());
  $("#bioButton").on("click", (event) => goToBio());

  // initImage();
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

/**
 * Initialization
 */
initVanillaTilt();
initAos();
init();
// initSound();
tick();
/* end initialization */

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

function goToHome() {
  if (state == "home_page") return;
  const timeline = gsap.timeline();

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
    r: 0,
    g: 0,
    b: 0,
    duration: 2,
    ease: Power2.easeIn,
    onUpdate() {
      renderer.setClearColor(color);
    },
  });

  timeline.to($("#home_page"), {
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
  console.log("PARTICLES", particlesMesh.position);
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
      ease: Power2.easeOut,
    },
    0
  );
  timeline.to(
    camera.position,
    {
      delay: 0.5,
      z: camera_position_contacts.z,
      duration: 3,
      ease: Power2.easeOut,
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
  console.log("camera_position", camera.position);
  console.log("PARTICLES", particlesMesh.position);
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
    r: 0,
    g: 0,
    b: 0,
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

  console.log("PARTICLES", particlesMesh.position);

  state = "projects_page";
  $(".list-item").removeClass("aos-animate");
}

function initImage() {
  const group = new THREE.Group();
  group.position.set(0, -6, -10);
  scene.add(group);
  let sampler = null;

  let paths = [];
  new OBJLoader().load(
    "Alien.obj",
    (obj) => {
      sampler = new MeshSurfaceSampler(obj.children[0]).build();
      for (let i = 0; i < 4; i++) {
        const path = new Path(i);
        paths.push(path);
        group.add(path.line);
      }

      renderer.setAnimationLoop(render);
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + "% loaded"),
    (err) => console.error(err)
  );

  const tempPosition = new THREE.Vector3();
  const materials = [
    new THREE.LineBasicMaterial({
      color: 0xfaad80,
      transparent: true,
      opacity: 0.5,
    }),
    new THREE.LineBasicMaterial({
      color: 0xff6767,
      transparent: true,
      opacity: 0.5,
    }),
    new THREE.LineBasicMaterial({
      color: 0xff3d68,
      transparent: true,
      opacity: 0.5,
    }),
    new THREE.LineBasicMaterial({
      color: 0xa73489,
      transparent: true,
      opacity: 0.5,
    }),
  ];
  class Path {
    constructor(index) {
      this.geometry = new THREE.BufferGeometry();
      this.material = materials[index % 4];
      this.line = new THREE.Line(this.geometry, this.material);
      this.vertices = [];

      sampler.sample(tempPosition);
      this.previousPoint = tempPosition.clone();
    }
    update() {
      let pointFound = false;
      while (!pointFound) {
        sampler.sample(tempPosition);
        if (tempPosition.distanceTo(this.previousPoint) < 30) {
          this.vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
          this.previousPoint = tempPosition.clone();
          pointFound = true;
        }
      }
      this.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(this.vertices, 3)
      );
    }
  }

  function render(a) {
    paths.forEach((path) => {
      if (path.vertices.length < 1000) {
        path.update();
      }
    });
  }
}

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import * as THREE from "three";
export function initImage() {
  /* Create global variable we will need for later */
  let elephant = null;
  let sampler = null;
  /* Load the .obj file */
  new OBJLoader().load("Lion_01.obj", (obj) => {
    /* The loaded object with my file being a group, I need to pick its first child */
    elephant = obj.children[0];
    /* Update the material of the object */
    elephant.material = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
    });
    /* Add the elephant in the scene */

    scene.add(obj);
    console.log("SUCCESS", obj);

    /* Create a surface sampler from the loaded model */
    sampler = new MeshSurfaceSampler(elephant).build();
  });

  /* Used to store each particle coordinates & color */
  const vertices = [];
  const colors = [];
  /* The geometry of the points */
  const sparklesGeometry = new THREE.BufferGeometry();
  /* The material of the points */
  const sparklesMaterial = new THREE.PointsMaterial({
    size: 3,
    alphaTest: 0.2,
    map: new THREE.TextureLoader().load("doTexture.png"),
    vertexColors: true, // Let Three.js knows that each point has a different color
  });
  /* Create a Points object */
  const points = new THREE.Points(sparklesGeometry, sparklesMaterial);
  /* Add the points into the scene */
  scene.add(points);

  /* Define the colors we want */
  const palette = [
    new THREE.Color("#FAAD80"),
    new THREE.Color("#FF6767"),
    new THREE.Color("#FF3D68"),
    new THREE.Color("#A73489"),
  ];
  /* Vector to sample a random point */
  const tempPosition = new THREE.Vector3();

  function addPoint() {
    /* Sample a new point */
    sampler.sample(tempPosition);
    /* Push the point coordinates */
    vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
    /* Update the position attribute with the new coordinates */
    sparklesGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    /* Get a random color from the palette */
    const color = palette[Math.floor(Math.random() * palette.length)];
    /* Push the picked color */
    colors.push(color.r, color.g, color.b);
    /* Update the color attribute with the new colors */
    sparklesGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
  }
}

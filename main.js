import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

// Setup
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-3, 0, 50);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Geometry: cube
const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshBasicMaterial({ color: 0xff6347 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.set(-15, 0, -15);
cube.rotation.set(2, 0.5, 0);

// Geometry: icosahedron
const ico = new THREE.IcosahedronGeometry(10);
const icoMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const icoMesh = new THREE.Mesh(ico, icoMaterial);
icoMesh.position.set(15, 0, -15);
scene.add(icoMesh);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, -10, 10);

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.position.set(25, -15, -400);

scene.add(pointLight, ambientLight);

// Helpers
scene.add(new THREE.PointLightHelper(pointLight));
scene.add(new THREE.GridHelper(200, 50));

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Background
const spaceTexture = new THREE.TextureLoader().load('images/fogCity.jpg');
scene.background = spaceTexture;

// Normal-mapped torus knot
const normalTexture = new THREE.TextureLoader().load('images/normals/spongeNormal.png');
const torusGeo = new THREE.TorusKnotGeometry(5, 1, 250, 5, 9, 15);
const torusMaterial = new THREE.MeshStandardMaterial({
    normalMap: normalTexture,
    roughness: 0,
    metalness: 0.8,
});
const torusKnot = new THREE.Mesh(torusGeo, torusMaterial);
torusKnot.position.y = 20;
scene.add(torusKnot);

// Animate
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    icoMesh.rotation.z -= 0.03;
    icoMesh.rotation.y -= 0.03;
    controls.update();
    renderer.render(scene, camera);
}
animate();
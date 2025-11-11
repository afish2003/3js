// === Imports ===
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

// === Scene Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122);
scene.fog = new THREE.FogExp2(0x111122, 0.008);

// === Lighting ===
const moonLight = new THREE.DirectionalLight(0x99ccff, 1.8);
moonLight.position.set(-30, 50, 50);
scene.add(moonLight);

const ambient = new THREE.AmbientLight(0x404070, 0.4);
scene.add(ambient);

// === Camera ===
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 50);
camera.lookAt(0, 0, 0);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// === Resize Handling ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);

// === Globals ===
let rocket = null;
let rocketSpeed = 0.25;

const asteroidGroup = new THREE.Group();
scene.add(asteroidGroup);

const planets = [];

const rand = (min, max) => Math.random() * (max - min) + min;

// === Stars ===
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 2000;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// === Planets ===
function createPlanet(color, x, y, z, size) {
    const geo = new THREE.SphereGeometry(size, 48, 48);
    const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.9,
        metalness: 0.1
    });
    const planet = new THREE.Mesh(geo, mat);
    planet.position.set(x, y, z);
    scene.add(planet);
    planets.push(planet);
}

createPlanet(0x2244ff, -20, 10, -500, 28);
createPlanet(0xff8844, 30, -10, -700, 36);
createPlanet(0x44ffaa, 0, -5, -900, 24);

// === Asteroids ===
function createAsteroid() {
    const radius = rand(1.0, 4.0);
    const detail = 1;
    const geo = new THREE.DodecahedronGeometry(radius, detail);
    const mat = new THREE.MeshStandardMaterial({
        color: 0x777777,
        roughness: 1,
        metalness: 0.2
    });
    const rock = new THREE.Mesh(geo, mat);
    rock.position.set(
        rand(-120, 120),
        rand(-80, 80),
        rand(-900, -200)
    );
    rock.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    rock.userData.rot = new THREE.Vector3(rand(-0.02, 0.02), rand(-0.02, 0.02), rand(-0.02, 0.02));
    asteroidGroup.add(rock);
}
for (let i = 0; i < 120; i++) createAsteroid();

// === Rocket Loader ===
const loader = new GLTFLoader();
loader.load(
    'models/rocket.glb',
    (gltf) => {
        rocket = gltf.scene;
        rocket.scale.set(5, 5, 5);
        rocket.position.set(0, -6, -40);
        rocket.rotation.x = -Math.PI / 2;
        rocket.rotation.y = Math.PI * 0.25;
        scene.add(rocket);
    },
    undefined,
    (err) => {}
);

// === Input Handling ===
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') rocketSpeed = Math.min(rocketSpeed + 0.15, 1.0);
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') rocketSpeed = Math.max(0.25, rocketSpeed - 0.15);
});

// === Explosions ===
function createExplosion(x, y, z) {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 12;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xffaa33,
        size: 3,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const burst = new THREE.Points(geo, mat);
    burst.position.set(x, y, z);
    scene.add(burst);
    let life = 24;
    const tick = () => {
        if (--life <= 0) {
            scene.remove(burst);
            geo.dispose();
            return;
        }
        mat.opacity *= 0.9;
        requestAnimationFrame(tick);
    };
    tick();
}

// === Animation Loop ===
function animate() {
    requestAnimationFrame(animate);

    stars.rotation.z += 0.0005;

    for (const p of planets) {
        p.position.z += rocketSpeed;
        if (p.position.z > -10) {
            p.position.set(rand(-60, 60), rand(-40, 40), rand(-900, -700));
        }
    }

    for (const a of asteroidGroup.children) {
        a.rotation.x += a.userData.rot.x;
        a.rotation.y += a.userData.rot.y;
        a.rotation.z += a.userData.rot.z;
        a.position.z += rocketSpeed * 2.0;
        if (a.position.z > -30) {
            if (Math.random() < 0.25) createExplosion(a.position.x, a.position.y, a.position.z - 5);
            a.position.set(rand(-120, 120), rand(-80, 80), rand(-900, -200));
        }
    }

    if (rocket) {
        rocket.rotation.y += 0.01;
        if (rocket.position.z < -120) rocket.position.z = -40;
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();
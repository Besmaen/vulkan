import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// --- Configuration ---
const CONFIG = {
    camera: {
        fov: 45,
        near: 0.1,
        far: 1000,
        posX: 0, posY: 2, posZ: 10
    },
    controls: {
        minDist: 3,
        maxDist: 15,
        targetY: 1
    },
    transition: {
        fadeStart: 8, // Distance to start fading exterior
        fadeEnd: 5    // Distance where exterior is fully invisible
    },
    labels: [
        { id: 'magma', text: 'Magmakammer', position: new THREE.Vector3(0, -2.0, 0) },
        { id: 'vent', text: 'Hauptschlot', position: new THREE.Vector3(0, 0.0, 0) },
        { id: 'crust', text: 'Erdkruste', position: new THREE.Vector3(3, 0.0, 0) },
        { id: 'crater', text: 'Krater', position: new THREE.Vector3(0, 3.0, 0) },
        { id: 'ash', text: 'Aschewolke', position: new THREE.Vector3(0, 4.0, 0) }
    ],
    explanations: {
        magma: { title: "Magmakammer", text: "Hallo! Das hier ganz unten ist die Magmakammer. Hier blubbert flüssiges, superheißes Gestein tief in der Erde. Stell es dir vor wie einen riesigen Kochtopf!" },

        vent: { title: "Hauptschlot", text: "Das ist der Schlot. Wenn der Druck im Kochtopf zu groß wird, steigt das flüssige Gestein hier wie durch einen riesigen Strohhalm nach oben." },
        crust: { title: "Erdkruste", text: "Das ist die Erdkruste, also der Boden, auf dem wir stehen. Sie ist wie die Schale eines Apfels, die das heiße Innere der Erde schützt." },
        crater: { title: "Krater", text: "Hier oben ist der Krater! Das ist die Öffnung des Vulkans. Wenn das flüssige Gestein hier herauskommt, nennt man es nicht mehr Magma, sondern Lava." },
        ash: { title: "Aschewolke", text: "Manchmal spuckt der Vulkan nicht nur Lava, sondern auch ganz viel Staub und Asche hoch in die Luft. Das ist die Aschewolke." }
    }
};

// --- DOM Elements ---
const canvas = document.getElementById('three-canvas');
const container = document.getElementById('scene-container');
const labelsContainer = document.getElementById('labels-container');
const characterContainer = document.getElementById('character-container');
const characterText = document.getElementById('character-text');
const topicTitle = document.getElementById('topic-title');
const btnEruption = document.getElementById('btn-eruption');
const bgPlaceholder = document.querySelector('.video-placeholder');

// --- Three.js Setup ---
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    container.offsetWidth / container.offsetHeight,
    CONFIG.camera.near,
    CONFIG.camera.far
);
camera.position.set(CONFIG.camera.posX, CONFIG.camera.posY, CONFIG.camera.posZ);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2; // Closer minimum for better inspection
controls.maxDistance = 50; // Further max for large models
controls.target.set(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Brighter
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2); // Stronger sun
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0xffedd0, 2, 20); // Warm fill
pointLight.position.set(-5, 5, 5);
scene.add(pointLight);

// Debug Helpers
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// --- Models ---
let volcanoExterior, volcanoInterior;
const loader = new GLTFLoader();

function fitModelToScene(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Reset position to center logic
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);

    // Scale adjustment
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 6; // Target size in scene units
    const scale = targetSize / maxDim;

    model.scale.setScalar(scale);

    console.log(`Model Loaded: Scaled by ${scale} to fit scene.`);
}

// Load Exterior
loader.load('assets/models/volcano_exterior.glb', (gltf) => {
    volcanoExterior = gltf.scene;

    // Auto-center and Scale
    fitModelToScene(volcanoExterior);
    // volcanoExterior.position.y -= 0.5; // Reset to center based on feedback
    volcanoExterior.position.y = -0.7;

    // Verify visibility
    volcanoExterior.traverse((child) => {
        if (child.isMesh) {
            child.material.transparent = true;
            child.material.opacity = 1;
            child.material.side = THREE.DoubleSide; // Ensure visible from inside if needed
        }
    });

    scene.add(volcanoExterior);
    console.log("Exterior Loaded Successfully");

}, undefined, (error) => {
    console.error('Error loading exterior:', error);
});

// Load Interior
loader.load('assets/models/volcano_interior.glb', (gltf) => {
    volcanoInterior = gltf.scene;

    fitModelToScene(volcanoInterior);
    volcanoInterior.position.y = -2.0; // Match exterior

    scene.add(volcanoInterior);
    console.log("Interior Loaded Successfully");

}, undefined, (error) => {
    console.error('Error loading interior:', error);
});


// --- Labels System ---
const labelElements = [];

function createLabels() {
    CONFIG.labels.forEach((data) => {
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = data.text;
        div.style.cursor = 'pointer';

        // Interaction
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            showCharacter(CONFIG.explanations[data.id].title, CONFIG.explanations[data.id].text);
        });

        // Add to DOM
        labelsContainer.appendChild(div);

        // Track
        labelElements.push({
            element: div,
            position: data.position
        });
    });
}
createLabels();

function updateLabels() {
    labelElements.forEach((labelItem) => {
        // Project 3D position to 2D screen space
        const tempV = labelItem.position.clone();
        tempV.project(camera);

        // Convert -1...+1 to screen coordinates
        const x = (tempV.x * .5 + .5) * container.offsetWidth;
        const y = (tempV.y * -.5 + .5) * container.offsetHeight;

        // Hide if behind camera
        // Or fade based on exterior opacity? 
        // For now just position:
        labelItem.element.style.transform = `translate(-50%, -50%)`;
        labelItem.element.style.left = `${x}px`;
        labelItem.element.style.top = `${y}px`;

        // Optional: Hide labels if camera is too far/close or if view is blocked
    });
}


// --- UI Logic ---
function showCharacter(title, text) {
    if (topicTitle) topicTitle.textContent = title;
    characterText.textContent = text;
    characterContainer.classList.remove('hidden');
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    controls.update();

    // Zoom Transition Logic
    if (volcanoExterior) {
        const dist = camera.position.distanceTo(controls.target);

        // Calculate Opacity based on distance
        // Far (> fadeStart) = Opacity 1
        // Close (< fadeEnd) = Opacity 0
        let opacity = (dist - CONFIG.transition.fadeEnd) / (CONFIG.transition.fadeStart - CONFIG.transition.fadeEnd);
        opacity = Math.max(0, Math.min(1, opacity));

        volcanoExterior.traverse((child) => {
            if (child.isMesh) {
                child.material.opacity = opacity;
                // Disable depth write when transparent to avoid glitching with interior
                child.material.depthWrite = opacity > 0.5;
                child.visible = opacity > 0;
            }
        });
    }

    updateLabels();
    renderer.render(scene, camera);
}

animate();

// --- Resize Handling ---
window.addEventListener('resize', () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
});


// --- Click Raycasting (Debug / Advanced Interaction) ---
// Optional: If user clicks on the 3D model itself instead of label
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

container.addEventListener('click', (event) => {
    // Calc mouse position
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Check intersections (example)
    // const intersects = raycaster.intersectObjects(scene.children, true);
    // if (intersects.length > 0) {
    //     console.log('Clicked 3D point:', intersects[0].point);
    // }
});


// --- Effects Buttons (Simple Mocks for 3D) ---
let particleSystem; // Placeholder for future 3D particle system

// --- Eruption Logic ---
let volcanoAsh;
let isErupting = false;

// Load Ash Cloud
loader.load('assets/models/volcano_ash.glb', (gltf) => {
    volcanoAsh = gltf.scene;

    // Initial State: Hidden inside crater
    fitModelToScene(volcanoAsh); // Basic scaling
    volcanoAsh.position.y += 2.2; // Lowered significantly to sit on crater
    volcanoAsh.scale.set(0, 0, 0); // Start tiny

    volcanoAsh.traverse((child) => {
        if (child.isMesh) {
            child.material.transparent = true;
            child.material.opacity = 0;
        }
    });

    scene.add(volcanoAsh);
    console.log("Ash Cloud Loaded");

}, undefined, (error) => {
    console.error('Error loading ash cloud:', error);
});

function triggerEruption() {
    if (!volcanoAsh || isErupting) return;
    isErupting = true;

    // Animation specific consts
    const targetScale = volcanoAsh.scale.clone().setScalar(1); // Assuming fitModelToScene set it to ~1 relative
    // We need to store the "full size" scale somewhere because fitModel changes it. 
    // Let's just assume we want it to grow to a reasonable size based on the exterior.
    const finalScale = 1.5;

    let progress = 0;

    function animateEruption() {
        progress += 0.01;

        // Grow
        const currentScale = Math.min(progress * finalScale, finalScale);
        volcanoAsh.scale.set(currentScale, currentScale, currentScale);

        // Rotate slowly
        volcanoAsh.rotation.y += 0.005;

        // Update Opacity
        volcanoAsh.traverse((child) => {
            if (child.isMesh) {
                // Fade in quickly, then stay
                child.material.opacity = Math.min(progress * 2, 1);
            }
        });

        if (progress < 1.5) { // Continue animation for a while
            requestAnimationFrame(animateEruption);
        } else {
            isErupting = false; // Reset flag (optional: keep it erupting?)
        }
    }

    animateEruption();
}


btnEruption.addEventListener('click', () => {
    showCharacter("Vulkanausbruch!", "Achtung! Der Vulkan bricht aus! Asche und Rauch steigen auf.");
    triggerEruption();
});

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
        // Center/Bottom
        { id: 'magma', text: 'Magmakammer', position: new THREE.Vector3(0, -1.2, 0) },

        // Main Shaft Upwards
        { id: 'vent', text: 'Hauptschlot', position: new THREE.Vector3(0, -0.2, 0) },
        { id: 'throat', text: 'Vulkanschlund', position: new THREE.Vector3(0, 1.4, 0) },
        { id: 'vent_opening', text: 'Austrittsöffnung', position: new THREE.Vector3(0, 1.8, 0.5) }, // Centered x=0
        { id: 'crater', text: 'Krater', position: new THREE.Vector3(0, 2.3, 0) }, // Centered x=0, Higher

        // Eruption (Initially Hidden)
        { id: 'ash', text: 'Aschewolke', position: new THREE.Vector3(0, 4.0, 0), hidden: true }, // Centered, Higher, Hidden
        { id: 'lava_flow', text: 'Lavastrom', position: new THREE.Vector3(2.0, 1.0, 0.5), hidden: true }, // Hidden

        // Side features
        { id: 'side_vent', text: 'Seitenschlot', position: new THREE.Vector3(0.8, 0.0, 0) },
        { id: 'side_eruption', text: 'Seitenöffnung', position: new THREE.Vector3(1.6, 0.2, 0) },
        { id: 'parasitic_cone', text: 'Nebenkrater', position: new THREE.Vector3(2.0, 0.5, 0) },
        { id: 'sill', text: 'Lagergang', position: new THREE.Vector3(-1.8, -1.0, 0) },

        // Layers
        { id: 'layer', text: 'Lava- und Ascheschichten', position: new THREE.Vector3(-1.8, 0.5, 0) },
        { id: 'crust', text: 'Erdkruste', position: new THREE.Vector3(2.5, -1.2, 0) }
    ],
    explanations: {
        magma: { title: "Magmakammer / Magmareservoir", text: "Willkommen in der Küche des Vulkans! Ganz tief unten sammelt sich das flüssige Gestein – das Magma – und wartet darauf, dass der Druck groß genug für den Ausbruch wird." },
        vent: { title: "Förderschlot / Hauptschlot", text: "Das ist die Hauptstraße des Vulkans! Wie ein riesiger Strohhalm führt dieser Gang von ganz tief unten bis nach ganz oben." },
        crust: { title: "Gesteinsschichten der Erdkruste", text: "Das ist der feste Boden unter unseren Füßen. Er besteht aus vielen verschiedenen Lagen Stein, die schon seit Millionen von Jahren dort liegen." },
        crater: { title: "Krater", text: "Stell dir den Krater wie eine riesige Schüssel ganz oben auf dem Gipfel vor. In dieser Schüssel sammelt sich die glühende Lava, bevor sie den Berg hinunterläuft." },
        ash: { title: "Aschewolke", text: "Hust, hust! Wenn der Vulkan so richtig Schwung hat, pustet er eine riesige Wolke aus Staub und feiner Asche kilometerhoch in den Himmel. Das sieht aus wie dunkler Rauch!" },
        throat: { title: "Vulkanschlund", text: "Das ist der oberste Teil des Halses vom Vulkan. Er sitzt direkt unter dem Krater und ist wie der Rachen eines Drachen!" },
        side_vent: { title: "Seitenschlot", text: "Das ist ein kleinerer Abzweig vom Hauptweg – fast so wie eine Seitenstraße bei einer Autobahn." },
        layer: { title: "Lava- und Ascheschichten", text: "Ein Vulkan wächst wie ein Turm aus bunten Steinen. Jedes Mal, wenn er ausbricht, kommt eine neue Schicht aus abgekühlter Lava und Asche obendrauf." },
        lava_flow: { title: "Lavastrom", text: "Vorsicht, heiß! Sobald das flüssige Gestein aus dem Vulkan fließt, nennen wir es Lava. Sie kriecht wie ein glühender, langsamer Fluss den Hang hinunter." },
        side_eruption: { title: "Seitenöffnung / seitlicher Ausbruch", text: "Manchmal ist der Hauptweg nach oben verstopft. Dann sucht sich die Lava einfach einen kleinen Umweg durch die Seite des Berges." },
        parasitic_cone: { title: "Nebenkrater / Parasitärkrater", text: "Das ist wie ein kleiner Bruder des großen Vulkans. Er wächst an der Seite des Hauptberges und spuckt dort sein eigenes Feuer." },
        sill: { title: "Lagergang", text: "Hier hat sich das flüssige Gestein einfach flach zwischen zwei andere Erdschichten gequetscht und ist dort hart geworden, wie eine Füllung in einem Keks." },
        vent_opening: { title: "Austrittsöffnung / Schlotöffnung", text: "Das ist das 'Tor' nach draußen. Hier oben kommt alles ans Tageslicht, was tief unten im Bauch des Vulkans brodelt." }
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
const btnReset = document.getElementById('btn-reset'); // New
const bgPlaceholder = document.querySelector('.video-placeholder');

// ... (Rest of Three.js Setup mostly same, cutting to relevant parts for brevity in this replace block if possible, but I need to replace the config block which is at the top)

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
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// --- Models ---
let particleSystem; // Declare early for animate loop
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
    labelsContainer.innerHTML = ''; // Clear existing
    CONFIG.labels.forEach((data) => {
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = data.text;
        div.style.cursor = 'pointer';

        // Initial visibility
        if (data.hidden) {
            div.style.display = 'none';
        }

        // Interaction
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            if (CONFIG.explanations[data.id]) {
                showCharacter(CONFIG.explanations[data.id].title, CONFIG.explanations[data.id].text);
            }
        });

        // Add to DOM
        labelsContainer.appendChild(div);

        // Track
        labelElements.push({
            element: div,
            position: data.position,
            id: data.id // Store ID to find later
        });
    });
}
createLabels();

function updateLabels() {
    labelElements.forEach((labelItem) => {
        // Skip update if hidden (optimization, though style.display handled it)
        if (labelItem.element.style.display === 'none') return;

        // Project 3D position to 2D screen space
        const tempV = labelItem.position.clone();
        tempV.project(camera);

        // Convert -1...+1 to screen coordinates
        const x = (tempV.x * .5 + .5) * container.offsetWidth;
        const y = (tempV.y * -.5 + .5) * container.offsetHeight;

        labelItem.element.style.transform = `translate(-50%, -50%)`;
        labelItem.element.style.left = `${x}px`;
        labelItem.element.style.top = `${y}px`;
    });
}

// Helpers for Visibility
function setLabelVisibility(id, visible) {
    const label = labelElements.find(l => l.id === id);
    if (label) {
        label.element.style.display = visible ? 'block' : 'none';
    }
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

    // Animate Particles
    if (particleSystem) particleSystem.update();

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
    if (isErupting) return;
    isErupting = true;

    // Show Eruption Labels
    setLabelVisibility('ash', true);
    setLabelVisibility('lava_flow', true);

    // Start Particles
    if (particleSystem) particleSystem.startEruption();

    // Ash Cloud Animation
    if (volcanoAsh) {
        const finalScale = 1.5;
        let progress = 0;

        function animateEruption() {
            if (!isErupting) return; // Stop if reset

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
            }
        }
        animateEruption();
    }
}

function resetEruption() {
    isErupting = false;

    // Hide Eruption Labels
    setLabelVisibility('ash', false);
    setLabelVisibility('lava_flow', false);

    // Stop Particles
    if (particleSystem) particleSystem.stopEruption();

    // Reset Ash Cloud
    if (volcanoAsh) {
        volcanoAsh.scale.set(0, 0, 0);
        volcanoAsh.traverse((child) => {
            if (child.isMesh) {
                child.material.opacity = 0;
            }
        });
    }

    showCharacter("Reset", "Der Vulkan schläft wieder.");
}


btnEruption.addEventListener('click', () => {
    showCharacter("Vulkanausbruch!", "Achtung! Der Vulkan bricht aus! Asche und Rauch steigen auf.");
    triggerEruption();
});

btnReset.addEventListener('click', () => {
    resetEruption();
});

// Video Toggle
const videoObj = document.getElementById('bg-video');
const videoBtn = document.getElementById('btn-video-toggle');

if (videoBtn && videoObj) {
    videoBtn.addEventListener('click', () => {
        if (videoObj.paused) {
            videoObj.play();
            videoBtn.textContent = '⏸️';
        } else {
            videoObj.pause();
            videoBtn.textContent = '▶️';
        }
    });
}

// --- Particle System Class ---

// Helper: Soft Glow Texture
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Core
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fade out

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    return new THREE.CanvasTexture(canvas);
}

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.active = false;
        this.limit = 2000; // Max particles
        this.texture = createParticleTexture();

        // Lava Material (Additive for glow)
        this.lavaMaterial = new THREE.PointsMaterial({
            color: 0xffaa00,
            size: 0.3,
            map: this.texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Ash Material (Normal blend for smoke)
        this.ashMaterial = new THREE.PointsMaterial({
            color: 0x222222,
            size: 0.8,
            map: this.texture,
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });

        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
    }

    createParticle(type) {
        let p;
        if (type === 'lava') {
            const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]);
            p = new THREE.Points(geometry, this.lavaMaterial);

            // Random start pos near vent (Raised to crater height)
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 0.3; // Narrower vent at top
            p.position.set(Math.cos(angle) * r, 1.8, Math.sin(angle) * r); // Start at crater height

            // Velocity: Up + Out
            p.userData = {
                type: 'lava',
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 1.5, // Spread
                    Math.random() * 5 + 3,       // Higher ejection force
                    (Math.random() - 0.5) * 1.5
                ),
                gravity: -9.8,
                life: 1.0,
                decay: Math.random() * 0.01 + 0.005
            };
        } else if (type === 'flow') {
            // Lava Flow down the side
            const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]);
            p = new THREE.Points(geometry, this.lavaMaterial); // Reuse lava material

            // Spawn at crater rim, right side (+X)
            // 5% clockwise rotation ~ 0.3 radians. (Clockwise = negative direction)
            const angleOffset = -0.3;
            const angle = angleOffset + (Math.random() - 0.5) * 0.8;

            // Start closer to center (0.7) and higher (1.8) to cover top part
            const r = 0.7 + Math.random() * 0.1;
            p.position.set(Math.cos(angle) * r, 1.8, Math.sin(angle) * r);

            p.userData = {
                type: 'flow',
                velocity: new THREE.Vector3(
                    Math.cos(angle) * (Math.random() * 0.5 + 0.3),
                    0,
                    Math.sin(angle) * (Math.random() * 0.5 + 0.3)
                ),
                gravity: -1.5,
                life: 1.0,
                decay: Math.random() * 0.005 + 0.002
            };
        } else {
            // Ash
            const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]);
            p = new THREE.Points(geometry, this.ashMaterial);

            p.position.set(0, 2.5, 0);

            p.userData = {
                type: 'ash',
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    Math.random() * 1 + 0.5,
                    (Math.random() - 0.5) * 0.5
                ),
                scale: 1.0,
                grow: 1.01,
                life: 1.0,
                decay: 0.003
            };
        }

        this.particleGroup.add(p);
        this.particles.push(p);
    }

    startEruption() {
        this.active = true;
    }

    stopEruption() {
        this.active = false;
        // Optional: Let them fade out naturally or clear?
        // Let's clear for instant reset feel
        this.clear();
    }

    clear() {
        for (let p of this.particles) {
            this.particleGroup.remove(p);
            p.geometry.dispose();
        }
        this.particles = [];
    }

    update() {
        // Spawn new particles if active
        if (this.active && this.particles.length < this.limit) {
            // Spawn rate
            for (let i = 0; i < 5; i++) this.createParticle('lava'); // Explosive pops
            for (let i = 0; i < 8; i++) this.createParticle('flow'); // Dense stream
            for (let i = 0; i < 2; i++) this.createParticle('ash');
        }

        const dt = 0.016; // Fixed timestep approx

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            const data = p.userData;

            if (data.type === 'lava') {
                // Physics
                data.velocity.y += data.gravity * dt;
                p.position.addScaledVector(data.velocity, dt);

                // Floor collision (simple)
                if (p.position.y < -3) {
                    data.life = 0; // Kill
                }
                p.scale.setScalar(data.life); // Shrink

            } else if (data.type === 'flow') {
                // Flow Physics: Slide down cone
                // Move outward based on velocity
                p.position.x += data.velocity.x * dt;
                p.position.z += data.velocity.z * dt;

                // Calculate surface height at this radius
                const r = Math.sqrt(p.position.x * p.position.x + p.position.z * p.position.z);

                // Adjusted slope / cone logic for visibility
                // Higher start (1.8) and steeper slope (1.15) to hug mesh
                const slope = 1.15;
                let surfaceY = 1.8 - (r - 0.7) * slope;

                // Surface Roughness
                surfaceY += (Math.random() - 0.5) * 0.1;

                // Force "Above" check: Ensure we don't go below a certain cone
                // simple min height based on radius

                p.position.y = surfaceY;

                // Kill if too low
                if (p.position.y < -3.0) data.life = 0;

                p.scale.setScalar(data.life * 2.0); // Large flow particles

            } else {
                // Ash Physics
                p.position.addScaledVector(data.velocity, dt);

                // Grow
                data.scale *= data.grow;
                p.scale.setScalar(data.scale);

                // Drift
                data.velocity.x += (Math.random() - 0.5) * 0.01;
                data.velocity.z += (Math.random() - 0.5) * 0.01;
            }

            // Life
            data.life -= data.decay;

            if (data.life <= 0) {
                this.particleGroup.remove(p);
                this.particles.splice(i, 1);
                p.geometry.dispose();
                // p.material.dispose(); // Shared material, don't dispose
            }
        }
    }
}

particleSystem = new ParticleSystem(scene);

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Configuration 3D
const CONFIG = {
    FOV: 50,
    NEAR: 0.1,
    FAR: 1000,
    CAMERA_POSITION_Z: 5,
    CENTER_LIGHT_COLOR: 0x4A90E2,
    CENTER_LIGHT_INTENSITY: 8,
    CENTER_LIGHT_DISTANCE: 15,
    FILL_LIGHT_INTENSITY: 1.5,
    FILL_LIGHT_INTENSITY_2: 1,
    CAMERA_SCALE: 0.2,
    ORBIT_RADIUS: 1.35,
    ROTATION_SPEED: 0.005,
    MOUSE_SENSITIVITY: 0.003,
    MOUSE_SMOOTHNESS: 0.08,
    MIN_WIDTH_FOR_MOUSE: 768
};

class Camera3DScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container 3D non trouvé');
            return;
        }

        this.setupScene();
        this.setupLights();
        this.setupMouseTracking();
        this.loadModels();
        this.animate();
        this.setupResize();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.FOV,
            this.container.offsetWidth / this.container.offsetHeight,
            CONFIG.NEAR,
            CONFIG.FAR
        );
        this.camera.position.z = CONFIG.CAMERA_POSITION_Z;

        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        const centerLight = new THREE.PointLight(
            CONFIG.CENTER_LIGHT_COLOR,
            CONFIG.CENTER_LIGHT_INTENSITY,
            CONFIG.CENTER_LIGHT_DISTANCE
        );
        centerLight.position.set(0, 0, 0);
        this.scene.add(centerLight);

        const fillLight1 = new THREE.DirectionalLight(0xFFFFFF, CONFIG.FILL_LIGHT_INTENSITY);
        fillLight1.position.set(3, 2, 3);
        this.scene.add(fillLight1);

        const fillLight2 = new THREE.DirectionalLight(0xFFFFFF, CONFIG.FILL_LIGHT_INTENSITY_2);
        fillLight2.position.set(-3, 1, 2);
        this.scene.add(fillLight2);
    }

    setupMouseTracking() {
        this.camera1 = null;
        this.camera2 = null;
        this.angle1 = 0;
        this.angle2 = Math.PI;

        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        if (window.innerWidth > CONFIG.MIN_WIDTH_FOR_MOUSE) {
            document.addEventListener('mousemove', (event) => {
                this.targetMouseX = event.clientX - window.innerWidth / 2;
                this.targetMouseY = event.clientY - window.innerHeight / 2;
            });
        }
    }

    loadModels() {
        const loader = new GLTFLoader();
        loader.load(
            'assets/camera.glb',
            (gltf) => {
                this.camera1 = gltf.scene.clone();
                this.camera1.scale.set(CONFIG.CAMERA_SCALE, CONFIG.CAMERA_SCALE, CONFIG.CAMERA_SCALE);
                this.scene.add(this.camera1);

                this.camera2 = gltf.scene.clone();
                this.camera2.scale.set(CONFIG.CAMERA_SCALE, CONFIG.CAMERA_SCALE, CONFIG.CAMERA_SCALE);
                this.scene.add(this.camera2);
            },
            undefined,
            (error) => console.error('Erreur de chargement du modèle:', error)
        );
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        if (this.camera1 && this.camera2) {
            // Smooth mouse interpolation
            this.mouseX += (this.targetMouseX - this.mouseX) * CONFIG.MOUSE_SMOOTHNESS;
            this.mouseY += (this.targetMouseY - this.mouseY) * CONFIG.MOUSE_SMOOTHNESS;

            // Update rotation angles
            this.angle1 += CONFIG.ROTATION_SPEED;
            this.angle2 += CONFIG.ROTATION_SPEED;

            // Update camera 1 position
            this.camera1.position.x = Math.cos(this.angle1) * CONFIG.ORBIT_RADIUS;
            this.camera1.position.y = Math.sin(this.angle1) * CONFIG.ORBIT_RADIUS;
            this.camera1.position.z = 0;

            // Update camera 2 position
            this.camera2.position.x = Math.cos(this.angle2) * CONFIG.ORBIT_RADIUS;
            this.camera2.position.y = Math.sin(this.angle2) * CONFIG.ORBIT_RADIUS;
            this.camera2.position.z = 0;

            // Calculate target with mouse influence
            const targetX = this.camera.position.x + this.mouseX * CONFIG.MOUSE_SENSITIVITY;
            const targetY = this.camera.position.y - this.mouseY * CONFIG.MOUSE_SENSITIVITY;
            const targetZ = this.camera.position.z;

            // Make cameras look at target
            this.camera1.lookAt(targetX, targetY, targetZ);
            this.camera2.lookAt(targetX, targetY, targetZ);
        }

        this.renderer.render(this.scene, this.camera);
    }

    setupResize() {
        window.addEventListener('resize', () => {
            if (this.container.offsetWidth > 0) {
                this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
            }
        });
    }
}

// Initialiser la scène 3D
new Camera3DScene('camera-3d-container');

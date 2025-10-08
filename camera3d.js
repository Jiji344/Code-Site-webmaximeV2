import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Configuration
const container = document.getElementById('camera-3d-container');
if (!container) {
    console.error('Container 3D non trouvé');
} else {
    // Scène, caméra, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        50,
        container.offsetWidth / container.offsetHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lumière bleue puissante au centre
    const centerLight = new THREE.PointLight(0x4A90E2, 8, 15);
    centerLight.position.set(0, 0, 0);
    scene.add(centerLight);

    // Lumières additionnelles pour mieux voir les caméras
    const fillLight1 = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    fillLight1.position.set(3, 2, 3);
    scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xFFFFFF, 1);
    fillLight2.position.set(-3, 1, 2);
    scene.add(fillLight2);

    // Variables pour les caméras 3D
    let camera1, camera2;
    const radius = 1.35; // Rayon de l'orbite autour de la sphère
    let angle1 = 0;
    let angle2 = Math.PI; // Démarrer à l'opposé

    // Variables pour le suivi smooth du curseur
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    const mouseSensitivity = 0.003;
    const smoothness = 0.08;

    // Suivre la position du curseur (seulement sur desktop)
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (event) => {
            targetMouseX = (event.clientX - window.innerWidth / 2);
            targetMouseY = (event.clientY - window.innerHeight / 2);
        });
    }
 
    // Charger le modèle GLB
    const loader = new GLTFLoader();
    loader.load(
        'assets/camera.glb',
        (gltf) => {
            // Première caméra
            camera1 = gltf.scene.clone();
            camera1.scale.set(0.2, 0.2, 0.2);
            scene.add(camera1);

            // Deuxième caméra
            camera2 = gltf.scene.clone();
            camera2.scale.set(0.2, 0.2, 0.2);
            scene.add(camera2);

            console.log('Modèle de caméra chargé avec succès');
        },
        (progress) => {
            console.log('Chargement:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
            console.error('Erreur de chargement du modèle:', error);
        }
    );

    // Animation
    function animate() {
        requestAnimationFrame(animate);

        if (camera1 && camera2) {
            // Interpolation smooth du curseur (lerp)
            mouseX += (targetMouseX - mouseX) * smoothness;
            mouseY += (targetMouseY - mouseY) * smoothness;

            // Vitesse de rotation
            angle1 += 0.005;
            angle2 += 0.005;

            // Position de la première caméra (orbite X-Y, pas de Z)
            camera1.position.x = Math.cos(angle1) * radius;
            camera1.position.y = Math.sin(angle1) * radius;
            camera1.position.z = 0;

            // Position de la deuxième caméra (orbite X-Y, à l'opposé)
            camera2.position.x = Math.cos(angle2) * radius;
            camera2.position.y = Math.sin(angle2) * radius;
            camera2.position.z = 0;

            // Point cible influencé par le curseur
            const targetX = camera.position.x + mouseX * mouseSensitivity;
            const targetY = camera.position.y - mouseY * mouseSensitivity;
            const targetZ = camera.position.z;

            // Faire face au point cible (avec influence du curseur)
            camera1.lookAt(targetX, targetY, targetZ);
            camera2.lookAt(targetX, targetY, targetZ);
        }

        renderer.render(scene, camera);
    }

    animate();

    // Responsive
    window.addEventListener('resize', () => {
        if (container.offsetWidth > 0) {
            camera.aspect = container.offsetWidth / container.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.offsetWidth, container.offsetHeight);
        }
    });
}


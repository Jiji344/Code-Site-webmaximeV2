import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Camera3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        // Initialisation
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Éclairage amélioré pour meilleure visibilité
        const light1 = new THREE.PointLight(0xFFFFFF, 10, 20);
        light1.position.set(2, 2, 2);
        this.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xFFFFFF, 2);
        light2.position.set(5, 3, 5);
        this.scene.add(light2);

        const light3 = new THREE.DirectionalLight(0xFFFFFF, 1.5);
        light3.position.set(-5, 2, 3);
        this.scene.add(light3);

        // Lumière ambiante pour éclairer uniformément
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
        this.scene.add(ambientLight);

        // Modèle 3D
        this.cameraModel = null;
        const loader = new GLTFLoader();
        loader.load('assets/camera.glb', (gltf) => {
            this.cameraModel = gltf.scene;
            this.cameraModel.scale.set(0.35, 0.35, 0.35);
            this.cameraModel.position.set(0, 0, 0);
            this.scene.add(this.cameraModel);
        });

        // Suivi du curseur/touch sur toute la section hero
        // Valeurs initiales pour maintenir la rotation de côté par défaut
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        // Rotation initiale constante
        this.initialRotationY = Math.PI / 6; // 30 degrés sur le côté
        this.initialRotationX = -Math.PI / 12; // Légèrement inclinée vers le bas

        // Fonction pour mettre à jour la position cible
        const updateTargetPosition = (clientX, clientY, element) => {
            const rect = element.getBoundingClientRect();
            this.targetX = ((clientX - rect.left) / rect.width - 0.5) * 2;
            this.targetY = ((clientY - rect.top) / rect.height - 0.5) * 2;
        };

        // Suivre le curseur sur toute la section hero (desktop uniquement)
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            // Événements souris (desktop seulement)
            heroSection.addEventListener('mousemove', (e) => {
                updateTargetPosition(e.clientX, e.clientY, heroSection);
            });

            heroSection.addEventListener('mouseleave', () => {
                this.targetX = 0;
                this.targetY = 0;
            });
        }

        // Aussi sur le conteneur lui-même (desktop seulement)
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.targetX = (e.clientX - rect.left - rect.width / 2) / rect.width;
            this.targetY = (e.clientY - rect.top - rect.height / 2) / rect.height;
        });

        // Animation
        this.animate();
        
        // Redimensionnement
        window.addEventListener('resize', () => {
            const width = this.container.offsetWidth;
            const height = this.container.offsetHeight;
            if (width > 0 && height > 0) {
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(width, height);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.cameraModel) {
            // Interpolation fluide (plus lente pour un mouvement plus doux)
            this.mouseX += (this.targetX - this.mouseX) * 0.06;
            this.mouseY += (this.targetY - this.mouseY) * 0.06;

            // Calculer si le curseur est actif (pas au centre)
            const isActive = Math.abs(this.targetX) > 0.01 || Math.abs(this.targetY) > 0.01;
            const isMouseActive = Math.abs(this.mouseX) > 0.01 || Math.abs(this.mouseY) > 0.01;
            
            // Si le curseur est actif : rotation de face (base à 0)
            // Si le curseur est au repos : rotation initiale sur le côté
            const baseRotationY = (isActive || isMouseActive) ? 0 : this.initialRotationY;
            const baseRotationX = (isActive || isMouseActive) ? 0 : this.initialRotationX;
            
            // Interpolation de la rotation de base pour transition fluide
            if (!this.baseRotY) this.baseRotY = this.initialRotationY;
            if (!this.baseRotX) this.baseRotX = this.initialRotationX;
            
            this.baseRotY += (baseRotationY - this.baseRotY) * 0.08;
            this.baseRotX += (baseRotationX - this.baseRotX) * 0.08;

            // Rotation suivant le curseur + rotation de base
            this.cameraModel.rotation.y = this.baseRotY + this.mouseX * (Math.PI / 3);
            this.cameraModel.rotation.x = this.baseRotX + this.mouseY * (Math.PI / 3);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new Camera3D('camera-3d-container'));
} else {
    new Camera3D('camera-3d-container');
}


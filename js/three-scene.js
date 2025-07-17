import * as THREE from 'three';

export function initThreeScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('three-canvas'),
        alpha: true,
        antialias: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    // Create orbital particle system using sin/cos
    createOrbitalParticleSystem(scene);
    createFloatingCodeElements(scene);
    
    // Enhanced lighting for AI theme
    setupAILighting(scene);

    // Position camera
    camera.position.z = 50;

    // Animation variables
    let time = 0;
    const clock = new THREE.Clock();

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        time += clock.getDelta();
        
        // Animate orbital particles
        animateOrbitalParticles(scene, time);
        animateFloatingCode(scene, time);
        
        renderer.render(scene, camera);
    }
    
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Subtle scroll parallax
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.1;
        
        if (camera) {
            camera.position.y = rate * 0.005;
        }
    });
}

function createOrbitalParticleSystem(scene) {
    const orbits = [];
    const orbitCount = 4; // Reduced for cleaner look
    
    for (let orbit = 0; orbit < orbitCount; orbit++) {
        const particlesInOrbit = 6 + orbit * 2;
        const radius = 40 + orbit * 25;
        
        for (let i = 0; i < particlesInOrbit; i++) {
            const angle = (i / particlesInOrbit) * Math.PI * 2;
            
            // Create particle geometry
            const geometry = new THREE.SphereGeometry(0.8, 8, 8);
            const material = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color().setHSL(0.65 + orbit * 0.05, 0.8, 0.6),
                transparent: true,
                opacity: 0.7
            });
            const particle = new THREE.Mesh(geometry, material);
            
            // Initial position using sin/cos for perfect circles
            particle.position.x = Math.cos(angle) * radius;
            particle.position.y = Math.sin(angle) * radius;
            particle.position.z = (Math.random() - 0.5) * 15;
            
            // Store orbit data
            particle.userData = {
                orbitRadius: radius,
                orbitSpeed: 0.008 + orbit * 0.003, // Slower, smoother movement
                initialAngle: angle,
                orbitIndex: orbit,
                verticalOffset: Math.random() * Math.PI * 2
            };
            
            scene.add(particle);
            orbits.push(particle);
        }
    }
    
    scene.userData.orbitalParticles = orbits;
}

function createFloatingCodeElements(scene) {
    const codeElements = [];
    const codeSnippets = [
        'import tensorflow as tf',
        'from sklearn import *',
        'import pandas as pd',
        'import numpy as np',
        'model.fit(X_train, y_train)',
        'predictions = model.predict(X_test)',
        'accuracy = accuracy_score(y_test, predictions)',
        'from transformers import pipeline'
    ];
    
    codeSnippets.forEach((code, index) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 40;
        
        context.fillStyle = 'rgba(26, 26, 26, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = '#6366f1';
        context.font = '14px monospace';
        context.fillText(code, 10, 25);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            opacity: 0.4
        });
        const geometry = new THREE.PlaneGeometry(30, 4);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.x = (Math.random() - 0.5) * 150;
        mesh.position.y = (Math.random() - 0.5) * 150;
        mesh.position.z = (Math.random() - 0.5) * 50;
        
        mesh.userData = {
            floatSpeed: 0.5 + Math.random() * 0.5,
            rotateSpeed: (Math.random() - 0.5) * 0.01
        };
        
        scene.add(mesh);
        codeElements.push(mesh);
    });
    
    scene.userData.codeElements = codeElements;
}

function animateOrbitalParticles(scene, time) {
    const particles = scene.userData.orbitalParticles;
    if (!particles) return;
    
    particles.forEach(particle => {
        const data = particle.userData;
        const currentAngle = data.initialAngle + time * data.orbitSpeed;
        
        // Perfect circular motion using sin/cos
        particle.position.x = Math.cos(currentAngle) * data.orbitRadius;
        particle.position.y = Math.sin(currentAngle) * data.orbitRadius;
        
        // Subtle vertical oscillation
        particle.position.z = Math.sin(time * 0.3 + data.verticalOffset) * 8;
        
        // Gentle opacity pulsing
        particle.material.opacity = 0.5 + 0.2 * Math.sin(time * 1.5 + data.initialAngle);
        
        // Slight scale variation
        const scale = 1 + 0.1 * Math.sin(time * 2 + data.initialAngle);
        particle.scale.setScalar(scale);
    });
}

function animateFloatingCode(scene, time) {
    const codeElements = scene.userData.codeElements;
    if (!codeElements) return;
    
    codeElements.forEach((element, index) => {
        element.position.y += Math.sin(time * 0.5 + index) * element.userData.floatSpeed * 0.01;
        element.rotation.z += element.userData.rotateSpeed;
        
        // Gentle opacity variation
        element.material.opacity = 0.3 + 0.1 * Math.sin(time + index);
    });
}

function setupAILighting(scene) {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // AI-themed directional lights
    const light1 = new THREE.DirectionalLight(0x6366f1, 0.8);
    light1.position.set(20, 20, 10);
    scene.add(light1);
    
    const light2 = new THREE.DirectionalLight(0x8b5cf6, 0.6);
    light2.position.set(-20, -20, -10);
    scene.add(light2);
    
    // Point lights for dynamic effect
    const pointLight1 = new THREE.PointLight(0x06b6d4, 1, 100);
    pointLight1.position.set(0, 0, 30);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x10b981, 1, 100);
    pointLight2.position.set(0, 0, -30);
    scene.add(pointLight2);
}

// Export additional functions for external use
export { createOrbitalParticleSystem, animateOrbitalParticles };

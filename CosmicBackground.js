import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Particles from 'particles.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const CosmicBackground = () => {
  const canvasRef = useRef(null);
  const particleContainer = useRef(null);

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Create galaxy effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 5000;
    
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x4a8fe7,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    camera.position.z = 2;
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Initialize Particles.js on top
    if (window.innerWidth > 768) {
      Particles.init({
        selector: '.particles',
        color: ['#4a8fe7', '#3a86ff', '#5fb0ff'],
        connectParticles: true,
        responsive: [
          {
            breakpoint: 1024,
            options: {
              maxParticles: 100,
              connectParticles: false
            }
          }
        ]
      });
    }
    
    // GSAP animations
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".hero-content", {
      opacity: 0,
      y: 50,
      duration: 1.5,
      ease: "power3.out"
    });
    
    // Parallax effect
    const parallaxElems = document.querySelectorAll('[data-parallax]');
    parallaxElems.forEach(el => {
      gsap.to(el, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
    
    return () => {
      renderer.dispose();
      if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom[0].pJS.fn.vendors.destroy();
      }
    };
  }, []);
  
  return (
    <div className="cosmic-background">
      <canvas ref={canvasRef} className="threejs-canvas" />
      <div ref={particleContainer} className="particles" />
    </div>
  );
};

export default CosmicBackground;
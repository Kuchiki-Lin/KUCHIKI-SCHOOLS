"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function ThreeBackground(): JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const getSize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      return { w, h };
    };

    const { w: initialW, h: initialH } = getSize();

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, initialW / initialH, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(initialW, initialH);
    mount.appendChild(renderer.domElement);

    // ---------------------------
    // ⭐ NEW: Faster + Color change
    // ---------------------------

    const particleCount = 4000; // slightly more particles
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xf7ff00,   // ⭐ Neon yellow particles (change this)
      size: 0.05,        // slightly larger particles
      transparent: true,
      opacity: 0.95,
    });

    const points = new THREE.Points(geometry, material);
    points.position.z = -2;
    scene.add(points);

    // ---------------------------
    // ⭐ Increased flow speed
    // ---------------------------
    const animate = () => {
      points.rotation.y += 0.003; // was 0.0008
      points.rotation.x += 0.002; // was 0.0005

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });

    resizeObserver.observe(mount);

    const onWindowResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", onWindowResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      window.removeEventListener("resize", onWindowResize);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100vh",
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
      className="z-0"
    />
  );
}

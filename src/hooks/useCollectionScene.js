import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CONFIG = {
  modelUrl: '/whitelambo.glb',
  carScale: 4.5,
  carRotationY: -0.2,
  cameraStart: { x: 0, y: 2.0, z: 50 },
  cameraEnd: { x: 0, y: 1, z: 5 },
  cameraLookAtY: 0.15,
  floatHeight: 0.035,
  floatSpeed: 2,
  dragSensitivity: 0.012,
  maxTiltAngle: Math.PI / 4,
};

/** Returns the appropriate carScale for the current viewport width */
function getMobileCarScale() {
  const w = window.innerWidth;
  if (w <= 360) return 2.2;
  if (w <= 480) return 2.6;
  if (w <= 640) return 3.0;
  if (w <= 900) return 3.6;
  return CONFIG.carScale; // desktop — unchanged
}

async function loadModel(url) {
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');

  return new Promise((resolve, reject) => {
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load(url, (gltf) => { draco.dispose(); resolve(gltf); }, undefined, reject);
  });
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function useCollectionScene({ onLoaded, onError } = {}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animFrameId;
    let destroyed = false;

    async function init() {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
      const lookAt = new THREE.Vector3(0, CONFIG.cameraLookAtY, 0);
      const camStart = new THREE.Vector3(...Object.values(CONFIG.cameraStart));
      const camEnd = new THREE.Vector3(...Object.values(CONFIG.cameraEnd));
      camera.position.copy(camStart);
      camera.lookAt(lookAt);

      scene.add(new THREE.AmbientLight(0xffffff, 0.7));

      const keyLight = new THREE.DirectionalLight(0xfff5d6, 3.8);
      keyLight.position.set(5, 7, 4);
      keyLight.castShadow = true;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xb8d4ff, 1.4);
      fillLight.position.set(-6, 2, 3);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffeebb, 1.2);
      rimLight.position.set(0, 3, -6);
      scene.add(rimLight);

      let gltf;
      try {
        gltf = await loadModel(CONFIG.modelUrl);
      } catch (err) {
        onError?.(err);
        renderer.dispose();
        return;
      }

      if (destroyed) { renderer.dispose(); return; }

      const car = gltf.scene;
      const box = new THREE.Box3().setFromObject(car);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      // Apply initial scale based on viewport
      let currentCarScale = getMobileCarScale();
      let scale = currentCarScale / maxDim;
      car.scale.setScalar(scale);
      car.position.sub(center.multiplyScalar(scale));
      car.position.y -= 0.18;
      car.rotation.y = CONFIG.carRotationY;

      car.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) node.material.envMapIntensity = 1.3;
        }
      });

      scene.add(car);
      onLoaded?.();

      let scrollProgress = 0;

      function updateScrollProgress() {
        const section = canvas.closest('section') || canvas.parentElement;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const entered = window.innerHeight - rect.top;
        const range = window.innerHeight * 1;
        scrollProgress = clamp(entered / range, 0, 1);
      }

      updateScrollProgress();
      window.addEventListener('scroll', updateScrollProgress, { passive: true });

      const carMeshes = [];
      car.traverse((n) => { if (n.isMesh) carMeshes.push(n); });

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      function isOverCar(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        return raycaster.intersectObjects(carMeshes).length > 0;
      }

      let isDragging = false;
      let prevX = 0, prevY = 0;
      let dragY = 0, dragX = 0;
      let smoothDragY = 0, smoothDragX = 0;

      const onPointerDown = (e) => {
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        if (!isOverCar(x, y)) return;
        e.preventDefault();
        isDragging = true;
        prevX = x;
        prevY = y;
        canvas.style.cursor = 'grabbing';
      };

      const onPointerMove = (e) => {
        if (!isDragging) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        dragY += (x - prevX) * CONFIG.dragSensitivity;
        dragX += (y - prevY) * CONFIG.dragSensitivity;
        dragX = clamp(dragX, -CONFIG.maxTiltAngle, CONFIG.maxTiltAngle);
        prevX = x;
        prevY = y;
      };

      const onPointerUp = () => {
        isDragging = false;
        canvas.style.cursor = '';
      };

      const onMouseHover = (e) => {
        if (!isDragging) canvas.style.cursor = isOverCar(e.clientX, e.clientY) ? 'grab' : '';
      };

      canvas.style.pointerEvents = 'auto';
      canvas.addEventListener('mousedown', onPointerDown);
      canvas.addEventListener('touchstart', onPointerDown, { passive: false });
      canvas.addEventListener('mousemove', onMouseHover);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchend', onPointerUp);

      function resize() {
        const w = canvas.clientWidth || 400;
        const h = canvas.clientHeight || 500;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        // Re-scale car for the new viewport width
        const newCarScale = getMobileCarScale();
        if (newCarScale !== currentCarScale) {
          currentCarScale = newCarScale;
          const newScale = currentCarScale / maxDim;
          car.scale.setScalar(newScale);
          // Re-center: reset position to origin-centered, then re-apply offset
          car.position.copy(center.clone().multiplyScalar(-newScale));
          car.position.y -= 0.18;
        }
      }
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);

      let isVisible = false;
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { threshold: 0 });
      visibilityObserver.observe(canvas);

      function animate(now) {
        animFrameId = requestAnimationFrame(animate);
        if (!isVisible) return;

        const time = now / 1000;
        const eased = easeInOut(scrollProgress);
        camera.position.lerpVectors(camStart, camEnd, eased);

        if (scrollProgress > 0.5) {
          const fadeIn = clamp((scrollProgress - 0.5) / 0.2, 0, 1);
          camera.position.y += Math.sin(time * CONFIG.floatSpeed) * CONFIG.floatHeight * fadeIn;
        }

        smoothDragY += (dragY - smoothDragY) * 0.08;
        smoothDragX += (dragX - smoothDragX) * 0.08;
        car.rotation.y = CONFIG.carRotationY + smoothDragY;
        car.rotation.x = smoothDragX;

        camera.lookAt(lookAt);
        renderer.render(scene, camera);
      }
      animFrameId = requestAnimationFrame(animate);

      canvas._cleanup = () => {
        cancelAnimationFrame(animFrameId);
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        window.removeEventListener('scroll', updateScrollProgress);
        canvas.removeEventListener('mousedown', onPointerDown);
        canvas.removeEventListener('touchstart', onPointerDown);
        canvas.removeEventListener('mousemove', onMouseHover);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchend', onPointerUp);
        canvas.style.pointerEvents = '';
        renderer.dispose();
      };
    }

    init();

    return () => {
      destroyed = true;
      cancelAnimationFrame(animFrameId);
      if (canvas._cleanup) { canvas._cleanup(); canvas._cleanup = null; }
    };
  }, []);

  return canvasRef;
}

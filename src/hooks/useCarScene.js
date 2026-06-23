import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ANIM = {
  carScale: 3,
  entryFromX: -4,
  entryDuration: 2,
  scrollToX: 7,
  floatAmplitude: 0.04,
  floatSpeed: 0.8,
};

/** Camera Z distance — higher = car looks smaller, lower = car looks bigger.
 *  Change MOBILE_CAMERA_Z to resize the car on mobile. */
const MOBILE_CAMERA_Z = 4.5; // mobile
const DESKTOP_CAMERA_Z = 4.8; // desktop (≥900px) — leave this alone

function getCameraZ() {
  return window.innerWidth <= 900 ? MOBILE_CAMERA_Z : DESKTOP_CAMERA_Z;
}

async function loadGLTF(url, onProgress) {
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');

  return new Promise((resolve, reject) => {
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load(
      url,
      (gltf) => { draco.dispose(); resolve(gltf); },
      (xhr) => { if (xhr.lengthComputable) onProgress?.(Math.round((xhr.loaded / xhr.total) * 100)); },
      reject
    );
  });
}

export function useCarScene({ onProgress, onLoaded, onError } = {}) {
  const canvasRef = useRef(null);
  const dragAreaRef = useRef(null);
  const cbRef = useRef({ onProgress, onLoaded, onError });
  cbRef.current = { onProgress, onLoaded, onError };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId;
    let destroyed = false;

    async function init() {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0.6, getCameraZ());

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));

      const keyLight = new THREE.DirectionalLight(0xfff5d6, 3.5);
      keyLight.position.set(4, 6, 4);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xb8d4ff, 1.2);
      fillLight.position.set(-5, 2, 2);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xffeebb, 1.0);
      rimLight.position.set(0, 3, -5);
      scene.add(rimLight);

      const groundLight = new THREE.DirectionalLight(0x888888, 0.4);
      groundLight.position.set(0, -3, 0);
      scene.add(groundLight);

      let gltf;
      try {
        gltf = await loadGLTF('/lamborghini_-_ferzor.glb', (p) => cbRef.current.onProgress?.(p));
      } catch (err) {
        cbRef.current.onError?.(err);
        renderer.dispose();
        return;
      }

      if (destroyed) { renderer.dispose(); return; }

      const car = gltf.scene;
      const box = new THREE.Box3().setFromObject(car);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = ANIM.carScale / Math.max(size.x, size.y, size.z);
      car.scale.setScalar(scale);
      car.position.sub(center.multiplyScalar(scale));
      car.position.y -= 0.18;

      const carMeshes = [];
      car.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = node.receiveShadow = true;
          if (node.material) node.material.envMapIntensity = 1.2;
          carMeshes.push(node);
        }
      });

      scene.add(car);
      cbRef.current.onLoaded?.();
      canvas.style.pointerEvents = 'auto';

      let isVisible = true;
      const visObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { threshold: 0 });
      visObserver.observe(canvas);

      let pendingResize = false;
      const resizeObserver = new ResizeObserver(() => { pendingResize = true; });
      resizeObserver.observe(canvas);

      function resize() {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        if (renderer.domElement.width !== w || renderer.domElement.height !== h) {
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.position.z = getCameraZ();
          camera.updateProjectionMatrix();
        }
      }
      resize();

      let scrollProgress = 0;
      const onScroll = () => {
        const hero = document.getElementById('hero');
        if (hero) scrollProgress = Math.min(window.scrollY / hero.offsetHeight, 1);
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      const raycaster = new THREE.Raycaster();
      const ndcPointer = new THREE.Vector2();

      function isHittingCar(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        ndcPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        ndcPointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndcPointer, camera);
        return raycaster.intersectObjects(carMeshes).length > 0;
      }

      let isDragging = false;
      let prevX = 0;
      let targetRotY = 0;
      let currentRotY = 0;

      const onDown = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        if (!isHittingCar(clientX, clientY)) return;
        e.preventDefault();
        isDragging = true;
        prevX = clientX;
        canvas.style.cursor = 'grabbing';
      };

      const onMove = (e) => {
        if (!isDragging) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        targetRotY += (x - prevX) * 0.012;
        prevX = x;
      };

      const onUp = () => {
        if (!isDragging) return;
        isDragging = false;
        canvas.style.cursor = '';
      };

      const onHover = (e) => {
        if (isDragging) return;
        canvas.style.cursor = isHittingCar(e.clientX, e.clientY) ? 'grab' : '';
      };

      canvas.addEventListener('mousedown', onDown);
      canvas.addEventListener('touchstart', onDown, { passive: false });
      canvas.addEventListener('mousemove', onHover);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);

      let entryStart = null;

      function animate(now) {
        rafId = requestAnimationFrame(animate);
        if (!isVisible) return;

        if (pendingResize) { resize(); pendingResize = false; }

        const t = now / 1000;

        if (entryStart === null) entryStart = now;
        const p = Math.min((now - entryStart) / 1000 / ANIM.entryDuration, 1);
        const easedEntryX = ANIM.entryFromX * (1 - (3 * p * p - 2 * p * p * p));
        const scrollX = ANIM.scrollToX * scrollProgress;

        car.position.x = easedEntryX + scrollX;
        car.position.y = -0.18 + Math.sin(t * ANIM.floatSpeed) * ANIM.floatAmplitude;

        currentRotY += (targetRotY - currentRotY) * 0.08;
        car.rotation.y = currentRotY;

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(animate);

      canvas._carCleanup = () => {
        cancelAnimationFrame(rafId);
        visObserver.disconnect();
        resizeObserver.disconnect();
        canvas.style.pointerEvents = '';
        window.removeEventListener('scroll', onScroll);
        canvas.removeEventListener('mousedown', onDown);
        canvas.removeEventListener('touchstart', onDown);
        canvas.removeEventListener('mousemove', onHover);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchend', onUp);
        renderer.dispose();
      };
    }

    init();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      if (canvas._carCleanup) { canvas._carCleanup(); canvas._carCleanup = null; }
    };
  }, []);

  return { canvasRef, dragAreaRef };
}

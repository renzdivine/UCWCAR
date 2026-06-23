import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const KEYFRAMES = [
  { id: 'experience', posX: -2, posY:  0.0, rotY: Math.PI * 1.62, rotX:  0.04, scale: 0.92 },
  { id: 'contact',    posX:  0, posY: -8,   rotY: Math.PI * 1.62, rotX:  0.04, scale: 0.0  },
];

const CONFIG = {
  modelUrl: '/orangelambo.glb',
  cameraFov: 50,
  floatAmp: 0.035,
  floatSpeed: 2,
  entryCameraStart: { x: 0, y: 2.0, z: 50 },
  entryCameraEnd:   { x: 0, y: 1,   z: 5  },
  entryRange: 1.0,
  entryLookAtY: 0.15,
};

async function loadGLTF(url) {
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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function getEntryProgress() {
  const section = document.getElementById(KEYFRAMES[0].id);
  if (!section) return 1;
  const rect = section.getBoundingClientRect();
  const entered = window.innerHeight - rect.top;
  const range = window.innerHeight * CONFIG.entryRange;
  return clamp(entered / range, 0, 1);
}

function getStickyProgress() {
  const first = document.getElementById(KEYFRAMES[0].id);
  const last = document.getElementById(KEYFRAMES[KEYFRAMES.length - 1].id);
  if (!first || !last) return 0;

  const firstTop = first.getBoundingClientRect().top + window.scrollY;
  const lastBottom = last.getBoundingClientRect().bottom + window.scrollY;
  const totalRange = lastBottom - firstTop - window.innerHeight;
  const scrolled = window.scrollY - firstTop;
  return Math.max(0, Math.min(1, scrolled / totalRange));
}

function resolveKeyframe(progress) {
  const total = KEYFRAMES.length - 1;
  const scaled = progress * total;
  const from = Math.min(Math.floor(scaled), total - 1);
  const to = from + 1;
  const localT = easeInOut(scaled - from);
  return [from, to, localT];
}

export function useStickyCarScene({ onLoaded, onError } = {}) {
  const canvasRef = useRef(null);

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
      renderer.toneMappingExposure = 1.5;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(CONFIG.cameraFov, 1, 0.1, 200);
      const camStart = new THREE.Vector3(...Object.values(CONFIG.entryCameraStart));
      const camEnd = new THREE.Vector3(...Object.values(CONFIG.entryCameraEnd));
      const lookAt = new THREE.Vector3(0, CONFIG.entryLookAtY, 0);
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
        gltf = await loadGLTF(CONFIG.modelUrl);
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
      const normalise = 4.5 / Math.max(size.x, size.y, size.z);
      car.scale.setScalar(normalise);
      car.position.sub(center.multiplyScalar(normalise));
      car.position.y -= 0.18;

      car.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) node.material.envMapIntensity = 1.3;
        }
      });

      scene.add(car);
      onLoaded?.();

      let isVisible = false;

      function checkVisibility() {
        const first = document.getElementById(KEYFRAMES[0].id);
        const last = document.getElementById(KEYFRAMES[KEYFRAMES.length - 1].id);
        if (!first || !last) { isVisible = false; canvas.style.opacity = '0'; return; }

        const firstTop = first.getBoundingClientRect().top;
        const lastBottom = last.getBoundingClientRect().bottom;
        const shouldShow = firstTop < window.innerHeight * 0.6 && lastBottom > 0;

        if (shouldShow !== isVisible) {
          isVisible = shouldShow;
          canvas.style.opacity = isVisible ? '1' : '0';
          if (!isVisible) renderer.clear();
        }
      }

      window.addEventListener('scroll', checkVisibility, { passive: true });
      checkVisibility();

      function resize() {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      const resizeObs = new ResizeObserver(resize);
      resizeObs.observe(canvas);

      let scrollProg = getStickyProgress();
      let entryProg = getEntryProgress();

      function onScroll() {
        scrollProg = getStickyProgress();
        entryProg = getEntryProgress();
      }
      window.addEventListener('scroll', onScroll, { passive: true });

      let curPosX = KEYFRAMES[0].posX;
      let curPosY = KEYFRAMES[0].posY;
      let curRotY = KEYFRAMES[0].rotY;
      let curRotX = KEYFRAMES[0].rotX;
      let curScale = KEYFRAMES[0].scale;

      function animate(now) {
        rafId = requestAnimationFrame(animate);
        if (!isVisible) return;

        const time = now / 1000;
        const easedEntry = easeInOut(entryProg);
        camera.position.lerpVectors(camStart, camEnd, easedEntry);

        if (entryProg > 0.5) {
          const fadeIn = clamp((entryProg - 0.5) / 0.2, 0, 1);
          camera.position.y += Math.sin(time * CONFIG.floatSpeed) * CONFIG.floatAmp * fadeIn;
        }

        camera.lookAt(lookAt);

        const [fi, ti, localT] = resolveKeyframe(scrollProg);
        const from = KEYFRAMES[fi];
        const to = KEYFRAMES[ti];

        const tgtPosX = lerp(from.posX, to.posX, localT);
        const tgtPosY = lerp(from.posY, to.posY, localT);
        const tgtRotY = lerp(from.rotY, to.rotY, localT);
        const tgtRotX = lerp(from.rotX, to.rotX, localT);
        const tgtScale = lerp(from.scale, to.scale, localT);

        const k = 0.08;
        curPosX += (tgtPosX - curPosX) * k;
        curPosY += (tgtPosY - curPosY) * k;
        curRotY += (tgtRotY - curRotY) * k;
        curRotX += (tgtRotX - curRotX) * k;
        curScale += (tgtScale - curScale) * k;

        car.position.x = curPosX;
        car.position.y = -0.18 + curPosY;
        car.rotation.y = curRotY;
        car.rotation.x = curRotX;
        car.scale.setScalar(normalise * curScale);

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(animate);

      canvas._cleanup = () => {
        cancelAnimationFrame(rafId);
        resizeObs.disconnect();
        window.removeEventListener('scroll', checkVisibility);
        window.removeEventListener('scroll', onScroll);
        renderer.dispose();
      };
    }

    init();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      if (canvas._cleanup) { canvas._cleanup(); canvas._cleanup = null; }
    };
  }, []);

  return canvasRef;
}

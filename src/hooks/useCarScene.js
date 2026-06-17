import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CAR_SCALE = 12;
const LERP = 0.05;
const CAMERA_FOV = 42;
const CAMERA_Z = 17;

const SECTIONS = [
  { id: 'hero',       posX: 0, posY: -1.5 , rotY: 0, rotX: 0, scale: 1.0 },
  { id: 'collection', posX: 6, posY: -0.2, rotY: Math.PI * 1.18, rotX: 0.04, scale: 0.92 },
  { id: 'models',     posX: -6, posY: 0.0, rotY: Math.PI * 2.08, rotX: -0.05, scale: 0.92 },
  { id: 'gallery',    posX: 6, posY: -0.2, rotY: Math.PI * 0.5, rotX: 0, scale: 0.92 },
  { id: 'experience', posX: -6, posY: 0.0, rotY: Math.PI * 1.62, rotX: 0.04, scale: 0.92 },
  { id: 'contact', posX: 0, posY: -8, rotY: Math.PI * 1.62, rotX: 0.04, scale: 0.0 },
];

function lerp(a, b, t) { return a + (b - a) * t; }
function eio(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function getCarTarget(scrollY) {
  const vc = scrollY + window.innerHeight * 0.5;
  const centers = SECTIONS.map(s => {
    const el = document.getElementById(s.id);
    if (!el) return 0;
    return el.offsetTop + el.offsetHeight * 0.5;
  });

  let from = 0, to = 0, t = 0;
  if (vc <= centers[0]) {
    from = to = 0; t = 0;
  } else if (vc >= centers[centers.length - 1]) {
    from = to = centers.length - 1; t = 1;
  } else {
    for (let i = 0; i < centers.length - 1; i++) {
      if (vc >= centers[i] && vc <= centers[i + 1]) {
        from = i; to = i + 1;
        t = (vc - centers[i]) / (centers[i + 1] - centers[i]);
        break;
      }
    }
  }

  t = eio(Math.min(Math.max(t, 0), 1));
  const a = SECTIONS[from], b = SECTIONS[to];
  return {
    posX: lerp(a.posX, b.posX, t),
    posY: lerp(a.posY, b.posY, t),
    posZ: 0,
    rotY: lerp(a.rotY, b.rotY, t),
    rotX: lerp(a.rotX, b.rotX, t),
    scale: lerp(a.scale, b.scale, t),
  };
}

export function useCarScene({ onProgress, onLoaded, onError }) {
  const canvasRef = useRef(null);
  const dragAreaRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, CAMERA_Z);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const key = new THREE.DirectionalLight(0xfff5e0, 3.5);
    key.position.set(6, 8, 6); scene.add(key);
    const fill = new THREE.DirectionalLight(0xd0e0ff, 1.8);
    fill.position.set(-6, 4, -3); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xc8a44e, 2.5);
    rim.position.set(-2, 3, -10); scene.add(rim);
    const top = new THREE.DirectionalLight(0xffffff, 1.2);
    top.position.set(0, 12, 0); scene.add(top);
    const under = new THREE.DirectionalLight(0xddccaa, 0.5);
    under.position.set(0, -6, 4); scene.add(under);

    const pt1 = new THREE.PointLight(0xc8a44e, 4, 18);
    const pt2 = new THREE.PointLight(0x6699cc, 2.5, 18);
    scene.add(pt1, pt2);

    const pivot = new THREE.Group();
    scene.add(pivot);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollY = 0;
    let carModel = null;

    const drag = {
      active: false,
      lastX: 0,
      lastY: 0,
      deltaX: 0,
      deltaY: 0,
      velX: 0,
      velY: 0,
    };

    const onMouseMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;

      if (drag.active) {
        const dx = e.clientX - drag.lastX;
        const dy = e.clientY - drag.lastY;
        drag.velX = dx * 0.012;
        drag.velY = dy * 0.006;
        drag.deltaX += drag.velX;
        drag.deltaY += drag.velY;
        drag.deltaY = Math.max(-0.6, Math.min(0.6, drag.deltaY));
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
      }
    };

    const onMouseDown = (e) => {
      const hitArea = dragAreaRef.current;
      if (!hitArea || !hitArea.contains(e.target)) return;
      e.preventDefault();
      drag.active = true;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      drag.velX = 0;
      drag.velY = 0;
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      if (dragAreaRef.current) dragAreaRef.current.style.cursor = 'grabbing';
    };

    const onMouseUp = () => {
      drag.active = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (dragAreaRef.current) dragAreaRef.current.style.cursor = 'grab';
    };

    const onTouchStart = (e) => {
      const t = e.touches[0];
      drag.active = true;
      drag.lastX = t.clientX;
      drag.lastY = t.clientY;
      drag.velX = 0;
      drag.velY = 0;
    };

    const onTouchMove = (e) => {
      if (!drag.active) return;
      const t = e.touches[0];
      const dx = t.clientX - drag.lastX;
      const dy = t.clientY - drag.lastY;
      drag.velX = dx * 0.012;
      drag.velY = dy * 0.006;
      drag.deltaX += drag.velX;
      drag.deltaY += drag.velY;
      drag.deltaY = Math.max(-0.6, Math.min(0.6, drag.deltaY));
      drag.lastX = t.clientX;
      drag.lastY = t.clientY;
    };

    const onTouchEnd = () => { drag.active = false; };

    const onScroll = () => { scrollY = window.scrollY; };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    window.addEventListener('scroll', onScroll, { passive: true });

    const cur = { posX: 0, posY: 0, posZ: 0, rotY: 0, rotX: 0, scale: 1 };
    let startTime = performance.now();
    let rafId;

    function tick() {
      rafId = requestAnimationFrame(tick);
      const t = (performance.now() - startTime) / 1000;

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      if (!drag.active) {
        drag.deltaX += drag.velX;
        drag.deltaY += drag.velY;
        drag.deltaY = Math.max(-0.6, Math.min(0.6, drag.deltaY));
        drag.velX *= 0.92;
        drag.velY *= 0.92;
      }

      const tgt = getCarTarget(scrollY);
      cur.posX += (tgt.posX - cur.posX) * LERP;
      cur.posY += (tgt.posY - cur.posY) * LERP;
      cur.posZ += (tgt.posZ - cur.posZ) * LERP;
      cur.rotY += (tgt.rotY - cur.rotY) * LERP;
      cur.rotX += (tgt.rotX - cur.rotX) * LERP;
      cur.scale += (tgt.scale - cur.scale) * LERP;

      const hero = document.getElementById('hero');
      const heroRatio = hero ? Math.max(0, 1 - scrollY / hero.offsetHeight) : 1;
      const float = Math.sin(t * 0.9) * 0.05 * heroRatio;

      if (carModel) {
        pivot.rotation.y = cur.rotY + drag.deltaX + (drag.active ? 0 : mouse.x * 0.08);
        pivot.rotation.x = cur.rotX + drag.deltaY + mouse.y * 0.04;
        pivot.position.x = cur.posX;
        pivot.position.y = cur.posY + float;
        pivot.position.z = cur.posZ;
        pivot.scale.setScalar(cur.scale);
      }

      pt1.position.set(Math.sin(t * 0.5) * 5, 2, Math.cos(t * 0.5) * 5);
      pt2.position.set(Math.cos(t * 0.32) * 6, 1, Math.sin(t * 0.32) * 4);

      renderer.render(scene, camera);
    }
    tick();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    new GLTFLoader().load(
      '/lamborghini_-_ferzor.glb',
      (gltf) => {
        carModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(carModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const s = CAR_SCALE / Math.max(size.x, size.y, size.z);
        carModel.scale.setScalar(s);
        carModel.position.set(-center.x * s, -center.y * s, -center.z * s);
        carModel.traverse(c => { if (c.isMesh && c.material) c.material.envMapIntensity = 2; });
        pivot.add(carModel);
        onLoaded?.();
      },
      (p) => {
        if (p.total > 0) {
          const pct = Math.round(p.loaded / p.total * 100);
          onProgress?.(pct);
        }
      },
      (err) => {
        console.warn('GLB error', err);
        onError?.();
      }
    );

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      renderer.dispose();
    };
  }, []);

  return { canvasRef, dragAreaRef };
}

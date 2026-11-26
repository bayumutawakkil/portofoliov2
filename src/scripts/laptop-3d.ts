import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

export interface SectionTransform {
  pos: { x: number; y: number; z: number };
  rot: { x: number; y: number; z: number };
  scale: number;
}

// Transform configuration per section for Desktop (>= 1024px)
// Laptop is naturally upright (Y-up, screen facing +Z towards camera).
// Positions are strategically placed in negative space (flanks/margins)
// so the 3D model frames the sections without colliding with dense copy.
const DESKTOP_TRANSFORMS: Record<string, SectionTransform> = {
  hero: {
    // Upper-right negative space, clear of BAYU (top-left) and MUTAWAKKIL (mid-right)
    pos: { x: 2.15, y: 0.92, z: -0.15 },
    rot: { x: 0.24, y: -0.52, z: 0.06 },
    scale: 0.74,
  },
  'hero-step2': {
    pos: { x: 2.2, y: 0.96, z: -0.1 },
    rot: { x: 0.26, y: -0.42, z: 0.08 },
    scale: 0.72,
  },
  about: {
    // Positioned in bottom-right margin to leave manifesto copy crystal-clear
    pos: { x: 2.65, y: -0.85, z: 0.05 },
    rot: { x: 0.22, y: 0.42, z: -0.06 },
    scale: 0.9,
  },
  work: {
    // Upper-right above the carousel track
    pos: { x: 2.45, y: 1.35, z: -0.5 },
    rot: { x: 0.2, y: -0.62, z: 0.06 },
    scale: 0.82,
  },
  expertise: {
    // Top-left outer margin, clear of vertical title "WHAT I BRING" and card 01
    pos: { x: -2.95, y: 1.12, z: -0.25 },
    rot: { x: 0.25, y: 0.62, z: -0.06 },
    scale: 0.54,
  },
  experience: {
    // Mid-right negative space below "LEARNING IN PUBLIC" and above accordion cards
    pos: { x: 2.55, y: 0.48, z: -0.25 },
    rot: { x: 0.26, y: -0.45, z: 0.05 },
    scale: 0.64,
  },
  principles: {
    // Bottom-left below heading, clear of principle rows
    pos: { x: -2.25, y: -0.82, z: 0.1 },
    rot: { x: 0.24, y: 0.52, z: -0.05 },
    scale: 0.9,
  },
  contact: {
    // Right margin leaving center CTA clear
    pos: { x: 2.15, y: 0.12, z: 0.15 },
    rot: { x: 0.22, y: -0.38, z: 0.04 },
    scale: 1.05,
  },
};

// Transform configuration per section for Mobile (< 1024px)
const MOBILE_TRANSFORMS: Record<string, SectionTransform> = {
  hero: {
    pos: { x: 0, y: -1.3, z: -0.3 },
    rot: { x: 0.25, y: -0.28, z: 0.04 },
    scale: 0.7,
  },
  about: {
    pos: { x: 0.85, y: -1.35, z: -0.4 },
    rot: { x: 0.25, y: 0.38, z: -0.04 },
    scale: 0.58,
  },
  work: {
    pos: { x: 0.85, y: 1.35, z: -0.5 },
    rot: { x: 0.2, y: -0.48, z: 0.05 },
    scale: 0.55,
  },
  expertise: {
    pos: { x: -0.8, y: -1.3, z: -0.4 },
    rot: { x: 0.25, y: 0.48, z: -0.04 },
    scale: 0.58,
  },
  experience: {
    pos: { x: 0.8, y: 1.3, z: -0.4 },
    rot: { x: 0.25, y: -0.38, z: 0.04 },
    scale: 0.55,
  },
  principles: {
    pos: { x: -0.75, y: -1.3, z: -0.4 },
    rot: { x: 0.25, y: 0.42, z: -0.04 },
    scale: 0.58,
  },
  contact: {
    pos: { x: 0, y: -1.0, z: -0.3 },
    rot: { x: 0.22, y: -0.22, z: 0.03 },
    scale: 0.7,
  },
};

export interface LaptopController {
  moveToSection: (sectionId: string, immediate?: boolean) => void;
  destroy: () => void;
}

export function initLaptop3D(canvas: HTMLCanvasElement): LaptopController | null {
  const container = canvas.parentElement;
  if (!container) return null;

  // Check WebGL availability
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return null;
  } catch {
    return null;
  }

  // Scene setup
  const scene = new THREE.Scene();

  const getWidth = () => window.innerWidth;
  const getHeight = () => window.innerHeight;

  const camera = new THREE.PerspectiveCamera(42, getWidth() / getHeight(), 0.1, 100);
  camera.position.set(0, 0, 5.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(getWidth(), getHeight());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // Studio lighting balanced for atmospheric background depth
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.05);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x94b4c1, 1.3);
  fillLight.position.set(-5, 2, 3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xecefca, 1.2);
  rimLight.position.set(0, 5, -4);
  scene.add(rimLight);

  const bottomLight = new THREE.DirectionalLight(0x213448, 1.2);
  bottomLight.position.set(0, -4, 2);
  scene.add(bottomLight);

  // 3-Tier Hierarchy:
  // 1. rootGroup: animated by GSAP on section changes (position, rotation, scale)
  // 2. floatGroup: animated in render loop (ambient sinusoidal float + mouse parallax)
  // 3. modelGroup: contains centered model
  const rootGroup = new THREE.Group();
  const floatGroup = new THREE.Group();
  const modelGroup = new THREE.Group();

  scene.add(rootGroup);
  rootGroup.add(floatGroup);
  floatGroup.add(modelGroup);

  let currentSection = 'hero';
  const isDesktop = () => window.innerWidth >= 1024;
  const getTransforms = () => (isDesktop() ? DESKTOP_TRANSFORMS : MOBILE_TRANSFORMS);

  // Set initial transform based on current section
  const initialConfig = getTransforms()[currentSection] ?? getTransforms().hero;
  rootGroup.position.set(initialConfig.pos.x, initialConfig.pos.y, initialConfig.pos.z);
  rootGroup.rotation.set(initialConfig.rot.x, initialConfig.rot.y, initialConfig.rot.z);
  rootGroup.scale.setScalar(initialConfig.scale);

  // Fade in canvas initially
  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 0.7s ease-out';

  // Load laptop.glb
  const loader = new GLTFLoader();

  loader.load(
    '/laptop.glb',
    (gltf) => {
      const model = gltf.scene;

      // Calculate bounding box to center geometry
      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);

      // Center model at (0, 0, 0)
      model.position.set(-center.x, -center.y, -center.z);

      // Model is already naturally upright (Y-up), so no extra X-flip is needed
      modelGroup.rotation.set(0, 0, 0);

      // Normalize scale so max dimension is ~2.0 units
      const maxDim = Math.max(size.x, size.y, size.z);
      const baseScale = 2.0 / (maxDim || 1);
      modelGroup.scale.setScalar(baseScale);

      modelGroup.add(model);

      // Reveal canvas once model is ready
      canvas.style.opacity = '1';
    },
    undefined,
    (err) => {
      console.warn('Failed to load laptop.glb 3D asset:', err);
    }
  );

  // Transition controller
  let tweenPos: gsap.core.Tween | null = null;
  let tweenRot: gsap.core.Tween | null = null;
  let tweenScale: gsap.core.Tween | null = null;

  const moveToSection = (sectionId: string, immediate = false) => {
    currentSection = sectionId;
    const transforms = getTransforms();
    const target = transforms[sectionId] ?? transforms.hero;

    tweenPos?.kill();
    tweenRot?.kill();
    tweenScale?.kill();

    if (immediate) {
      rootGroup.position.set(target.pos.x, target.pos.y, target.pos.z);
      rootGroup.rotation.set(target.rot.x, target.rot.y, target.rot.z);
      rootGroup.scale.setScalar(target.scale);
      return;
    }

    const duration = 1.15;
    const ease = 'power3.out';

    tweenPos = gsap.to(rootGroup.position, {
      x: target.pos.x,
      y: target.pos.y,
      z: target.pos.z,
      duration,
      ease,
      overwrite: 'auto',
      onUpdate: markDirty,
    });

    tweenRot = gsap.to(rootGroup.rotation, {
      x: target.rot.x,
      y: target.rot.y,
      z: target.rot.z,
      duration,
      ease,
      overwrite: 'auto',
      onUpdate: markDirty,
    });

    tweenScale = gsap.to(rootGroup.scale, {
      x: target.scale,
      y: target.scale,
      z: target.scale,
      duration,
      ease,
      overwrite: 'auto',
      onUpdate: markDirty,
    });
  };

  // Mouse parallax
  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;

  // ── Dirty rendering: only render when something changed ──────────
  let needsRender = true;
  let idleFrames = 0;
  const IDLE_THRESHOLD = 90; // ~3s at 30fps — stop loop after idle

  const markDirty = () => { needsRender = true; idleFrames = 0; };

  const onPointerMove = (e: PointerEvent) => {
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    markDirty();
    startLoop();
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Resize handler
  const maxDPR = window.innerWidth < 1024 ? 1.0 : Math.min(window.devicePixelRatio, 1.5);

  const onResize = () => {
    const w = getWidth();
    const h = getHeight();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.innerWidth < 1024 ? 1.0 : Math.min(window.devicePixelRatio, 1.5));

    // Update coordinates if breakpoint changed
    moveToSection(currentSection, false);
    markDirty();
  };
  window.addEventListener('resize', onResize);

  // Section change event listener
  const onSectionChange = (e: Event) => {
    const customEvent = e as CustomEvent<{ sectionId?: string; immediate?: boolean }>;
    if (customEvent.detail?.sectionId) {
      moveToSection(customEvent.detail.sectionId, customEvent.detail.immediate ?? false);
      markDirty();
      startLoop();
    }
  };
  window.addEventListener('section:change', onSectionChange);

  // Animation render loop — dirty rendering + throttled to ~30fps
  const timer = new THREE.Timer();
  let animationFrameId: number;
  let lastFrameTime = 0;
  let loopRunning = true;
  const FRAME_INTERVAL = 1000 / 30; // cap at 30fps

  const startLoop = () => {
    if (loopRunning) return;
    loopRunning = true;
    animationFrameId = requestAnimationFrame(animate);
  };

  const animate = (timestamp: number = 0) => {
    // Skip frame if tab is hidden
    if (document.hidden) {
      animationFrameId = requestAnimationFrame(animate);
      return;
    }

    // Throttle to ~30fps
    const delta = timestamp - lastFrameTime;
    if (delta < FRAME_INTERVAL) {
      animationFrameId = requestAnimationFrame(animate);
      return;
    }
    lastFrameTime = timestamp - (delta % FRAME_INTERVAL);

    timer.update(timestamp);
    const time = timer.getElapsed();

    // Smooth mouse interpolation
    const prevMX = mouseX, prevMY = mouseY;
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Check if mouse actually moved enough to matter
    const mouseMoved = Math.abs(mouseX - prevMX) > 0.0001 || Math.abs(mouseY - prevMY) > 0.0001;

    // Ambient floating + subtle cursor parallax on floatGroup
    floatGroup.position.y = Math.sin(time * 1.5) * 0.04;
    floatGroup.rotation.y = Math.cos(time * 1.1) * 0.03 + mouseX * 0.08;
    floatGroup.rotation.x = Math.sin(time * 1.3) * 0.02 - mouseY * 0.06;

    renderer.render(scene, camera);

    // Track idle — if nothing is driving changes, stop the loop
    if (needsRender || mouseMoved) {
      idleFrames = 0;
      needsRender = false;
    } else {
      idleFrames++;
    }

    if (idleFrames < IDLE_THRESHOLD) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Pause the loop — markDirty() + startLoop() will restart it
      loopRunning = false;
    }
  };

  // Wire markDirty into GSAP tweens so transitions restart the loop
  const origMoveToSection = moveToSection;
  const moveToSectionWrapped = (sectionId: string, immediate = false) => {
    origMoveToSection(sectionId, immediate);
    markDirty();
    startLoop();
  };

  // Restart loop on visibility change
  const onVisChange = () => { if (!document.hidden) { markDirty(); startLoop(); } };
  document.addEventListener('visibilitychange', onVisChange);

  // Initial DPR setup
  renderer.setPixelRatio(maxDPR);
  animate();

  return {
    moveToSection: moveToSectionWrapped,
    destroy() {
      loopRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('section:change', onSectionChange);
      document.removeEventListener('visibilitychange', onVisChange);

      tweenPos?.kill();
      tweenRot?.kill();
      tweenScale?.kill();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });

      renderer.dispose();
    },
  };
}

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  addStudioLights,
  BOTTLE_HEIGHT,
  createBottle,
  createDrop,
  createLeaf,
  createOilMaterial,
  createOlive,
  createRandom,
  type OliveKind,
} from "@/lib/three/models";

/**
 * Scroll-driven WebGL story: olives → golden drop → bottle → showcase.
 * Progress (0–1) comes from the scroll position, so scrolling back up plays the
 * story backwards. The render loop only runs while the section is on screen.
 */

export type JourneyOptions = Readonly<{ labelUrl: string; lowPower: boolean }>;

export type Journey = Readonly<{
  setProgress: (progress: number) => void;
  setPointer: (x: number, y: number) => void;
  setActive: (active: boolean) => void;
  resize: () => void;
  dispose: () => void;
}>;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const span = (from: number, to: number, value: number) => clamp((value - from) / (to - from));
const smooth = (from: number, to: number, value: number) => {
  const t = span(from, to, value);
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

type Floating = {
  object: THREE.Object3D;
  home: THREE.Vector3;
  gather: THREE.Vector3;
  spin: THREE.Vector3;
  baseScale: number;
  phase: number;
};

function createDust(count: number, random: () => number) {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const offsets = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (random() - 0.5) * 14;
    positions[index * 3 + 1] = (random() - 0.5) * 8;
    positions[index * 3 + 2] = -5 + random() * 7;
    scales[index] = 0.35 + random() * random() * 1.6;
    offsets[index] = random() * 100;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 0.7 }, uLift: { value: 0 } },
    vertexShader: `
      uniform float uTime; uniform float uPixelRatio; uniform float uLift;
      attribute float aScale; attribute float aOffset;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y = mod(p.y + 4.0 + uTime * 0.12 * aScale + uLift, 8.0) - 4.0;
        p.x += sin(uTime * 0.35 + aOffset) * 0.18;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = 26.0 * aScale * uPixelRatio / -mv.z;
        vAlpha = smoothstep(4.0, 2.6, abs(p.y)) * (0.55 + 0.45 * sin(uTime * 1.3 + aOffset));
      }`,
    fragmentShader: `
      uniform float uOpacity; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vec3(1.0, 0.84, 0.48) * a, a * vAlpha * uOpacity);
      }`,
  });
  return new THREE.Points(geometry, material);
}

async function loadLabel(url: string, renderer: THREE.WebGLRenderer) {
  try {
    const texture = await new THREE.TextureLoader().loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  } catch {
    return null;
  }
}

export async function createJourney(canvas: HTMLCanvasElement, options: JourneyOptions): Promise<Journey> {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !options.lowPower, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, options.lowPower ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  addStudioLights(scene);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const stage = new THREE.Group();
  scene.add(stage);
  const random = createRandom(2026);

  // 1 — the grove: olives and leaves floating in a loose spiral cloud.
  const cloud = new THREE.Group();
  stage.add(cloud);
  const floating: Floating[] = [];
  const oliveCount = options.lowPower ? 12 : 20;
  const kinds: OliveKind[] = ["green", "green", "turning", "green", "ripe"];
  for (let index = 0; index < oliveCount; index += 1) {
    const olive = createOlive(kinds[index % kinds.length], 100 + index, { stem: index % 3 === 0, detail: options.lowPower ? 0.6 : 0.85 });
    const angle = index * 2.39996;
    const radius = 1.25 + random() * 1.35;
    const home = new THREE.Vector3(Math.cos(angle) * radius, (random() - 0.5) * 3.4, Math.sin(angle) * radius * 0.8);
    const baseScale = 0.23 + random() * 0.12;
    olive.scale.setScalar(baseScale);
    cloud.add(olive);
    floating.push({
      object: olive,
      home,
      gather: new THREE.Vector3((random() - 0.5) * 0.5, (random() - 0.5) * 0.5, (random() - 0.5) * 0.5),
      spin: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.9),
      baseScale,
      phase: random() * Math.PI * 2,
    });
  }
  const leaves: Floating[] = [];
  const leafCount = options.lowPower ? 6 : 10;
  for (let index = 0; index < leafCount; index += 1) {
    const leaf = createLeaf(300 + index);
    const angle = index * 2.39996 + 1.2;
    const radius = 1.7 + random() * 1.5;
    const home = new THREE.Vector3(Math.cos(angle) * radius, (random() - 0.5) * 3.8, Math.sin(angle) * radius * 0.7 - 0.5);
    const baseScale = 0.3 + random() * 0.15;
    leaf.scale.setScalar(baseScale);
    leaf.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    cloud.add(leaf);
    leaves.push({
      object: leaf,
      home,
      gather: home.clone().multiplyScalar(2.6),
      spin: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.6),
      baseScale,
      phase: random() * Math.PI * 2,
    });
  }

  // 2 — the press: a golden drop condenses from the gathered olives.
  const drop = createDrop(options.lowPower ? 0.6 : 1);
  drop.scale.setScalar(0.0001);
  stage.add(drop);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1, 16, 1, true), createOilMaterial("bright"));
  stream.visible = false;
  stage.add(stream);

  // 3 — the bottle, wearing the real 750 ml label.
  const label = await loadLabel(options.labelUrl, renderer);
  const bottle = createBottle(label, options.lowPower ? 0.6 : 1);
  const bottlePivot = new THREE.Group();
  bottle.group.position.y = -BOTTLE_HEIGHT / 2;
  bottlePivot.add(bottle.group);
  bottlePivot.scale.setScalar(0.86);
  stage.add(bottlePivot);
  const neckTopAt = () => (3.12 - BOTTLE_HEIGHT / 2) * bottlePivot.scale.y;

  // 4 — showcase rings and floating gold dust.
  const ringMaterial = new THREE.MeshStandardMaterial({ color: "#d9b867", metalness: 1, roughness: 0.25, emissive: "#3d2a00", emissiveIntensity: 0.4 });
  const rings = [new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.011, 10, 240), ringMaterial), new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.007, 10, 240), ringMaterial)];
  rings[0].rotation.set(1.28, 0.18, 0);
  rings[1].rotation.set(1.42, -0.32, 0.4);
  rings.forEach((ring) => {
    ring.scale.setScalar(0.0001);
    stage.add(ring);
  });
  const dust = createDust(options.lowPower ? 140 : 320, random);
  (dust.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value = pixelRatio;
  scene.add(dust);

  let target = 0;
  let current = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothPointerX = 0;
  let smoothPointerY = 0;
  let active = false;
  let frame = 0;
  let last = performance.now();
  let elapsed = 0;
  let portrait = false;

  const compose = (p: number, time: number) => {
    // Alternate the object opposite the text cards on wide screens.
    const width = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    const sideShift = portrait ? 0 : Math.min(width * 0.2, 2.3);
    stage.position.x = sideShift * Math.cos(p * Math.PI * 3);
    // Landscape: the sticky header covers the top 5rem, so the visual centre sits a little lower.
    stage.position.y = portrait ? 0.8 : -0.25;
    const stageScale = portrait ? Math.min(1, camera.aspect * 1.35) : 1;
    stage.scale.setScalar(stageScale);
    bottlePivot.scale.setScalar(portrait ? 1.08 : 0.86);

    // Grove → gathering.
    const gather = smooth(0.08, 0.3, p);
    const shrink = smooth(0.22, 0.31, p);
    cloud.rotation.y = p * 2.4 + time * 0.04;
    cloud.rotation.x = Math.sin(time * 0.15) * 0.05;
    for (const item of floating) {
      const bob = Math.sin(time * 0.8 + item.phase) * 0.12 * (1 - gather);
      item.object.position.lerpVectors(item.home, item.gather, easeOut(gather));
      item.object.position.y += bob;
      item.object.rotation.set(item.phase + time * item.spin.x + p * 4, time * item.spin.y + p * 3, item.phase + time * item.spin.z);
      item.object.scale.setScalar(Math.max(0.0001, item.baseScale * (1 - shrink)));
      item.object.visible = shrink < 0.999;
    }
    for (const item of leaves) {
      item.object.position.lerpVectors(item.home, item.gather, easeOut(gather));
      item.object.position.y += Math.sin(time * 0.6 + item.phase) * 0.15;
      item.object.rotation.set(item.phase + time * item.spin.x * 0.5 + p * 2, item.phase + time * item.spin.y * 0.5, time * item.spin.z * 0.4 + p * 2);
      const fade = 1 - smooth(0.14, 0.3, p);
      item.object.scale.setScalar(Math.max(0.0001, item.baseScale * fade));
      item.object.visible = fade > 0.001;
    }

    // Drop: grows, then lifts above the bottle neck and empties into it.
    const grow = smooth(0.18, 0.33, p);
    const lift = smooth(0.38, 0.52, p);
    const pour = smooth(0.48, 0.66, p);
    const wobble = 1 + Math.sin(time * 2.2) * 0.025;
    const dropScale = 0.95 * grow * mix(1, 0.3, lift) * (1 - smooth(0.58, 0.66, p));
    drop.visible = dropScale > 0.002;
    drop.scale.set(dropScale * wobble, dropScale / wobble, dropScale * wobble);
    drop.position.set(0, mix(0.15, neckTopAt() + 0.7, easeOut(lift)), 0);
    drop.rotation.y = time * 0.4 + p * 3;

    // Bottle rises, fills, then turns once and settles with the label forward.
    const rise = easeOut(smooth(0.34, 0.52, p));
    const turn = smooth(0.68, 1, p);
    bottlePivot.position.y = mix(-8.5, -0.15, rise) + Math.sin(time * 0.7) * 0.035 * rise;
    bottlePivot.rotation.y = mix(-1.3, -0.35, rise) + turn * (Math.PI * 2 + 0.35);
    bottlePivot.rotation.z = mix(0.18, 0, rise) + Math.sin(time * 0.5) * 0.01;
    bottlePivot.visible = rise > 0.001;
    bottle.setFill(0.92 * pour);

    const streamOn = p > 0.47 && p < 0.66 && dropScale > 0.01;
    stream.visible = streamOn;
    if (streamOn) {
      const top = drop.position.y - dropScale * 1.1;
      const bottom = neckTopAt() + bottlePivot.position.y + 0.15;
      const length = Math.max(0.01, top - bottom);
      stream.scale.set(1 - pour * 0.4, length, 1 - pour * 0.4);
      stream.position.set(0, bottom + length / 2, 0);
    }

    // Showcase rings.
    const ringIn = easeOut(smooth(0.7, 0.92, p));
    rings.forEach((ring, index) => {
      ring.visible = ringIn > 0.001;
      ring.scale.setScalar(Math.max(0.0001, ringIn * (index ? 1.02 : 1)));
      ring.rotation.z = time * (index ? -0.12 : 0.09) + p * (index ? -2 : 2);
    });

    const dustMaterial = dust.material as THREE.ShaderMaterial;
    dustMaterial.uniforms.uTime.value = time;
    dustMaterial.uniforms.uLift.value = p * 3;
    dustMaterial.uniforms.uOpacity.value = 0.45 + 0.4 * smooth(0.2, 0.4, p);

    // Camera: gentle dolly-in for the finale, plus pointer parallax.
    camera.position.z = mix(10, 8.6, smooth(0.66, 1, p));
    camera.position.x = smoothPointerX * 0.35;
    camera.position.y = smoothPointerY * 0.25 + mix(0, 0.15, smooth(0.66, 1, p));
    camera.lookAt(0, stage.position.y * 0.3, 0);
    bottle.update();
  };

  const render = () => {
    compose(current, elapsed);
    renderer.render(scene, camera);
  };

  const tick = (now: number) => {
    frame = 0;
    const delta = Math.min(0.05, (now - last) / 1000);
    last = now;
    elapsed += delta;
    const ease = 1 - Math.exp(-delta * 7);
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.0001) current = target;
    smoothPointerX += (pointerX - smoothPointerX) * ease;
    smoothPointerY += (pointerY - smoothPointerY) * ease;
    render();
    if (active) frame = requestAnimationFrame(tick);
  };

  const resize = () => {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    portrait = camera.aspect < 0.9;
    camera.fov = portrait ? 40 : 32;
    camera.updateProjectionMatrix();
    if (!active) render();
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    active = false;
    cancelAnimationFrame(frame);
    canvas.dispatchEvent(new CustomEvent("journey-lost", { bubbles: true }));
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  resize();

  return {
    setProgress: (progress) => {
      target = clamp(progress);
      if (!active) {
        current = target;
        render();
      }
    },
    setPointer: (x, y) => {
      pointerX = clamp(x, -1, 1);
      pointerY = clamp(y, -1, 1);
    },
    setActive: (next) => {
      if (next === active) return;
      active = next;
      if (active) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    resize,
    dispose: () => {
      active = false;
      cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const material of materials) {
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
          material.dispose();
        }
      });
      bottle.dispose();
      label?.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

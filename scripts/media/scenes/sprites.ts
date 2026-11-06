/**
 * Renders the transparent 3D sprites (olives, leaves, sprig, oil drop, bottle)
 * used as floating depth layers across the site. Driven by render-media.mjs.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { addStudioLights, createBottle, createDrop, createLeaf, createOlive } from "../../../src/lib/three/models";

type Spec = Readonly<{ build: () => Promise<THREE.Object3D> | THREE.Object3D; rotation: [number, number, number]; width: number; height: number; margin?: number }>;

function createSprig() {
  const group = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, -3.2, 0),
    new THREE.Vector3(0.1, -1.6, 0.15),
    new THREE.Vector3(-0.05, 0, 0),
    new THREE.Vector3(0.25, 1.8, -0.1),
    new THREE.Vector3(0.1, 3.2, 0),
  ]);
  group.add(new THREE.Mesh(
    new THREE.TubeGeometry(curve, 64, 0.06, 8, false),
    new THREE.MeshStandardMaterial({ color: "#7a6a42", roughness: 0.8 }),
  ));
  const leaves: [number, number, number, number][] = [
    [0.08, 0.9, -0.2, 3], [0.25, -1.1, 0.4, 7], [0.42, 1.2, 0.2, 13], [0.62, -1.0, -0.3, 17], [0.82, 0.8, 0.1, 21], [0.96, -0.3, 0.2, 29],
  ];
  for (const [t, side, tilt, seed] of leaves) {
    const leaf = createLeaf(seed);
    const point = curve.getPoint(t);
    leaf.scale.setScalar(0.8);
    leaf.position.copy(point);
    leaf.rotation.set(tilt, side * 0.4, -side * 0.9);
    leaf.translateY(1.05);
    group.add(leaf);
  }
  const olives: [number, "green" | "turning" | "ripe", number, number][] = [[0.32, "green", 4, 0.5], [0.5, "turning", 8, -0.55], [0.7, "green", 12, 0.45]];
  for (const [t, kind, seed, side] of olives) {
    const olive = createOlive(kind, seed, { stem: true });
    olive.scale.setScalar(0.52);
    olive.position.copy(curve.getPoint(t)).add(new THREE.Vector3(side, -0.55, 0.35));
    olive.rotation.z = side * 0.8;
    group.add(olive);
  }
  return group;
}

async function loadLabel() {
  const texture = await new THREE.TextureLoader().loadAsync("/public/images/3d/label-750ml.webp");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

const SPECS: Record<string, Spec> = {
  "olive-green-a": { build: () => createOlive("green", 11, { stem: true }), rotation: [0.3, 0.2, -0.5], width: 1024, height: 1024 },
  "olive-green-b": { build: () => createOlive("green", 23), rotation: [1.25, 0.4, 0.95], width: 1024, height: 1024 },
  "olive-turning": { build: () => createOlive("turning", 37, { stem: true }), rotation: [0.2, 1.0, 0.45], width: 1024, height: 1024 },
  "olive-ripe": { build: () => createOlive("ripe", 41), rotation: [0.5, 0.3, -1.1], width: 1024, height: 1024 },
  "leaf-a": { build: () => createLeaf(5), rotation: [-0.5, 0.35, 0.7], width: 1024, height: 1024 },
  "leaf-b": { build: () => createLeaf(9), rotation: [0.65, -0.55, -0.95], width: 1024, height: 1024 },
  sprig: { build: createSprig, rotation: [0.15, 0.25, -0.35], width: 1024, height: 1280 },
  "oil-drop": { build: () => createDrop(1.5), rotation: [0.1, 0, 0.12], width: 768, height: 1024 },
  "bottle-750ml": {
    build: async () => {
      const bottle = createBottle(await loadLabel(), 1.5);
      bottle.setFill(0.92);
      bottle.group.userData.onLayout = bottle.update;
      return bottle.group;
    },
    rotation: [0, -0.18, 0],
    width: 800,
    height: 1800,
    margin: 1.04,
  },
};

declare global {
  interface Window {
    renderSprite: (name: string) => Promise<string>;
    spriteNames: string[];
  }
}

window.spriteNames = Object.keys(SPECS);

window.renderSprite = async (name: string) => {
  const spec = SPECS[name];
  if (!spec) throw new Error(`Unknown sprite ${name}`);
  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(spec.width, spec.height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  addStudioLights(scene);

  const object = await spec.build();
  const pivot = new THREE.Group();
  pivot.add(object);
  pivot.rotation.set(...spec.rotation);
  scene.add(pivot);
  pivot.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(pivot);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  pivot.position.sub(center);
  pivot.updateMatrixWorld(true);
  (object.userData.onLayout as (() => void) | undefined)?.();

  const aspect = spec.width / spec.height;
  const camera = new THREE.PerspectiveCamera(22, aspect, 0.1, 200);
  const fitHeight = Math.max(size.y, size.x / aspect) * (spec.margin ?? 1.12);
  const distance = fitHeight / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) + size.z / 2;
  camera.position.set(0, 0, distance);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  const url = canvas.toDataURL("image/png");
  renderer.dispose();
  pmrem.dispose();
  return url;
};

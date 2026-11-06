import * as THREE from "three";

/**
 * Procedural 3D models shared by the live scroll scene (src/components/journey)
 * and the offline renders in scripts/media. Everything is built from code:
 * no external model files, no CDN, so it works on COS/EdgeOne from mainland China.
 */

export type Random = () => number;

/** Small deterministic PRNG so every render of a seed looks the same. */
export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(width: number, height: number, draw: (context: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) draw(context);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/* ------------------------------------------------------------------ olives */

export type OliveKind = "green" | "turning" | "ripe";

const OLIVE_TONES: Record<OliveKind, { base: string[]; blotch: string[]; spot: string; roughness: number }> = {
  green: { base: ["#3d4c10", "#556718", "#6f8022"], blotch: ["#83902f", "#475812"], spot: "rgba(214, 210, 140, 0.3)", roughness: 0.38 },
  turning: { base: ["#545a18", "#664422", "#4a2230"], blotch: ["#3d1729", "#6f7424", "#56263a"], spot: "rgba(220, 200, 160, 0.28)", roughness: 0.32 },
  ripe: { base: ["#1d1018", "#2c1424", "#43203a"], blotch: ["#4f2645", "#170c14"], spot: "rgba(170, 130, 160, 0.32)", roughness: 0.24 },
};

export function createOliveGeometry(random: Random, detail = 1) {
  const geometry = new THREE.SphereGeometry(1, Math.round(44 * detail), Math.round(30 * detail));
  const position = geometry.attributes.position;
  const point = new THREE.Vector3();
  const taper = 0.1 + random() * 0.1;
  const bend = (random() - 0.5) * 0.12;
  const width = 0.7 + random() * 0.08;
  for (let index = 0; index < position.count; index += 1) {
    point.fromBufferAttribute(position, index);
    const narrow = 1 - taper * Math.max(0, point.y) ** 2;
    point.x = point.x * width * narrow + bend * (point.y * point.y - 0.3);
    point.z *= width * narrow;
    position.setXYZ(index, point.x, point.y, point.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createOliveSkin(kind: OliveKind, random: Random) {
  const tone = OLIVE_TONES[kind];
  return canvasTexture(512, 256, (context) => {
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, tone.base[2]);
    gradient.addColorStop(0.55, tone.base[1]);
    gradient.addColorStop(1, tone.base[0]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 256);
    // Soft blotches give the skin its natural, uneven ripening.
    for (let index = 0; index < 26; index += 1) {
      const x = random() * 512;
      const y = 30 + random() * 196;
      const radius = 18 + random() * (kind === "turning" ? 90 : 46);
      const blotch = context.createRadialGradient(x, y, 0, x, y, radius);
      const color = tone.blotch[Math.floor(random() * tone.blotch.length)];
      blotch.addColorStop(0, color);
      blotch.addColorStop(1, "transparent");
      context.globalAlpha = kind === "turning" ? 0.55 : 0.28;
      context.fillStyle = blotch;
      for (const offset of [-512, 0, 512]) {
        context.beginPath();
        context.arc(x + offset, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }
    // Lenticels: the tiny pale dots on an olive skin.
    context.globalAlpha = 1;
    context.fillStyle = tone.spot;
    for (let index = 0; index < 200; index += 1) {
      const y = 20 + random() * 216;
      context.beginPath();
      context.ellipse(random() * 512, y, 0.7 + random() * 1.1, 0.6 + random() * 0.8, 0, 0, Math.PI * 2);
      context.fill();
    }
  });
}

export function createOlive(kind: OliveKind, seed: number, options: { stem?: boolean; detail?: number } = {}) {
  const random = createRandom(seed);
  const tone = OLIVE_TONES[kind];
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    createOliveGeometry(random, options.detail ?? 1),
    new THREE.MeshPhysicalMaterial({
      map: createOliveSkin(kind, random),
      roughness: tone.roughness,
      clearcoat: 0.75,
      clearcoatRoughness: 0.22,
      envMapIntensity: 0.85,
    }),
  );
  group.add(body);
  if (options.stem) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.07, 0.55, 10),
      new THREE.MeshStandardMaterial({ color: "#6f6634", roughness: 0.7 }),
    );
    stem.position.set(0.04, 1.18, 0);
    stem.rotation.z = -0.25;
    group.add(stem);
  }
  group.name = `olive-${kind}`;
  return group;
}

/* ------------------------------------------------------------------ leaves */

export function createLeafGeometry(random: Random) {
  const length = 3.4;
  const width = 0.6 + random() * 0.12;
  const bend = 0.35 + random() * 0.45;
  const fold = 0.16 + random() * 0.14;
  const twist = (random() - 0.5) * 0.7;
  const geometry = new THREE.PlaneGeometry(1, 1, 6, 48);
  const position = geometry.attributes.position;
  for (let index = 0; index < position.count; index += 1) {
    const across = position.getX(index);
    const along = position.getY(index) + 0.5;
    const profile = Math.pow(Math.sin(Math.PI * Math.pow(along, 0.82)), 0.72);
    let x = across * width * profile;
    const y = along * length;
    let z = bend * along * along * 1.15 + fold * Math.abs(x) * 2.4;
    const angle = twist * along;
    [x, z] = [x * Math.cos(angle) - z * Math.sin(angle), x * Math.sin(angle) + z * Math.cos(angle)];
    position.setXYZ(index, x, y - length * 0.5, z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createLeafTexture(top: boolean) {
  return canvasTexture(64, 512, (context) => {
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, top ? "#3f5a2b" : "#8f9680");
    gradient.addColorStop(0.5, top ? "#334c22" : "#7d856c");
    gradient.addColorStop(1, top ? "#2a3f1c" : "#6f775e");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 512);
    context.strokeStyle = top ? "rgba(185, 196, 126, 0.75)" : "rgba(235, 233, 214, 0.9)";
    context.lineWidth = 2.2;
    context.beginPath();
    context.moveTo(32, 0);
    context.lineTo(32, 512);
    context.stroke();
    context.strokeStyle = top ? "rgba(120, 140, 80, 0.25)" : "rgba(240, 238, 220, 0.3)";
    context.lineWidth = 1;
    for (let y = 30; y < 500; y += 26) {
      context.beginPath();
      context.moveTo(32, y);
      context.lineTo(4, y - 22);
      context.moveTo(32, y);
      context.lineTo(60, y - 22);
      context.stroke();
    }
  });
}

export function createLeaf(seed: number) {
  const random = createRandom(seed);
  const geometry = createLeafGeometry(random);
  const group = new THREE.Group();
  group.add(
    new THREE.Mesh(
      geometry,
      new THREE.MeshPhysicalMaterial({ map: createLeafTexture(true), roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.35, side: THREE.FrontSide }),
    ),
    new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ map: createLeafTexture(false), roughness: 0.85, envMapIntensity: 0.6, side: THREE.BackSide }),
    ),
  );
  group.name = "olive-leaf";
  return group;
}

/* ---------------------------------------------------------------- oil drop */

export function createOilMaterial(tone: "bright" | "deep" = "bright") {
  const material = new THREE.MeshPhysicalMaterial({
    color: tone === "bright" ? "#c08a0e" : "#5f5a0c",
    emissive: tone === "bright" ? "#4d2c00" : "#231f00",
    emissiveIntensity: 0.5,
    roughness: 0.05,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    ior: 1.47,
    envMapIntensity: 1.5,
  });
  if (tone === "bright") {
    // Fake translucency: light passing through the centre glows gold, the rim stays deep amber.
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `float oilFacing = pow(abs(dot(normalize(normal), normalize(vViewPosition))), 1.4);
         outgoingLight = outgoingLight * 0.36 + mix(vec3(0.12, 0.05, 0.0), vec3(0.9, 0.5, 0.05), oilFacing) * 0.58;
         gl_FragColor = vec4(outgoingLight, diffuseColor.a);`,
      );
    };
  }
  return material;
}

export function createDropGeometry(detail = 1) {
  const points: THREE.Vector2[] = [];
  const steps = Math.round(56 * detail);
  for (let index = 0; index <= steps; index += 1) {
    const t = Math.PI - (index / steps) * Math.PI;
    points.push(new THREE.Vector2(Math.sin(t) * Math.pow(Math.sin(t / 2), 1.15) * 0.92, Math.cos(t) * 1.25));
  }
  return new THREE.LatheGeometry(points, Math.round(64 * detail));
}

export function createDrop(detail = 1) {
  const mesh = new THREE.Mesh(createDropGeometry(detail), createOilMaterial("bright"));
  mesh.name = "oil-drop";
  return mesh;
}

/* ------------------------------------------------------------------ bottle */

/** Outer profile of the 750 ml bottle (radius, height). Total height ≈ 3.62. */
const BOTTLE_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [0.3, 0], [0.39, 0.012], [0.415, 0.05], [0.42, 0.12],
  [0.42, 2.3], [0.412, 2.4], [0.385, 2.5], [0.335, 2.6], [0.265, 2.69], [0.205, 2.76],
  [0.17, 2.83], [0.158, 2.9], [0.155, 3.05], [0.155, 3.12], [0, 3.12],
];

export const BOTTLE_HEIGHT = 3.62;

function profileRadius(y: number) {
  for (let index = 1; index < BOTTLE_PROFILE.length; index += 1) {
    const [r0, y0] = BOTTLE_PROFILE[index - 1];
    const [r1, y1] = BOTTLE_PROFILE[index];
    if (y >= y0 && y <= y1 && y1 > y0) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0;
}

/** Glass that darkens and becomes more opaque at its silhouette, like thick green glass. */
function createGlassMaterial() {
  const material = new THREE.MeshPhysicalMaterial({
    color: "#1a3110",
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    opacity: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.8,
    depthWrite: false,
  });
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `float glassEdge = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 1.7);
       outgoingLight *= mix(1.0, 0.3, glassEdge);
       gl_FragColor = vec4(outgoingLight, mix(diffuseColor.a, 0.97, glassEdge));`,
    );
  };
  return material;
}

function createFallbackLabel() {
  return canvasTexture(512, 1100, (context) => {
    context.fillStyle = "#123f26";
    context.fillRect(0, 0, 512, 1100);
    context.strokeStyle = "#c9a95f";
    context.lineWidth = 6;
    context.strokeRect(18, 18, 476, 1064);
    context.fillStyle = "#dcc183";
    context.textAlign = "center";
    context.font = "bold 64px Georgia, serif";
    context.fillText("GANLAN", 256, 330);
    context.fillText("GOLD", 256, 410);
    context.font = "40px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    context.fillText("摩洛哥", 256, 500);
    context.fillText("特级初榨橄榄油", 256, 560);
  });
}

export type Bottle = Readonly<{
  group: THREE.Group;
  /** 0 = empty, 1 = full to the shoulder. */
  setFill: (fill: number) => void;
  /** Call once per frame after the group moved: keeps the oil clipping plane in world space. */
  update: () => void;
  dispose: () => void;
}>;

export function createBottle(label: THREE.Texture | null, detail = 1): Bottle {
  const radial = Math.round(96 * detail);
  const group = new THREE.Group();
  group.name = "ganlan-bottle-750ml";
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  // Oil volume: clipped by a moving plane to show the fill level.
  const fillPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const worldPlane = new THREE.Plane();
  const oilMaterial = track(createOilMaterial("deep"));
  oilMaterial.clippingPlanes = [worldPlane];
  oilMaterial.side = THREE.DoubleSide;
  const oilProfile = BOTTLE_PROFILE.filter(([, y]) => y <= 3.0).map(([r, y]) => new THREE.Vector2(r * 0.93, Math.max(0.03, y)));
  const oil = new THREE.Mesh(track(new THREE.LatheGeometry(oilProfile, Math.round(48 * detail))), oilMaterial);
  oil.renderOrder = 1;
  const surfaceMaterial = track(createOilMaterial("bright"));
  surfaceMaterial.side = THREE.DoubleSide;
  const surface = new THREE.Mesh(track(new THREE.CircleGeometry(1, Math.round(48 * detail))), surfaceMaterial);
  surface.rotation.x = -Math.PI / 2;
  surface.renderOrder = 1;

  const glass = new THREE.Mesh(
    track(new THREE.LatheGeometry(BOTTLE_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), radial)),
    track(createGlassMaterial()),
  );
  glass.renderOrder = 3;

  // Real label artwork (unrolled from the official 750 ml photo, see scripts/media/extract-label.py).
  // Arc and height match the photo: 96.5° of the circumference, 5.13 × the bottle radius tall.
  const labelTexture = label ?? track(createFallbackLabel());
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  const labelArc = 1.684;
  const labelHeight = 2.155;
  const labelMesh = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.4235, 0.4235, labelHeight, radial, 1, true, -labelArc / 2, labelArc)),
    track(new THREE.MeshPhysicalMaterial({ map: labelTexture, roughness: 0.48, clearcoat: 0.55, clearcoatRoughness: 0.28, envMapIntensity: 0.9 })),
  );
  labelMesh.position.y = 0.13 + labelHeight / 2;
  labelMesh.renderOrder = 4;

  // Gold capsule with a knurled screw cap.
  const capProfile: [number, number][] = [[0.16, 2.98], [0.168, 3.0], [0.168, 3.33], [0.175, 3.35], [0.175, 3.6], [0.166, 3.62], [0, 3.625]];
  const capGeometry = track(new THREE.LatheGeometry(capProfile.map(([r, y]) => new THREE.Vector2(r, y)), radial));
  const capPosition = capGeometry.attributes.position;
  for (let index = 0; index < capPosition.count; index += 1) {
    const y = capPosition.getY(index);
    if (y < 3.355 || y > 3.598) continue;
    const x = capPosition.getX(index);
    const z = capPosition.getZ(index);
    if (Math.hypot(x, z) < 0.01) continue;
    const ridge = 1 + 0.025 * Math.cos(Math.atan2(x, z) * 60);
    capPosition.setXYZ(index, x * ridge, y, z * ridge);
  }
  capGeometry.computeVertexNormals();
  const cap = new THREE.Mesh(capGeometry, track(new THREE.MeshStandardMaterial({ color: "#d6b25e", metalness: 1, roughness: 0.26, envMapIntensity: 1.4 })));
  cap.renderOrder = 4;

  group.add(oil, surface, glass, labelMesh, cap);

  let fillY = 0;
  const setFill = (fill: number) => {
    const clamped = Math.max(0, Math.min(1, fill));
    fillY = 0.04 + clamped * 2.62;
    const visible = clamped > 0.002;
    oil.visible = visible;
    surface.visible = visible;
    surface.position.y = fillY;
    const radius = profileRadius(fillY) * 0.93;
    surface.scale.setScalar(Math.max(radius, 0.001));
  };
  const update = () => {
    group.updateMatrixWorld();
    fillPlane.constant = fillY;
    worldPlane.copy(fillPlane).applyMatrix4(group.matrixWorld);
  };
  setFill(0.9);

  return {
    group,
    setFill,
    update,
    dispose: () => disposables.forEach((item) => item.dispose()),
  };
}

/* ------------------------------------------------------------- lighting */

export function addStudioLights(scene: THREE.Scene) {
  const hemisphere = new THREE.HemisphereLight("#fff1d0", "#14261a", 0.75);
  const key = new THREE.DirectionalLight("#ffe0a3", 2.4);
  key.position.set(4, 6, 5);
  const rim = new THREE.DirectionalLight("#ffd27a", 1.6);
  rim.position.set(-5, 3, -4);
  const fill = new THREE.DirectionalLight("#cfe3c8", 0.45);
  fill.position.set(-3, -2, 4);
  scene.add(hemisphere, key, rim, fill);
  return [hemisphere, key, rim, fill];
}

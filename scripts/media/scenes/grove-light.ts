/**
 * "Grove light": a slow cinemagraph made from the approved panorama (landscape
 * part only, no packaging). Ken Burns ping-pong, sun rays and drifting pollen,
 * all periodic so the video loops without a visible cut.
 */

declare global {
  interface Window {
    setupScene: (width: number, height: number) => Promise<void>;
    renderFrame: (phase: number) => string;
  }
}

const SOURCE = "/public/images/hero/products-desktop.webp";
/** Mountains, village and groves; stops left of the bottles and above the olive bowl. */
const CROP = { x: 0, y: 118, width: 860, height: 484 };

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let image: HTMLImageElement;

type Mote = { x: number; y: number; radius: number; drift: number; sway: number; offset: number; alpha: number };
let motes: Mote[] = [];

function random(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

window.setupScene = async (width: number, height: number) => {
  canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);
  context = canvas.getContext("2d")!;
  image = new Image();
  image.src = SOURCE;
  await image.decode();
  const next = random(7);
  motes = Array.from({ length: 70 }, () => ({
    x: next(),
    y: next(),
    radius: 0.6 + next() * next() * 3.4,
    drift: 1 + Math.floor(next() * 2),
    sway: 6 + next() * 18,
    offset: next() * Math.PI * 2,
    alpha: 0.25 + next() * 0.6,
  }));
};

const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * 2 * t);

window.renderFrame = (phase: number) => {
  const { width, height } = canvas;
  const zoom = 1.03 + 0.07 * ease(phase);
  const panX = (ease(phase) - 0.5) * 0.04;
  const drawWidth = width * zoom;
  const drawHeight = height * zoom;
  context.globalCompositeOperation = "source-over";
  context.filter = "saturate(1.05) contrast(1.04)";
  context.drawImage(
    image,
    CROP.x, CROP.y, CROP.width, CROP.height,
    (width - drawWidth) / 2 + panX * width, (height - drawHeight) * 0.35, drawWidth, drawHeight,
  );
  context.filter = "none";

  // Warm sun glow from the upper right.
  const sunX = width * 0.78;
  const sunY = -height * 0.12;
  const glow = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, width * 0.8);
  glow.addColorStop(0, "rgba(255, 220, 150, 0.4)");
  glow.addColorStop(0.35, "rgba(255, 200, 120, 0.12)");
  glow.addColorStop(1, "rgba(255, 190, 110, 0)");
  context.globalCompositeOperation = "screen";
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  // Soft god rays that breathe with the loop.
  context.globalCompositeOperation = "lighter";
  context.filter = `blur(${Math.round(width / 70)}px)`;
  for (let ray = 0; ray < 9; ray += 1) {
    const angle = 1.85 + ray * 0.085 + Math.sin(phase * Math.PI * 2 + ray * 1.7) * 0.012;
    const spread = 0.03 + (ray % 3) * 0.012;
    const intensity = 0.06 + 0.05 * Math.sin(phase * Math.PI * 2 + ray * 2.3) ** 2;
    const length = width * 1.5;
    const gradient = context.createLinearGradient(sunX, sunY, sunX + Math.cos(angle) * length, sunY + Math.sin(angle) * length);
    gradient.addColorStop(0, `rgba(255, 226, 160, ${intensity})`);
    gradient.addColorStop(0.7, "rgba(255, 210, 140, 0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(sunX, sunY);
    context.lineTo(sunX + Math.cos(angle - spread) * length, sunY + Math.sin(angle - spread) * length);
    context.lineTo(sunX + Math.cos(angle + spread) * length, sunY + Math.sin(angle + spread) * length);
    context.closePath();
    context.fill();
  }
  context.filter = "none";

  // Pollen / dust motes: each crosses the frame an integer number of times per loop.
  for (const mote of motes) {
    const y = ((mote.y - phase * mote.drift) % 1 + 1) % 1;
    const x = mote.x * width + Math.sin(phase * Math.PI * 2 + mote.offset) * mote.sway;
    const flicker = 0.65 + 0.35 * Math.sin(phase * Math.PI * 4 + mote.offset);
    const radius = mote.radius * (width / 960);
    const dot = context.createRadialGradient(x, y * height, 0, x, y * height, radius * 3);
    dot.addColorStop(0, `rgba(255, 236, 180, ${mote.alpha * flicker})`);
    dot.addColorStop(1, "rgba(255, 236, 180, 0)");
    context.fillStyle = dot;
    context.beginPath();
    context.arc(x, y * height, radius * 3, 0, Math.PI * 2);
    context.fill();
  }

  // Gentle vignette.
  context.globalCompositeOperation = "multiply";
  const vignette = context.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, width * 0.75);
  vignette.addColorStop(0, "rgba(255, 255, 255, 1)");
  vignette.addColorStop(1, "rgba(120, 110, 90, 1)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = "source-over";
  return canvas.toDataURL("image/jpeg", 0.95);
};

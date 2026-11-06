/**
 * Regenerates the 3D sprites and the two background videos.
 *
 *   node scripts/media/render-media.mjs                 # everything
 *   node scripts/media/render-media.mjs sprites         # only the 3D sprites
 *   node scripts/media/render-media.mjs liquid-gold     # only one video
 *   node scripts/media/render-media.mjs liquid-gold --preview   # one frame, no encoding
 *
 * Needs: npm ci, Playwright's Chromium (npx playwright install chromium) and ffmpeg
 * with libx264, libvpx-vp9 and libwebp. Set CHROMIUM_PATH to use another Chromium.
 * Output: public/images/3d/*.webp, public/media/*.mp4|webm and *-poster.webp
 * (previews: scripts/media/preview/, ignored by Git).
 */
import { build } from "esbuild";
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const work = await mkdtemp(join(tmpdir(), "ganlan-media-"));
const args = process.argv.slice(2);
const preview = args.includes("--preview");
const only = args.filter((arg) => !arg.startsWith("--"));
const wanted = (name) => only.length === 0 || only.includes(name);

const VIDEOS = {
  "liquid-gold": { width: 1280, height: 720, fps: 30, seconds: 8, crf: { h264: 29, vp9: 41 } },
  "grove-light": { width: 1280, height: 720, fps: 30, seconds: 10, crf: { h264: 26, vp9: 38 } },
};

const types = { ".js": "text/javascript", ".html": "text/html", ".webp": "image/webp", ".png": "image/png", ".avif": "image/avif" };

function run(command, commandArgs) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, commandArgs, { stdio: ["ignore", "ignore", "pipe"] });
    let error = "";
    child.stderr.on("data", (chunk) => { error += chunk; });
    child.on("close", (code) => (code === 0 ? resolvePromise() : reject(new Error(`${command} failed (${code}):\n${error.slice(-2000)}`))));
  });
}

async function bundle(entry) {
  const outfile = join(work, `${entry}.js`);
  await build({ entryPoints: [join(root, "scripts/media/scenes", `${entry}.ts`)], bundle: true, format: "esm", outfile, logLevel: "warning", target: "es2022" });
  return `/build/${entry}.js`;
}

const server = createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  try {
    if (path.startsWith("/page/")) {
      response.writeHead(200, { "content-type": "text/html" });
      response.end(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:transparent}</style><script type="module" src="/build/${path.slice(6)}.js"></script>`);
      return;
    }
    const file = path.startsWith("/build/") ? join(work, path.slice(7)) : join(root, normalize(path).replace(/^([/\\])+/, ""));
    if (!file.startsWith(root) && !file.startsWith(work)) throw new Error("outside");
    const body = await readFile(file);
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end();
  }
});
await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

async function openScene(entry) {
  await bundle(entry);
  const page = await browser.newPage();
  page.on("pageerror", (error) => console.error(`[${entry}]`, error.message));
  await page.goto(`${origin}/page/${entry}`);
  await page.waitForFunction(() => "renderFrame" in window || "renderSprite" in window);
  return page;
}

const toBuffer = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
const kb = async (file) => `${Math.round((await stat(file)).size / 1024)} KB`;

if (wanted("sprites")) {
  const page = await openScene("sprites");
  const names = await page.evaluate(() => window.spriteNames);
  await mkdir(join(root, "public/images/3d"), { recursive: true });
  for (const name of names) {
    const png = join(work, `${name}.png`);
    await writeFile(png, toBuffer(await page.evaluate((spriteName) => window.renderSprite(spriteName), name)));
    const target = join(root, "public/images/3d", `${name}.webp`);
    // Rendered at 2× and downsampled for clean anti-aliased edges.
    await run("ffmpeg", ["-y", "-i", png, "-vf", "scale=iw/2:-1:flags=lanczos", "-c:v", "libwebp", "-pix_fmt", "yuva420p", "-quality", "86", "-compression_level", "6", target]);
    console.log(`✓ public/images/3d/${name}.webp ${await kb(target)}`);
  }
  await page.close();
}

for (const [name, video] of Object.entries(VIDEOS)) {
  if (!wanted(name)) continue;
  const page = await openScene(name);
  await page.evaluate(([width, height]) => window.setupScene(width, height), [video.width, video.height]);
  const frames = join(work, name);
  await mkdir(frames, { recursive: true });
  const total = preview ? 1 : video.fps * video.seconds;
  const started = Date.now();
  for (let frame = 0; frame < total; frame += 1) {
    const phase = preview ? 0.3 : frame / total;
    const data = await page.evaluate((value) => window.renderFrame(value), phase);
    await writeFile(join(frames, `${String(frame).padStart(4, "0")}.jpg`), toBuffer(data));
    if (frame % 30 === 0) console.log(`  ${name}: frame ${frame}/${total} (${Math.round((Date.now() - started) / 1000)} s)`);
  }
  await page.close();
  const outDir = join(root, "public/media");
  await mkdir(outDir, { recursive: true });
  if (preview) {
    await mkdir(join(root, "scripts/media/preview"), { recursive: true });
    const target = join(root, "scripts/media/preview", `${name}.jpg`);
    await writeFile(target, await readFile(join(frames, "0000.jpg")));
    console.log(`✓ preview ${target}`);
    continue;
  }
  const input = ["-y", "-framerate", String(video.fps), "-i", join(frames, "%04d.jpg")];
  const mp4 = join(outDir, `${name}.mp4`);
  const webm = join(outDir, `${name}.webm`);
  const poster = join(outDir, `${name}-poster.webp`);
  await run("ffmpeg", [...input, "-c:v", "libx264", "-preset", "slow", "-crf", String(video.crf.h264), "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", "-an", mp4]);
  await run("ffmpeg", [...input, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(video.crf.vp9), "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", "-an", webm]);
  await run("ffmpeg", ["-y", "-i", join(frames, "0000.jpg"), "-c:v", "libwebp", "-quality", "78", poster]);
  console.log(`✓ public/media/${name}.mp4 ${await kb(mp4)} · .webm ${await kb(webm)} · poster ${await kb(poster)}`);
}

await browser.close();
server.close();
await rm(work, { recursive: true, force: true });

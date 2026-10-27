/** Convert Next.js static export `out/` into a Gandi-ready `dist/` directory. */
import { cp, rm, access, writeFile } from "node:fs/promises";
const source = new URL("../out/", import.meta.url);
const target = new URL("../dist/", import.meta.url);
await access(source);
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
console.log("Gandi-ready static site: dist/");

if (process.argv.includes("--preview")) {
  await writeFile(
    new URL("EMAILJS_PREVIEW_ONLY.txt", target),
    "PREVIEW BUILD: EmailJS may be disabled. Configure actual identifiers and run npm run build before production deployment.\n",
  );
}

/** Copy the portable static export for Netlify, Alibaba Cloud OSS or Gandi. */
import { cp, rm, access } from "node:fs/promises";
const source = new URL("../out/", import.meta.url);
const target = new URL("../dist/", import.meta.url);
await access(source);
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
console.log("Portable static site: dist/");

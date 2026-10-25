import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ASSET_PATHS, QR_SOURCE_HASHES } from "../src/lib/assets";

const publicFile = (path: string) => join(process.cwd(), "public", path);

describe("runtime asset mapping", () => {
  it("maps four independent product images and responsive hero files", async () => {
    expect(Object.keys(ASSET_PATHS.products)).toEqual(["250ml", "500ml", "750ml", "5l"]);

    await Promise.all([
      ...Object.values(ASSET_PATHS.products),
      ASSET_PATHS.hero.desktopAvif,
      ASSET_PATHS.hero.desktopWebp,
      ASSET_PATHS.hero.mobileAvif,
      ASSET_PATHS.hero.mobileWebp,
    ].map((path) => access(publicFile(path))));
  });

  it("keeps the QR assignments byte-identical to the V7 extractions", async () => {
    for (const owner of ["lassad", "fouad"] as const) {
      const bytes = await readFile(publicFile(ASSET_PATHS.qr[owner]));
      const digest = createHash("sha256").update(bytes).digest("hex");
      expect(digest).toBe(QR_SOURCE_HASHES[owner]);
    }
  });

  it("does not expose the reference banner as a runtime asset", () => {
    expect(JSON.stringify(ASSET_PATHS)).not.toContain("homepage-reference");
  });
});

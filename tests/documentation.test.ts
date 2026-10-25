import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("handover documentation", () => {
  it("contains the required operating guides and README subjects", () => {
    const readme = read("README.md");
    for (const heading of ["Local setup", "Environment", "Products and currency", "Lead handling", "Tests and verification", "Production and operations"]) {
      expect(readme).toContain(`## ${heading}`);
    }

    for (const file of ["DEPLOYMENT", "ADMIN_GUIDE", "SECURITY", "MAINTENANCE", "LAUNCH_READINESS"]) {
      expect(read(`docs/${file}.md`).length).toBeGreaterThan(500);
    }
  });

  it("closes implementation mappings without misrepresenting external approvals", () => {
    const audit = read("docs/SPECIFICATION_AUDIT.md");
    expect(audit).not.toContain("| Planned |");
    expect(audit).toContain("| External |");
    expect(read("docs/LAUNCH_READINESS.md")).toContain("does not authorize publication");
    expect(read("docs/ACCEPTANCE_CHECKLIST.md")).toContain("External launch blockers");
  });
});

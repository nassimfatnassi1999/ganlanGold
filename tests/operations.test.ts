import { execFileSync, spawnSync } from "node:child_process";
import { accessSync, constants, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("container operations", () => {
  it("builds a standalone non-root application image with separate migration tooling", () => {
    const dockerfile = read("Dockerfile");
    expect(dockerfile).toContain("AS migration");
    expect(dockerfile).toContain("AS runner");
    expect(dockerfile).toContain(".next/standalone");
    expect(dockerfile).toContain("USER nextjs");
    expect(dockerfile).toContain("ENTRYPOINT [\"/app/scripts/entrypoint.sh\"]");
  });

  it("declares durable database, gated startup, proxy, rate refresh, and opt-in backup services", () => {
    const compose = read("docker-compose.yml");
    for (const service of ["db:", "migrate:", "app:", "rates:", "proxy:", "backup:", "restore:"]) {
      expect(compose).toContain(service);
    }
    expect(compose).toContain("service_healthy");
    expect(compose).toContain("service_completed_successfully");
    expect(compose).toContain("postgres_data:");
    expect(compose).toContain("caddy_data:");
    expect(compose).toContain("profiles: [\"operations\"]");
    expect(compose).toContain("POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?");
  });

  it("documents every required production environment contract without a working secret", () => {
    const env = read(".env.example");
    for (const key of [
      "POSTGRES_PASSWORD",
      "DATABASE_URL",
      "NEXT_PUBLIC_SITE_URL",
      "RATE_LIMIT_SECRET",
      "SUBMISSION_FINGERPRINT_SECRET",
      "PRIVACY_HASH_SECRET",
      "CRON_SECRET",
      "INITIAL_ADMIN_EMAIL",
      "INITIAL_ADMIN_PASSWORD",
    ]) {
      expect(env).toContain(`${key}=`);
    }
    expect(env).not.toMatch(/Atlas-Gold-2026|admin-e2e@example\.test/);
  });

  it("keeps shell entry points syntactically valid, executable, and safely dry-runnable", () => {
    for (const path of ["scripts/entrypoint.sh", "scripts/backup.sh", "scripts/restore.sh"]) {
      const absolute = resolve(root, path);
      execFileSync("sh", ["-n", absolute]);
      accessSync(absolute, constants.X_OK);
    }

    const environment = {
      ...process.env,
      DATABASE_URL: "postgresql://user:password@db:5432/ganlan",
      BACKUP_DIR: resolve(root, ".operations-test-backups"),
    };
    const backup = spawnSync(resolve(root, "scripts/backup.sh"), ["--dry-run"], { encoding: "utf8", env: environment });
    expect(backup.status).toBe(0);
    expect(backup.stdout).toContain("Dry run");
    expect(backup.stdout).not.toContain(environment.DATABASE_URL);

    const restore = spawnSync(resolve(root, "scripts/restore.sh"), ["--dry-run", "example.dump"], {
      encoding: "utf8",
      env: environment,
    });
    expect(restore.status).toBe(0);
    expect(restore.stdout).toContain("Dry run");
    expect(restore.stdout).not.toContain(environment.DATABASE_URL);
  });

  it("requires explicit confirmation before a restore can execute", () => {
    const result = spawnSync(resolve(root, "scripts/restore.sh"), ["example.dump"], {
      encoding: "utf8",
      env: { ...process.env, DATABASE_URL: "postgresql://user:password@db:5432/ganlan" },
    });
    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain("--confirm-restore");
  });

  it("uses Caddy as an environment-driven HTTPS-ready reverse proxy", () => {
    const caddyfile = read("Caddyfile");
    expect(caddyfile).toContain("{$SITE_ADDRESS:");
    expect(caddyfile).toContain("reverse_proxy app:3000");
  });
});

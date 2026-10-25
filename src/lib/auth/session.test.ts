import { describe, expect, it } from "vitest";
import {
  MemorySessionRepository,
  createSession,
  getSessionCookieOptions,
  revokeSession,
  verifySessionToken,
} from "./session";

const user = { id: "11111111-1111-1111-1111-111111111111", email: "admin@example.test", role: "ADMIN" as const, active: true };
const now = new Date("2026-10-25T10:00:00Z");

describe("admin sessions", () => {
  it("stores only the hash of a high-entropy opaque token", async () => {
    const repository = new MemorySessionRepository([user]);
    const result = await createSession(user.id, {
      repository,
      now,
      generateToken: () => "opaque-session-token-with-32-bytes-minimum",
    });
    expect(result.token).toBe("opaque-session-token-with-32-bytes-minimum");
    expect(repository.sessions[0]?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(repository.sessions[0]?.tokenHash).not.toContain(result.token);
  });

  it("uses HTTP-only strict cookies with production-only Secure", () => {
    expect(getSessionCookieOptions(true)).toMatchObject({ httpOnly: true, sameSite: "strict", secure: true, path: "/" });
    expect(getSessionCookieOptions(false).secure).toBe(false);
  });

  it("authorizes an active session and extends only its idle expiry", async () => {
    const repository = new MemorySessionRepository([user]);
    const { token, expiresAt } = await createSession(user.id, { repository, now });
    const verified = await verifySessionToken(token, { repository, now: new Date("2026-10-25T10:20:00Z") });
    expect(verified?.user.email).toBe(user.email);
    expect(repository.sessions[0]?.expiresAt).toEqual(expiresAt);
    expect(repository.sessions[0]?.idleExpiresAt.toISOString()).toBe("2026-10-25T10:50:00.000Z");
  });

  it("rejects expired, idle-expired, revoked, and inactive sessions", async () => {
    const repository = new MemorySessionRepository([user]);
    const { token } = await createSession(user.id, { repository, now });
    expect(await verifySessionToken(token, { repository, now: new Date("2026-10-25T10:31:00Z") })).toBeNull();

    const active = await createSession(user.id, { repository, now });
    await revokeSession(active.token, { repository });
    expect(await verifySessionToken(active.token, { repository, now })).toBeNull();

    repository.users[0] = { ...repository.users[0]!, active: false };
    const inactive = await createSession(user.id, { repository, now });
    expect(await verifySessionToken(inactive.token, { repository, now })).toBeNull();
  });
});

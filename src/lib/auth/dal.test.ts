import { describe, expect, it } from "vitest";
import { AuthorizationError, requireAdmin, verifySession } from "./dal";
import { MemorySessionRepository, createSession } from "./session";

const user = { id: "11111111-1111-1111-1111-111111111111", email: "admin@example.test", role: "ADMIN" as const, active: true };

describe("authorization data-access layer", () => {
  it("returns the active administrator at the action boundary", async () => {
    const repository = new MemorySessionRepository([user]);
    const { token } = await createSession(user.id, { repository, now: new Date("2026-10-25T10:00:00Z") });
    const verified = await requireAdmin({ token, repository, now: new Date("2026-10-25T10:05:00Z") });
    expect(verified.user.id).toBe(user.id);
  });

  it("rejects a stale token even when a previous navigation could have been authorized", async () => {
    const repository = new MemorySessionRepository([user]);
    const { token } = await createSession(user.id, { repository, now: new Date("2026-10-25T10:00:00Z") });
    expect(await verifySession({ token, repository, now: new Date("2026-10-25T10:31:00Z") })).toBeNull();
    await expect(requireAdmin({ token, repository, now: new Date("2026-10-25T10:31:00Z") })).rejects.toBeInstanceOf(
      AuthorizationError,
    );
  });
});

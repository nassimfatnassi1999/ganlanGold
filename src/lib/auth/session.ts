import { createHash, randomBytes } from "node:crypto";
import type { AdminRole, PrismaClient } from "@prisma/client";

export const SESSION_COOKIE_NAME = "ganlan_admin_session";
const ABSOLUTE_SESSION_MS = 8 * 60 * 60_000;
const IDLE_SESSION_MS = 30 * 60_000;

export type SessionUser = Readonly<{ id: string; email: string; role: AdminRole; active: boolean }>;
export type StoredSession = {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  idleExpiresAt: Date;
  lastSeenAt: Date;
  revokedAt: Date | null;
};
export type VerifiedSession = Readonly<{ sessionId: string; user: SessionUser; expiresAt: Date }>;

export interface SessionRepository {
  create(record: Omit<StoredSession, "id">): Promise<StoredSession>;
  findByTokenHash(tokenHash: string): Promise<{ session: StoredSession; user: SessionUser } | null>;
  touch(id: string, lastSeenAt: Date, idleExpiresAt: Date): Promise<void>;
  revoke(tokenHash: string, revokedAt: Date): Promise<void>;
}

export class MemorySessionRepository implements SessionRepository {
  readonly sessions: StoredSession[] = [];

  constructor(readonly users: SessionUser[] = []) {}

  async create(record: Omit<StoredSession, "id">): Promise<StoredSession> {
    const session = { ...record, id: `session-${this.sessions.length + 1}` };
    this.sessions.push(session);
    return session;
  }

  async findByTokenHash(tokenHash: string): Promise<{ session: StoredSession; user: SessionUser } | null> {
    const session = this.sessions.find((entry) => entry.tokenHash === tokenHash);
    const user = session ? this.users.find((entry) => entry.id === session.userId) : undefined;
    return session && user ? { session, user } : null;
  }

  async touch(id: string, lastSeenAt: Date, idleExpiresAt: Date): Promise<void> {
    const session = this.sessions.find((entry) => entry.id === id);
    if (session) {
      session.lastSeenAt = lastSeenAt;
      session.idleExpiresAt = idleExpiresAt;
    }
  }

  async revoke(tokenHash: string, revokedAt: Date): Promise<void> {
    const session = this.sessions.find((entry) => entry.tokenHash === tokenHash);
    if (session) session.revokedAt = revokedAt;
  }
}

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(record: Omit<StoredSession, "id">): Promise<StoredSession> {
    return this.client.adminSession.create({ data: record });
  }

  async findByTokenHash(tokenHash: string): Promise<{ session: StoredSession; user: SessionUser } | null> {
    const row = await this.client.adminSession.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, role: true, active: true } } },
    });
    if (!row) return null;
    const { user, ...session } = row;
    return { session, user };
  }

  async touch(id: string, lastSeenAt: Date, idleExpiresAt: Date): Promise<void> {
    await this.client.adminSession.update({ where: { id }, data: { lastSeenAt, idleExpiresAt } });
  }

  async revoke(tokenHash: string, revokedAt: Date): Promise<void> {
    await this.client.adminSession.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt } });
  }
}

type SessionDependencies = Readonly<{
  repository?: SessionRepository;
  now?: Date;
  generateToken?: () => string;
}>;

async function defaultRepository(): Promise<SessionRepository> {
  const { prisma } = await import("@/lib/db/client");
  return new PrismaSessionRepository(prisma);
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, dependencies: SessionDependencies = {}) {
  const repository = dependencies.repository ?? (await defaultRepository());
  const now = dependencies.now ?? new Date();
  const token = (dependencies.generateToken ?? (() => randomBytes(32).toString("base64url")))();
  if (token.length < 32) throw new Error("Session token entropy is insufficient");
  const expiresAt = new Date(now.getTime() + ABSOLUTE_SESSION_MS);
  const idleExpiresAt = new Date(now.getTime() + IDLE_SESSION_MS);
  await repository.create({
    tokenHash: hashSessionToken(token),
    userId,
    expiresAt,
    idleExpiresAt,
    lastSeenAt: now,
    revokedAt: null,
  });
  return { token, expiresAt };
}

export async function verifySessionToken(token: string, dependencies: SessionDependencies = {}): Promise<VerifiedSession | null> {
  const repository = dependencies.repository ?? (await defaultRepository());
  const now = dependencies.now ?? new Date();
  if (!token || token.length < 32) return null;
  const found = await repository.findByTokenHash(hashSessionToken(token));
  if (!found || found.session.revokedAt || !found.user.active || found.user.role !== "ADMIN") return null;
  if (found.session.expiresAt <= now || found.session.idleExpiresAt <= now) return null;

  const idleExpiresAt = new Date(Math.min(found.session.expiresAt.getTime(), now.getTime() + IDLE_SESSION_MS));
  await repository.touch(found.session.id, now, idleExpiresAt);
  return { sessionId: found.session.id, user: found.user, expiresAt: found.session.expiresAt };
}

export async function revokeSession(token: string, dependencies: SessionDependencies = {}): Promise<void> {
  if (!token) return;
  const repository = dependencies.repository ?? (await defaultRepository());
  await repository.revoke(hashSessionToken(token), dependencies.now ?? new Date());
}

export function getSessionCookieOptions(production = process.env.NODE_ENV === "production") {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: production,
    path: "/",
    maxAge: ABSOLUTE_SESSION_MS / 1000,
  };
}

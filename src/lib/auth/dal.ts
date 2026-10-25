import type { SessionRepository, VerifiedSession } from "./session";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

export class AuthorizationError extends Error {
  readonly status = 401;

  constructor() {
    super("Administrator authentication is required");
    this.name = "AuthorizationError";
  }
}

type VerifyOptions = Readonly<{
  token?: string;
  repository?: SessionRepository;
  now?: Date;
}>;

async function resolveToken(token?: string): Promise<string | undefined> {
  if (token !== undefined) return token;
  const { cookies } = await import("next/headers");
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
}

export async function verifySession(options: VerifyOptions = {}): Promise<VerifiedSession | null> {
  const token = await resolveToken(options.token);
  if (!token) return null;
  return verifySessionToken(token, options);
}

export async function requireAdmin(options: VerifyOptions = {}): Promise<VerifiedSession> {
  const session = await verifySession(options);
  if (!session) throw new AuthorizationError();
  return session;
}

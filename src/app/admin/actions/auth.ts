"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticateAdmin } from "@/lib/auth/admin";
import {
  createSession,
  getSessionCookieOptions,
  revokeSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { getClientAddress } from "@/lib/security/client-ip";

export type LoginState = { error?: string };

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const requestHeaders = await headers();
  const request = new Request(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000", { headers: requestHeaders });

  let user;
  try {
    user = await authenticateAdmin(email, password, getClientAddress(request));
  } catch {
    return { error: "登录暂时不可用。 / Login is temporarily unavailable." };
  }
  if (!user) return { error: "邮箱或密码不正确。 / Invalid email or password." };

  const { token } = await createSession(user.id);
  (await cookies()).set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) await revokeSession(token);
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}

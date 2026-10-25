"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="admin-login-form">
      {state.error ? (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      ) : null}
      <label htmlFor="email">
        <span>管理员邮箱</span>
        <small>Administrator email</small>
      </label>
      <input id="email" name="email" type="email" autoComplete="username" required />
      <label htmlFor="password">
        <span>密码</span>
        <small>Password</small>
      </label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
      <button type="submit" disabled={pending}>
        {pending ? "正在登录… / Signing in…" : "登录 / Sign in"}
      </button>
    </form>
  );
}

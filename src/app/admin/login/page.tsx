import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "管理员登录 | GANLAN GOLD",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await verifySession()) redirect("/admin");

  return (
    <main id="main-content" className="admin-login-shell">
      <section className="admin-login-card" aria-labelledby="login-title">
        <Link href="/" className="admin-wordmark">
          GANLAN GOLD
        </Link>
        <p className="eyebrow">受保护的管理后台</p>
        <h1 id="login-title">管理员登录</h1>
        <p className="english-subtitle">Secure administration</p>
        <LoginForm />
        <p className="admin-login-note">
          管理员账户只能通过服务器初始化命令创建。<br />
          <span>Administrator accounts are created only through the server setup command.</span>
        </p>
      </section>
    </main>
  );
}

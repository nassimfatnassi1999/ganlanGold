import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, Boxes, CalendarDays, Coins, FileText, LogOut, Settings } from "lucide-react";

const navItems = [
  ["/admin", "概览", "Overview", BarChart3],
  ["/admin/products", "产品", "Products", Boxes],
  ["/admin/quotes", "询价", "Quotes", FileText],
  ["/admin/visits", "考察", "Visits", CalendarDays],
  ["/admin/rates", "汇率", "Rates", Coins],
  ["/admin/settings", "设置", "Settings", Settings],
] as const;

export function AdminShell({
  email,
  logoutAction,
  children,
}: {
  email: string;
  logoutAction: () => void | Promise<void>;
  children: ReactNode;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin"><span>GANLAN GOLD</span><small>Administration</small></Link>
        <nav aria-label="后台导航">
          {navItems.map(([href, chinese, english, Icon]) => (
            <Link href={href} key={href}><Icon size={18} aria-hidden="true" /><span>{chinese}<small lang="en">{english}</small></span></Link>
          ))}
        </nav>
        <div className="admin-operator">
          <span>已登录 / Signed in</span>
          <strong>{email}</strong>
          <form action={logoutAction}><button type="submit"><LogOut size={16} aria-hidden="true" />退出 / Sign out</button></form>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-mobile-header"><span>GANLAN GOLD</span><small>{email}</small></header>
        <main id="main-content" className="admin-main">{children}</main>
      </div>
    </div>
  );
}

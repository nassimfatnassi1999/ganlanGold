import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { logoutAction } from "@/app/admin/actions/auth";
import { verifySession } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await verifySession();
  if (!session) redirect("/admin/login");
  return <AdminShell email={session.user.email} logoutAction={logoutAction}>{children}</AdminShell>;
}

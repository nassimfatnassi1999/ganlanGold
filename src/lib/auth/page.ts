import { redirect } from "next/navigation";
import { verifySession } from "./dal";

export async function requireAdminPage() {
  const session = await verifySession();
  if (!session) redirect("/admin/login");
  return session;
}

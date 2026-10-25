"use client";

import { useFormStatus } from "react-dom";

export function AdminSubmitButton({ children = "保存 / Save" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button className="admin-submit" type="submit" disabled={pending}>{pending ? "正在保存… / Saving…" : children}</button>;
}

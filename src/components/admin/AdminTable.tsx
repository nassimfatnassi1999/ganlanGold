import type { ReactNode } from "react";

export function AdminTable({ headings, children, empty }: { headings: string[]; children: ReactNode; empty?: boolean }) {
  if (empty) return <div className="admin-empty">暂无记录 / No records yet</div>;
  return (
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
  );
}

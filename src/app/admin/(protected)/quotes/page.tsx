import Link from "next/link";
import { Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listQuotes, quoteStatuses } from "@/lib/admin/quotes";
import { formatAdminDate } from "@/lib/admin/presentation";
import { requireAdminPage } from "@/lib/auth/page";

export default async function AdminQuotesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireAdminPage();
  const query = await searchParams;
  const status = quoteStatuses.find((entry) => entry === query.status);
  const quotes = await listQuotes({ status, query: query.q });
  return (
    <>
      <AdminPageHeader eyebrow="销售线索 / Sales leads" title="商业询价" description="筛选、审阅并跟进所有询价。" actions={<Link prefetch={false} className="admin-secondary-button" href="/admin/quotes/export"><Download size={16} />安全导出 CSV</Link>} />
      <form className="admin-filter" method="get"><input name="q" defaultValue={query.q} placeholder="编号、公司或国家" aria-label="搜索询价" /><select name="status" defaultValue={status ?? ""} aria-label="询价状态"><option value="">全部状态</option>{quoteStatuses.map((entry) => <option value={entry} key={entry}>{entry}</option>)}</select><button type="submit">筛选</button></form>
      <section className="admin-panel admin-panel--standalone">
        <AdminTable headings={["编号", "公司 / 国家", "联系人", "总升数", "状态", "提交时间"]} empty={!quotes.length}>
          {quotes.map((quote) => <tr key={quote.id}><td><Link href={`/admin/quotes/${quote.requestId}`}>{quote.requestId}</Link></td><td><strong>{quote.company}</strong><small>{quote.country}</small></td><td>{quote.contactPerson}<small>{quote.email ?? quote.wechat ?? "—"}</small></td><td>{quote.totalLitres.toFixed(3)}{quote.belowMinimum ? <small className="admin-warning">低于商业政策</small> : null}</td><td><StatusBadge status={quote.status} /></td><td>{formatAdminDate(quote.submittedAt)}</td></tr>)}
        </AdminTable>
      </section>
    </>
  );
}

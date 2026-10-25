import Link from "next/link";
import { ArrowUpRight, CalendarDays, CircleDollarSign, FileText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getDashboardData } from "@/lib/admin/dashboard";
import { decimalText, formatAdminDate } from "@/lib/admin/presentation";
import { requireAdminPage } from "@/lib/auth/page";

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const data = await getDashboardData();
  return (
    <>
      <AdminPageHeader eyebrow="运营中心 / Operations" title="管理概览" description="询价、考察与参考汇率的当前状态。" />
      <section className="admin-metrics" aria-label="关键指标">
        <article><FileText aria-hidden="true" /><span>询价总数</span><strong>{data.quoteCount}</strong><small>{data.newQuoteCount} 个新请求</small></article>
        <article><CalendarDays aria-hidden="true" /><span>考察申请</span><strong>{data.visitCount}</strong><small>{data.newVisitCount} 个新请求</small></article>
        <article><CircleDollarSign aria-hidden="true" /><span>当前 USD/CNY</span><strong>{decimalText(data.currentRate?.usdCny, 4)}</strong><small>{data.currentRate?.referenceDate?.toISOString().slice(0, 10) ?? "暂无有效汇率"}</small></article>
      </section>
      <div className="admin-dashboard-grid">
        <section className="admin-panel"><header><div><h2>最近询价</h2><p>Recent quote requests</p></div><Link href="/admin/quotes">查看全部 <ArrowUpRight size={16} /></Link></header>
          <AdminTable headings={["编号", "公司", "总升数", "状态", "提交时间"]} empty={!data.recentQuotes.length}>
            {data.recentQuotes.map((quote) => <tr key={quote.id}><td><Link href={`/admin/quotes/${quote.requestId}`}>{quote.requestId}</Link></td><td>{quote.company}</td><td>{quote.totalLitres.toFixed(3)}</td><td><StatusBadge status={quote.status} /></td><td>{formatAdminDate(quote.submittedAt)}</td></tr>)}
          </AdminTable>
        </section>
        <section className="admin-panel"><header><div><h2>最近考察申请</h2><p>Recent visit requests</p></div><Link href="/admin/visits">查看全部 <ArrowUpRight size={16} /></Link></header>
          <AdminTable headings={["编号", "公司", "期望时间", "状态", "提交时间"]} empty={!data.recentVisits.length}>
            {data.recentVisits.map((visit) => <tr key={visit.id}><td>{visit.requestId}</td><td>{visit.company}</td><td>{visit.preferredPeriod}</td><td><StatusBadge status={visit.status} /></td><td>{formatAdminDate(visit.submittedAt)}</td></tr>)}
          </AdminTable>
        </section>
      </div>
    </>
  );
}

import { RefreshCw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { AdminTable } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { refreshRateAction } from "@/app/admin/actions/management";
import { listExchangeRateHistory } from "@/lib/admin/rates";
import { formatAdminDate } from "@/lib/admin/presentation";
import { requireAdminPage } from "@/lib/auth/page";

export default async function AdminRatesPage({ searchParams }: { searchParams: Promise<{ refreshed?: string }> }) {
  await requireAdminPage();
  const [history, query] = await Promise.all([listExchangeRateHistory(), searchParams]);
  const current = history.find((item) => item.status === "VALID");
  return (
    <>
      <AdminPageHeader eyebrow="欧洲中央银行 / ECB" title="参考汇率" description="查看每日抓取、最后有效汇率和失败记录。" actions={<form action={refreshRateAction}><AdminSubmitButton><RefreshCw size={16} />立即刷新</AdminSubmitButton></form>} />
      {query.refreshed ? <p className="admin-toast" role="status">刷新完成 / Refresh completed</p> : null}
      <section className="admin-rate-current">
        <article><span>USD/CNY</span><strong>{current?.usdCny?.toFixed(8) ?? "—"}</strong><small>公开人民币价格使用此计算率</small></article>
        <article><span>参考日期</span><strong>{current?.referenceDate?.toISOString().slice(0, 10) ?? "—"}</strong><small>ECB reference date</small></article>
        <article><span>最近尝试</span><strong>{history[0] ? <StatusBadge status={history[0].status} /> : "—"}</strong><small>{history[0] ? formatAdminDate(history[0].attemptedAt) : "暂无记录"}</small></article>
      </section>
      <section className="admin-panel admin-panel--standalone"><header><div><h2>刷新历史</h2><p>Exchange-rate attempts</p></div></header>
        <AdminTable headings={["状态", "参考日期", "EUR/USD", "EUR/CNY", "USD/CNY", "尝试时间", "错误"]} empty={!history.length}>
          {history.map((rate) => <tr key={rate.id}><td><StatusBadge status={rate.status} /></td><td>{rate.referenceDate?.toISOString().slice(0, 10) ?? "—"}</td><td>{rate.eurUsd?.toFixed(4) ?? "—"}</td><td>{rate.eurCny?.toFixed(4) ?? "—"}</td><td>{rate.usdCny?.toFixed(8) ?? "—"}</td><td>{formatAdminDate(rate.attemptedAt)}</td><td>{rate.errorCode ?? "—"}</td></tr>)}
        </AdminTable>
      </section>
    </>
  );
}

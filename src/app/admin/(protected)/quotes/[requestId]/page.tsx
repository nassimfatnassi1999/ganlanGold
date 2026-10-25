import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { updateQuoteAction } from "@/app/admin/actions/management";
import { getQuote, quoteStatuses } from "@/lib/admin/quotes";
import { formatAdminDate } from "@/lib/admin/presentation";
import { requireAdminPage } from "@/lib/auth/page";

export default async function AdminQuoteDetailPage({ params, searchParams }: { params: Promise<{ requestId: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdminPage();
  const [{ requestId }, query] = await Promise.all([params, searchParams]);
  const quote = await getQuote(requestId);
  if (!quote) notFound();
  return (
    <>
      <AdminPageHeader eyebrow="询价详情 / Quote detail" title={quote.requestId} description={`${quote.company} · ${formatAdminDate(quote.submittedAt)}`} />
      {query.saved ? <p className="admin-toast" role="status">已保存 / Changes saved</p> : null}
      <div className="admin-detail-grid">
        <section className="admin-panel admin-detail"><header><div><h2>买家与运输信息</h2><p>Buyer and destination</p></div><StatusBadge status={quote.status} /></header>
          <dl><div><dt>公司</dt><dd>{quote.company}</dd></div><div><dt>国家或地区</dt><dd>{quote.country}</dd></div><div><dt>联系人</dt><dd>{quote.contactPerson}</dd></div><div><dt>电子邮箱</dt><dd>{quote.email ?? "—"}</dd></div><div><dt>微信</dt><dd>{quote.wechat ?? "—"}</dd></div><div><dt>目的港</dt><dd>{quote.destinationPort}</dd></div><div><dt>总容量</dt><dd>{quote.totalLitres.toFixed(3)} L {quote.belowMinimum ? <span className="admin-warning">低于商业政策</span> : null}</dd></div><div><dt>通知状态</dt><dd><StatusBadge status={quote.notificationStatus} /></dd></div></dl>
          <div className="admin-message"><strong>买家留言</strong><p>{quote.message ?? "无补充说明"}</p></div>
        </section>
        <section className="admin-panel"><header><div><h2>意向产品</h2><p>Requested products</p></div></header>
          <ul className="admin-item-list">{quote.items.map((item) => <li key={item.id}><span>{item.product.id === "5l" ? "5 L" : item.product.id.replace("ml", " ml")}</span><strong>{item.quantity.toLocaleString("zh-CN")} 包</strong><small>{item.requestedVolumeLitres.toFixed(3)} L · USD ${item.usdReferencePrice.toFixed(2)} 参考</small></li>)}</ul>
        </section>
      </div>
      <section className="admin-panel admin-panel--standalone admin-update-panel"><header><div><h2>跟进状态与内部备注</h2><p>Status and internal notes</p></div></header>
        <form action={updateQuoteAction} className="admin-inline-form"><input type="hidden" name="requestId" value={quote.requestId} /><label>状态 / Status<select name="status" defaultValue={quote.status}>{quoteStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label>内部备注 / Internal notes<textarea name="internalNotes" rows={5} maxLength={4000} defaultValue={quote.internalNotes ?? ""} /></label><AdminSubmitButton /></form>
      </section>
    </>
  );
}

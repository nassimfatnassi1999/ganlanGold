import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { updateVisitAction } from "@/app/admin/actions/management";
import { listVisits, visitStatuses } from "@/lib/admin/visits";
import { formatAdminDate } from "@/lib/admin/presentation";
import { requireAdminPage } from "@/lib/auth/page";

export default async function AdminVisitsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; saved?: string }> }) {
  await requireAdminPage();
  const query = await searchParams;
  const status = visitStatuses.find((entry) => entry === query.status);
  const visits = await listVisits({ status, query: query.q });
  return (
    <>
      <AdminPageHeader eyebrow="产地接待 / Origin visits" title="考察申请" description="跟踪访客需求、时间偏好和后续安排。" />
      {query.saved ? <p className="admin-toast" role="status">已保存 / Changes saved</p> : null}
      <form className="admin-filter" method="get"><input name="q" defaultValue={query.q} placeholder="编号、公司或国家" aria-label="搜索考察申请" /><select name="status" defaultValue={status ?? ""} aria-label="考察状态"><option value="">全部状态</option>{visitStatuses.map((entry) => <option value={entry} key={entry}>{entry}</option>)}</select><button type="submit">筛选</button></form>
      <div className="admin-lead-cards">
        {visits.length ? visits.map((visit) => <article className="admin-panel admin-visit-card" key={visit.id}><header><div><h2>{visit.company}</h2><p>{visit.requestId} · {formatAdminDate(visit.submittedAt)}</p></div><StatusBadge status={visit.status} /></header><dl><div><dt>联系人</dt><dd>{visit.contactPerson}</dd></div><div><dt>国家或地区</dt><dd>{visit.country}</dd></div><div><dt>联系方式</dt><dd>{visit.contact}</dd></div><div><dt>期望时间</dt><dd>{visit.preferredPeriod}</dd></div><div><dt>人数</dt><dd>{visit.visitors ?? "—"}</dd></div><div><dt>留言</dt><dd>{visit.message ?? "—"}</dd></div></dl><form action={updateVisitAction} className="admin-inline-form"><input type="hidden" name="requestId" value={visit.requestId} /><label>状态 / Status<select name="status" defaultValue={visit.status}>{visitStatuses.map((entry) => <option key={entry}>{entry}</option>)}</select></label><label>内部备注 / Internal notes<textarea name="internalNotes" rows={3} maxLength={4000} defaultValue={visit.internalNotes ?? ""} /></label><AdminSubmitButton /></form></article>) : <div className="admin-empty">暂无考察申请 / No visit requests</div>}
      </div>
    </>
  );
}

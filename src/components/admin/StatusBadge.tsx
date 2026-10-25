const labels: Record<string, string> = {
  NEW: "新请求",
  CONTACTED: "已联系",
  IN_NEGOTIATION: "洽谈中",
  QUOTED: "已报价",
  SCHEDULED: "已安排",
  COMPLETED: "已完成",
  CLOSED: "已关闭",
  DECLINED: "未接受",
  VALID: "有效",
  FAILED: "失败",
  SENT: "已发送",
  PENDING: "待发送",
  NOT_CONFIGURED: "未配置",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className="status-badge" data-status={status}>{labels[status] ?? status}</span>;
}

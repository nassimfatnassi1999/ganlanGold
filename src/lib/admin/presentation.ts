export function formatAdminDate(value: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Tunis",
  }).format(value);
}

export function decimalText(value: { toFixed(digits: number): string } | null | undefined, digits = 3): string {
  return value ? value.toFixed(digits) : "—";
}

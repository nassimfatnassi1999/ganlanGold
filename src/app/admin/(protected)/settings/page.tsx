import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { updateSettingAction } from "@/app/admin/actions/management";
import { editableSettingKeys, listEditableSettings } from "@/lib/admin/settings";
import { requireAdminPage } from "@/lib/auth/page";

const labels: Record<(typeof editableSettingKeys)[number], string> = {
  "meta.description.zh-CN": "中文 Meta 描述",
  "meta.description.en": "English meta description",
  "contact.gisele.phone": "Gisèle 电话",
  "contact.lassad.whatsapp": "Lassad WhatsApp",
  "contact.fouad.whatsapp": "Fouad WhatsApp",
};

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdminPage();
  const [settings, query] = await Promise.all([listEditableSettings(), searchParams]);
  const byKey = new Map(settings.map((setting) => [setting.key, typeof setting.value === "string" ? setting.value : ""]));
  return (
    <>
      <AdminPageHeader eyebrow="受控内容 / Controlled content" title="网站设置" description="仅允许维护已批准的元描述和联系渠道。商业政策及汇率不可在此覆盖。" />
      {query.saved ? <p className="admin-toast" role="status">已保存 {query.saved} / Changes saved</p> : null}
      <section className="admin-settings-list">
        {editableSettingKeys.map((key) => <form action={updateSettingAction} className="admin-panel admin-setting-row" key={key}><input type="hidden" name="key" value={key} /><label><strong>{labels[key]}</strong><small>{key}</small><textarea name="value" rows={key.startsWith("meta.") ? 4 : 2} maxLength={2000} defaultValue={byKey.get(key) ?? ""} required /></label><AdminSubmitButton /></form>)}
      </section>
      <aside className="admin-policy-lock"><strong>受保护规则 / Protected rules</strong><p>全局订购政策、产品容量、产品标识、汇率公式与 Gisèle 微信身份均不在普通设置中开放。</p></aside>
    </>
  );
}

import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { TranslatedText } from "@/i18n/TranslatedText";
import { legalNoticeSections } from "@/i18n/legal";

export const metadata: Metadata = { title: "法律声明 | GANLAN GOLD", robots: { index: false, follow: true } };

export default function LegalNoticePage() {
  return (
    <LegalPage title="法律声明与公司信息" english="Legal Notice / Company Information">
      {legalNoticeSections.map((section) => <section key={section.zhTitle}><h2><TranslatedText zh={section.zhTitle} en={section.enTitle} /></h2><p><TranslatedText zh={section.zhBody} en={section.enBody} /></p></section>)}
    </LegalPage>
  );
}

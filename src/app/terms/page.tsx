import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { TranslatedText } from "@/i18n/TranslatedText";
import { termsSections } from "@/i18n/legal";

export const metadata: Metadata = { title: "商业信息 | GANLAN GOLD", robots: { index: false, follow: true } };

export default function TermsPage() {
  return (
    <LegalPage title="商业信息" english="Commercial Information">
      {termsSections.map((section) => <section key={section.zhTitle}><h2><TranslatedText zh={section.zhTitle} en={section.enTitle} /></h2><p><TranslatedText zh={section.zhBody} en={section.enBody} /></p></section>)}
    </LegalPage>
  );
}

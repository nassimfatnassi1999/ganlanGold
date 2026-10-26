import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { TranslatedText } from "@/i18n/TranslatedText";
import { privacySections } from "@/i18n/legal";

export const metadata: Metadata = { title: "隐私政策 | GANLAN GOLD", robots: { index: false, follow: true } };

export default function PrivacyPage() {
  return (
    <LegalPage title="隐私政策" english="Privacy Policy">
      {privacySections.map((section) => <section key={section.zhTitle}><h2><TranslatedText zh={section.zhTitle} en={section.enTitle} /></h2><p><TranslatedText zh={section.zhBody} en={section.enBody} /></p></section>)}
    </LegalPage>
  );
}

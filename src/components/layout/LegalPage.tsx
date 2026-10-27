import type { ReactNode } from "react";
import Link from "next/link";
import { TranslatedText } from "@/i18n/TranslatedText";
import { CONTACT_EMAIL } from "@/config/env";

export function LegalPage({ title, english, children }: { title: string; english: string; children: ReactNode }) {
  return (
    <main id="main-content" className="legal-shell">
      <div className="legal-inner">
        <Link className="legal-back" href="/"><TranslatedText zh="← 返回 GANLAN GOLD" en="← Back to GANLAN GOLD" /></Link>
        <h1><TranslatedText zh={title} en={english} /></h1>
        <div className="legal-notice">
          <strong><TranslatedText zh="上线前审核提示" en="Pre-launch review notice" /></strong>
          <p><TranslatedText zh="本页为运营草案。尚未提供的法定公司资料不会被推定或虚构，必须在公开上线前由企业和法律顾问确认。" en="This page is an operational draft. Missing legal company information is neither assumed nor fabricated and must be confirmed by the company and its legal adviser before public launch." /></p>
        </div>
        <div className="legal-content">{children}</div>
        <p className="legal-email">
          <TranslatedText zh="联系邮箱：" en="Contact email: " />
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </main>
  );
}

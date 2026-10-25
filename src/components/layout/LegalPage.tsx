import type { ReactNode } from "react";
import Link from "next/link";

export function LegalPage({ title, english, children }: { title: string; english: string; children: ReactNode }) {
  return (
    <main id="main-content" className="legal-shell">
      <div className="legal-inner">
        <Link className="legal-back" href="/">← 返回 GANLAN GOLD / Back</Link>
        <h1>{title}</h1>
        <p className="legal-subtitle" lang="en">{english}</p>
        <div className="legal-notice">
          <strong>上线前审核提示 / Pre-launch review notice</strong>
          <p>本页为运营草案。尚未提供的法定公司资料不会被推定或虚构，必须在公开上线前由企业和法律顾问确认。</p>
        </div>
        <div className="legal-content">{children}</div>
      </div>
    </main>
  );
}

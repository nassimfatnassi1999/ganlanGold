import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";
import { TranslatedText } from "@/i18n/TranslatedText";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <a className="brand-lockup brand-lockup--footer" href="#top">
            <span>GANLAN GOLD</span>
            <small>Moroccan Olive Oil</small>
          </a>
          <p><TranslatedText zh={zh.footer.description} en={en.footer.description} /></p>
        </div>
        <nav aria-label="法律与管理链接">
          <a href="/privacy"><TranslatedText zh={zh.footer.privacy} en={en.footer.privacy} /></a>
          <a href="/legal"><TranslatedText zh={zh.footer.legal} en={en.footer.legal} /></a>
          <a href="/terms"><TranslatedText zh={zh.footer.terms} en={en.footer.terms} /></a>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} GANLAN GOLD</p>
        <p><TranslatedText zh={zh.footer.notice} en={en.footer.notice} /></p>
      </div>
    </footer>
  );
}

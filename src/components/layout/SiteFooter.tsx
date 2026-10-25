import zh from "@/i18n/zh-CN.json";
import en from "@/i18n/en.json";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <a className="brand-lockup brand-lockup--footer" href="#top">
            <span>GANLAN GOLD</span>
            <small>Moroccan Olive Oil</small>
          </a>
          <p>{zh.footer.description}</p>
          <p className="footer-english" lang="en">{en.footer.description}</p>
        </div>
        <nav aria-label="法律与管理链接">
          <a href="/privacy">{zh.footer.privacy}<small lang="en">{en.footer.privacy}</small></a>
          <a href="/legal">{zh.footer.legal}<small lang="en">{en.footer.legal}</small></a>
          <a href="/terms">{zh.footer.terms}<small lang="en">{en.footer.terms}</small></a>
          <a href="/admin">{zh.footer.admin}<small lang="en">{en.footer.admin}</small></a>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} GANLAN GOLD</p>
        <p>{zh.footer.notice}</p>
      </div>
    </footer>
  );
}

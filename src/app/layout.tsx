import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import zh from "@/i18n/zh-CN.json";
import { buildSiteJsonLd, serializeJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: zh.meta.title,
  description: zh.meta.description,
  applicationName: "GANLAN GOLD",
  alternates: { canonical: "/", languages: { "zh-CN": "/" } },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "GANLAN GOLD",
    title: zh.meta.title,
    description: zh.meta.description,
    url: "/",
    images: [{ url: "/images/hero/products-desktop.webp", alt: "GANLAN GOLD 摩洛哥橄榄油产品系列" }],
  },
  twitter: {
    card: "summary_large_image",
    title: zh.meta.title,
    description: zh.meta.description,
    images: ["/images/hero/products-desktop.webp"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#173E2B",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const jsonLd = serializeJsonLd(buildSiteJsonLd(siteUrl));
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        <a className="skip-link" href="#main-content">
          跳至主要内容 / Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

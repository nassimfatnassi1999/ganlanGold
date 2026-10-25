import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import zh from "@/i18n/zh-CN.json";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: zh.meta.title,
  description: zh.meta.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#173E2B",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">
          跳至主要内容 / Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

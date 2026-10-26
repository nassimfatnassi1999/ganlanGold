import type { ReactNode } from "react";

export function TranslatedText({ zh, en }: Readonly<{ zh: ReactNode; en: ReactNode }>) {
  return (
    <>
      <span className="language-content language-content--zh" lang="zh-CN">{zh}</span>
      <span className="language-content language-content--en" lang="en">{en}</span>
    </>
  );
}


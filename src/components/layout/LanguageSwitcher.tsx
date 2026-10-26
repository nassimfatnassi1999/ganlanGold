"use client";

import { useLanguage, type Language } from "@/i18n/LanguageProvider";

const options: readonly Readonly<{ value: Language; label: string; accessibleLabel: string }>[] = [
  { value: "zh-CN", label: "中文", accessibleLabel: "中文" },
  { value: "en", label: "EN", accessibleLabel: "English" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher" role="group" aria-label="语言 / Language">
      {options.map((option, index) => (
        <span className="language-switcher__option" key={option.value}>
          {index > 0 ? <span className="language-switcher__divider" aria-hidden="true">|</span> : null}
          <button
            type="button"
            aria-label={option.accessibleLabel}
            aria-pressed={language === option.value}
            onClick={() => setLanguage(option.value)}
          >
            {option.label}
          </button>
        </span>
      ))}
    </div>
  );
}


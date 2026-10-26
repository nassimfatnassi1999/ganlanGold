"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

export type Language = "zh-CN" | "en";

export const LANGUAGE_STORAGE_KEY = "ganlan-language";
export const DEFAULT_LANGUAGE: Language = "zh-CN";

type LanguageContextValue = Readonly<{
  language: Language;
  setLanguage: (language: Language) => void;
}>;

const LanguageContext = createContext<LanguageContextValue | null>(null);

const LANGUAGE_CHANGE_EVENT = "ganlan-language-change";

function clientLanguage(): Language {
  const value = document.documentElement.dataset.language ?? window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return value === "en" || value === "zh-CN" ? value : DEFAULT_LANGUAGE;
}

function applyLanguage(language: Language) {
  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
}

function subscribeLanguage(onStoreChange: () => void) {
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function LanguageProvider({ children }: Readonly<{ children: ReactNode }>) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    clientLanguage,
    () => DEFAULT_LANGUAGE,
  );

  const setLanguage = useCallback((nextLanguage: Language) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    applyLanguage(nextLanguage);
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}


import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./en.json";
import ur from "./ur.json";

export type Language = "en" | "ur";

const STORAGE_KEY = "truthlens.language";
const catalogs: Record<Language, unknown> = { en, ur };

function detectDeviceLanguage(): Language {
  const code = Localization.getLocales()[0]?.languageCode;
  return code === "ur" ? "ur" : "en";
}

// Dot-path lookup into the JSON catalog, e.g. "guide.steps.0.title".
// Numeric segments index into arrays the same way string keys index objects.
function resolve(source: unknown, path: string): string | undefined {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
      source
    );
  return typeof value === "string" ? value : undefined;
}

type LanguageContextValue = {
  language: Language;
  /** True once AsyncStorage has been checked for a saved override. Screens
   *  that render translated body copy can gate on this to avoid a one-frame
   *  flash of the device-default language before the saved choice loads. */
  ready: boolean;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectDeviceLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "en" || stored === "ur") setLanguageState(stored);
      })
      .finally(() => setReady(true));
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    const raw = resolve(catalogs[language], key) ?? resolve(catalogs.en, key) ?? key;
    if (!vars) return raw;
    return Object.entries(vars).reduce(
      (acc, [name, value]) => acc.replaceAll(`{{${name}}}`, String(value)),
      raw
    );
  }

  return (
    <LanguageContext.Provider
      value={{ language, ready, setLanguage, t, isRTL: language === "ur" }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

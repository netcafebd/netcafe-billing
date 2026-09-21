"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "bn" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (obj: any) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "bn",
  setLanguage: () => {},
  t: (obj: any) => "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("bn");

  useEffect(() => {
    const saved = localStorage.getItem("netcafe_lang");
    if (saved === "en" || saved === "bn") {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("netcafe_lang", lang);
  };

  const t = (obj: any): string => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[language] || obj["bn"] || obj["en"] || "";
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

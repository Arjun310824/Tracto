import { createContext, useState, useContext, useEffect } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem("tracto_lang") || "gu"; // Default to Gujarati!
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem("tracto_lang", newLang);
  };

  const toggleLanguage = () => {
    const nextLang = lang === "gu" ? "en" : "gu";
    setLang(nextLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

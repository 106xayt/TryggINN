/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
type Language = "nb" | "en";

interface ThemeLanguageContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextValue | undefined>(
  undefined
);

/* ---------- Initial helpers (ingen setState i useEffect) ---------- */

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem("trygginn-theme");
  if (stored === "light" || stored === "dark") {
    return stored as Theme;
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "nb";

  const stored = window.localStorage.getItem("trygginn-language");
  if (stored === "nb" || stored === "en") {
    return stored as Language;
  }

  return "nb";
}

/* ---------- Custom hook ---------- */

export function useThemeLanguage(): ThemeLanguageContextValue {
  const ctx = useContext(ThemeLanguageContext);
  if (!ctx) {
    throw new Error(
      "useThemeLanguage må brukes inne i <ThemeLanguageProvider>."
    );
  }
  return ctx;
}

/* ---------- Provider ---------- */

interface ProviderProps {
  children: ReactNode;
}

export function ThemeLanguageProvider({ children }: ProviderProps) {
  // Initialverdi tas fra helpers – ingen setTheme i useEffect
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  // Lagre valgt tema i localStorage når det endres
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("trygginn-theme", theme);
  }, [theme]);

  // Lagre valgt språk i localStorage når det endres
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("trygginn-language", language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value: ThemeLanguageContextValue = {
    theme,
    setTheme,
    toggleTheme,
    language,
    setLanguage,
  };

  return (
    <ThemeLanguageContext.Provider value={value}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

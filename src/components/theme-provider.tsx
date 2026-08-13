"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
  systemTheme: "dark" | "light";
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  resolvedTheme: "dark",
  systemTheme: "dark",
  themes: ["dark", "light", "system"],
});

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "theme",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  // Helper to apply theme to documentElement
  const applyTheme = (currentTheme: Theme) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const isDark =
      currentTheme === "dark" ||
      (currentTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (disableTransitionOnChange) {
      const css = document.createElement("style");
      css.appendChild(
        document.createTextNode(
          `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
        )
      );
      document.head.appendChild(css);

      root.classList.remove("light", "dark");
      root.classList.add(isDark ? "dark" : "light");

      window.getComputedStyle(css).opacity;
      document.head.removeChild(css);
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(isDark ? "dark" : "light");
    }
  };

  useEffect(() => {
    // Initial mount: load saved theme from localStorage
    const savedTheme = (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    setThemeState(savedTheme);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const currentSysTheme = mql.matches ? "dark" : "light";
    setSystemTheme(currentSysTheme);

    applyTheme(savedTheme);
    setMounted(true);

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      const newSysTheme = e.matches ? "dark" : "light";
      setSystemTheme(newSysTheme);
      const currentStored = (localStorage.getItem(storageKey) as Theme) || defaultTheme;
      if (currentStored === "system") {
        applyTheme("system");
      }
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [defaultTheme, storageKey]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
      // Ignore storage errors
    }
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const resolvedTheme: "dark" | "light" =
    theme === "system" ? systemTheme : theme === "light" ? "light" : "dark";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        systemTheme,
        themes: ["dark", "light", "system"],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

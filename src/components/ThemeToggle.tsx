"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 border border-card/40 rounded-full bg-card" />;
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2.5 border border-card bg-card text-subtext hover:text-text rounded-full transition-all duration-300 flex justify-center items-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
      aria-label="Toggle light or dark theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400 animate-in spin-in-180 duration-500" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-600 animate-in spin-in-180 duration-500" />
      )}
    </button>
  );
}

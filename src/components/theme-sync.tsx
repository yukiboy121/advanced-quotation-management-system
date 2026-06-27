"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/use-ui-store";

export function ThemeSync() {
  const darkMode = useUiStore((s) => s.darkMode);
  const setDarkMode = useUiStore((s) => s.setDarkMode);

  useEffect(() => {
    const fromStorage = localStorage.getItem("aq_dark_mode");
    if (fromStorage) {
      setDarkMode(fromStorage === "1");
    }
  }, [setDarkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("aq_dark_mode", darkMode ? "1" : "0");
  }, [darkMode]);

  return null;
}

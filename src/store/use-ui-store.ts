"use client";

import { create } from "zustand";

type UiState = {
  darkMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setDarkMode: (value: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  darkMode: false,
  sidebarOpen: true,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setDarkMode: (value) => set({ darkMode: value }),
}));

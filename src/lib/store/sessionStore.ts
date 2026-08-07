// ============================================================
// Session Store — Ephemeral / Transient State
// ============================================================

import { create } from 'zustand';

export interface SessionState {
  currentUserInput: string;
  setCurrentUserInput: (input: string) => void;
  clearInput: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentUserInput: '',

  setCurrentUserInput: (input) => set({ currentUserInput: input }),

  clearInput: () => set({ currentUserInput: '' }),
}));

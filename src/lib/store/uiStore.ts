// ============================================================
// UI Store — Visual / Overlay State
// ============================================================

import { create } from 'zustand';

export interface UIState {
  // --- AI Tutor ---
  isAIOpen: boolean;
  aiMessages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  autoTriggered: boolean;

  // --- Loading ---
  isLoading: boolean;
  loadingMessage: string;

  // --- Actions ---
  toggleAI: () => void;
  setAIOpen: (open: boolean) => void;
  addAIMessage: (role: 'user' | 'assistant' | 'system', content: string) => void;
  clearAIMessages: () => void;
  setAutoTriggered: (triggered: boolean) => void;
  setLoading: (loading: boolean, message?: string) => void;
  // --- Right Panel ---
  isRightPanelOpen: boolean;
  toggleRightPanel: () => void;
  setRightPanelOpen: (open: boolean) => void;
}

const DEFAULT_AI_MESSAGE = {
  role: 'assistant' as const,
  content: "I'm your AI Learning Assistant. I adapt to your progress and can help with any concept in this course. Ask me anything!",
};

export const useUIStore = create<UIState>((set) => ({
  isAIOpen: false,
  isRightPanelOpen: true,
  aiMessages: [DEFAULT_AI_MESSAGE],
  autoTriggered: false,
  isLoading: false,
  loadingMessage: '',

  toggleAI: () => set((state) => ({ isAIOpen: !state.isAIOpen })),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
  setRightPanelOpen: (open) => set({ isRightPanelOpen: open }),
  setAIOpen: (open) => set({ isAIOpen: open }),

  addAIMessage: (role, content) => set((state) => ({
    aiMessages: [...state.aiMessages, { role, content }],
  })),

  clearAIMessages: () => set({ aiMessages: [DEFAULT_AI_MESSAGE] }),

  setAutoTriggered: (triggered) => set({ autoTriggered: triggered }),
  setLoading: (loading, message) => set({ isLoading: loading, loadingMessage: message || '' }),
}));

import { create } from 'zustand';

export interface Subtitle {
  text: string;
  start: number;
  end: number;
}

interface AudioState {
  isAudioMode: boolean;
  setIsAudioMode: (val: boolean) => void;
  showTranscript: boolean;
  setShowTranscript: (val: boolean) => void;
  transcriptText: string;
  setTranscriptText: (val: string) => void;
  progress: number;
  setProgress: (val: number) => void;
  currentTime: number;
  setCurrentTime: (val: number) => void;
  subtitleData: Subtitle[];
  setSubtitleData: (val: Subtitle[]) => void;
  isAutoContinue: boolean;
  setIsAutoContinue: (val: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isAudioMode: false,
  setIsAudioMode: (val) => set({ isAudioMode: val }),
  showTranscript: true,
  setShowTranscript: (val) => set({ showTranscript: val }),
  transcriptText: '',
  setTranscriptText: (val) => set({ transcriptText: val }),
  progress: 0,
  setProgress: (val) => set({ progress: val }),
  currentTime: 0,
  setCurrentTime: (val) => set({ currentTime: val }),
  subtitleData: [],
  setSubtitleData: (val) => set({ subtitleData: val }),
  isAutoContinue: true,
  setIsAutoContinue: (val) => set({ isAutoContinue: val }),
}));

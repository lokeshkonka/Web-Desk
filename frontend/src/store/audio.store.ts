import { create } from 'zustand';

interface AudioState {
  globalVolume: number;
  setGlobalVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  globalVolume: 1.0,
  setGlobalVolume: (volume) => set({ globalVolume: Math.max(0, Math.min(1, volume)) }),
}));

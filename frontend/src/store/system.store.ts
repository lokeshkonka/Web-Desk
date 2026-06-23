import { create } from 'zustand';

interface SystemState {
  powerState: 'on' | 'off' | 'booting';
  setPowerState: (state: 'on' | 'off' | 'booting') => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  powerState: 'on',
  setPowerState: (state) => set({ powerState: state }),
}));

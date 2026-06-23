import { create } from 'zustand';

type DialogType = 'confirm' | 'prompt' | 'alert';

interface DialogOptions {
  title: string;
  message: string;
  type: DialogType;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

interface DialogState {
  isOpen: boolean;
  options: DialogOptions | null;
  resolvePromise: ((value: any) => void) | null;
  
  confirm: (title: string, message: string, confirmText?: string) => Promise<boolean>;
  prompt: (title: string, message: string, defaultValue?: string) => Promise<string | null>;
  alert: (title: string, message: string) => Promise<void>;
  close: (value: any) => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  options: null,
  resolvePromise: null,

  confirm: (title, message, confirmText) => {
    return new Promise((resolve) => {
      set({ 
        isOpen: true, 
        options: { title, message, type: 'confirm', confirmText }, 
        resolvePromise: resolve 
      });
    });
  },

  prompt: (title, message, defaultValue) => {
    return new Promise((resolve) => {
      set({ 
        isOpen: true, 
        options: { title, message, type: 'prompt', defaultValue }, 
        resolvePromise: resolve 
      });
    });
  },

  alert: (title, message) => {
    return new Promise((resolve) => {
      set({ 
        isOpen: true, 
        options: { title, message, type: 'alert' }, 
        resolvePromise: resolve 
      });
    });
  },

  close: (value) => {
    set((state) => {
      if (state.resolvePromise) state.resolvePromise(value);
      return { isOpen: false, options: null, resolvePromise: null };
    });
  }
}));

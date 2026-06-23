import { create } from 'zustand';
import { fetchJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../services/journal.api';
import { useNotificationStore } from './notification.store';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface JournalState {
  entries: JournalEntry[];
  activeEntryId: string | null;
  isLoading: boolean;
  loadEntries: () => Promise<void>;
  setActiveEntry: (id: string | null) => void;
  createEntry: () => Promise<void>;
  updateEntry: (id: string, title?: string, content?: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  activeEntryId: null,
  isLoading: false,

  loadEntries: async () => {
    set({ isLoading: true });
    try {
      const entries = await fetchJournalEntries();
      set({ entries, isLoading: false });
      if (entries.length > 0 && !get().activeEntryId) {
        set({ activeEntryId: entries[0].id });
      } else if (entries.length === 0) {
        set({ activeEntryId: null });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  setActiveEntry: (id) => set({ activeEntryId: id }),

  createEntry: async () => {
    const newEntry = await createJournalEntry('Untitled Note', '');
    set((state) => ({
      entries: [newEntry, ...state.entries],
      activeEntryId: newEntry.id
    }));
  },

  updateEntry: async (id, title, content) => {
    set((state) => ({
      entries: state.entries.map(e => 
        e.id === id ? { ...e, title: title ?? e.title, content: content ?? e.content, updatedAt: new Date().toISOString() } : e
      )
    }));
    await updateJournalEntry(id, title, content);
  },

  deleteEntry: async (id) => {
    await deleteJournalEntry(id);
    set((state) => {
      const newEntries = state.entries.filter(e => e.id !== id);
      return {
        entries: newEntries,
        activeEntryId: state.activeEntryId === id ? (newEntries[0]?.id || null) : state.activeEntryId
      };
    });
    useNotificationStore.getState().addNotification({ type: 'success', title: 'Note Deleted', message: 'The journal entry was successfully deleted.' });
  }
}));

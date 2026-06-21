import { create } from 'zustand';
import type { EditorFile } from '../types/editor.types';
import { fetchFileContent, saveFileContent } from '../services/editor.api';
import { useDesktopStore } from './useDesktopStore';
import { collabSocket } from '../services/collaboration.socket';

interface EditorState {
  openedFiles: EditorFile[];
  activeFileId: string | null;

  openFile: (id: string, name: string) => Promise<void>;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  saveFile: (id: string) => Promise<boolean>;
}

const getLanguageFromFileName = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts': return 'typescript';
    case 'tsx': return 'typescript';
    case 'js': return 'javascript';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'cpp': return 'cpp';
    case 'go': return 'go';
    case 'html': return 'html';
    case 'css': return 'css';
    default: return 'plaintext';
  }
}

export const useEditorStore = create<EditorState>((set, get) => {
  // Real-time Collaboration Sync
  collabSocket.socket.on('editor_updated', (data: { fileId: string; content: string }) => {
    set((state) => ({
      openedFiles: state.openedFiles.map(f => 
        f.id === data.fileId ? { ...f, content: data.content } : f
      )
    }));
  });

  return {
    openedFiles: [],
    activeFileId: null,

    openFile: async (id: string, name: string) => {
      const state = get();
      const existing = state.openedFiles.find(f => f.id === id);
      if (existing) {
        set({ activeFileId: id });
      } else {
        try {
          const content = await fetchFileContent(id);
          const newFile: EditorFile = {
            id,
            name,
            content,
            isDirty: false,
            language: getLanguageFromFileName(name)
          };
          set({ openedFiles: [...state.openedFiles, newFile], activeFileId: id });
        } catch (err) {
          console.error(err);
        }
      }
      
      const desktop = useDesktopStore.getState();
      desktop.openWindow('editor', 'Editor', '/icons/desktop-apps/journal.png');
    },

    closeFile: (id: string) => set((state) => {
      const newFiles = state.openedFiles.filter(f => f.id !== id);
      return {
        openedFiles: newFiles,
        activeFileId: state.activeFileId === id ? (newFiles[0]?.id || null) : state.activeFileId
      };
    }),

    setActiveFile: (id: string) => set({ activeFileId: id }),

    updateFileContent: (id: string, content: string) => {
      set((state) => ({
        openedFiles: state.openedFiles.map(f => 
          f.id === id ? { ...f, content, isDirty: true } : f
        )
      }));
      // Broadcast whole document sync to others
      collabSocket.socket.emit('editor_update', { fileId: id, content });
    },

  saveFile: async (id: string) => {
    const file = get().openedFiles.find(f => f.id === id);
    if (!file) return false;
    
    try {
      await saveFileContent(id, file.content);
      set((state) => ({
        openedFiles: state.openedFiles.map(f => 
          f.id === id ? { ...f, isDirty: false } : f
        )
      }));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  };
});

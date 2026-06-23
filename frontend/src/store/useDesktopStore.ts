import { create } from 'zustand';
import type { WindowData, DesktopApp } from '../types';
import { fetchWorkspace, updateWorkspace } from '../services/workspace.api';

interface DesktopState {
  workspaceId: string | null;
  theme: string;
  wallpaper: string;
  windows: WindowData[];
  activeWindowId: string | null;
  
  openWindow: (id: string, title: string, icon: string, initialData?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  setActiveWindow: (id: string) => void;
  
  setWallpaper: (wallpaper: string) => Promise<void>;
  setTheme: (theme: string) => void;
  initWorkspace: () => Promise<void>;
  
  desktopApps: DesktopApp[];
  layoutVersion: number;
  updateDesktopAppPosition: (id: string, x: number, y: number) => void;
  updateDesktopAppTitle: (id: string, title: string) => void;
  removeDesktopApp: (id: string) => void;
  recycleBinApps: DesktopApp[];
  restoreDesktopApp: (id: string) => void;
  emptyRecycleBin: () => void;
  clampDesktopApps: (width: number, height: number) => void;
  sortDesktopApps: () => void;
}

const DEFAULT_APPS: DesktopApp[] = [
  { id: 'terminal', title: 'Terminal', icon: '/icons/desktop-apps/terminal.png', x: 20, y: 20 },
  { id: 'journal', title: 'Journal', icon: '/icons/desktop-apps/journal.png', x: 20, y: 120 },
  { id: 'inventory', title: 'Inventory', icon: '/icons/desktop-apps/inventory.png', x: 20, y: 220 },
  { id: 'workshop', title: 'Workshop', icon: '/icons/desktop-apps/workspace.png', x: 20, y: 320 },
  { id: 'radio', title: 'Radio', icon: '/icons/desktop-apps/radio.png', x: 20, y: 420 },
  { id: 'calculator', title: 'Calculator', icon: '/icons/desktop-apps/calculator.png', x: 20, y: 520 },
  { id: 'containers', title: 'Containers', icon: '/icons/desktop-apps/system.png', x: 20, y: 620 },
  { id: 'weather', title: 'Weather', icon: '/icons/desktop-apps/whether.png', x: 120, y: 20 },
  { id: 'trash', title: 'Trash', icon: '/icons/desktop-apps/trash.png', x: 120, y: 120 },
  { id: 'health', title: 'Health', icon: '/icons/desktop-apps/system.png', x: 120, y: 220 },
];

export const useDesktopStore = create<DesktopState>((set, get) => ({
  workspaceId: null,
  theme: localStorage.getItem('webdesk_theme') || 'cozy-retro',
  wallpaper: localStorage.getItem('webdesk_wallpaper') || 'pixel-cafe.png',
  windows: (() => {
    try {
      const saved = localStorage.getItem('webdesk_windows');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  })(),
  activeWindowId: null,
  layoutVersion: 0,
  
  desktopApps: (() => {
    const saved = localStorage.getItem('webdesk_icons_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_APPS;
      }
    }
    return DEFAULT_APPS;
  })(),
  
  recycleBinApps: (() => {
    const saved = localStorage.getItem('webdesk_recycle_bin');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  })(),
  
  updateDesktopAppPosition: (id, x, y) => set((state) => {
    const newApps = state.desktopApps.map(app => 
      app.id === id ? { ...app, x, y } : app
    );
    localStorage.setItem('webdesk_icons_v2', JSON.stringify(newApps));
    
    // We removed strict collision logic so users can place icons anywhere freely.
    return { desktopApps: newApps };
  }),

  updateDesktopAppTitle: (id, title) => set((state) => {
    const newApps = state.desktopApps.map(app => 
      app.id === id ? { ...app, title } : app
    );
    localStorage.setItem('webdesk_icons_v2', JSON.stringify(newApps));
    return { desktopApps: newApps };
  }),

  removeDesktopApp: (id) => set((state) => {
    if (id === 'trash') return state; // Prevent deleting the trash itself
    const appToDelete = state.desktopApps.find(app => app.id === id);
    if (!appToDelete) return state;

    const newApps = state.desktopApps.filter(app => app.id !== id);
    const newBin = [...state.recycleBinApps, appToDelete];
    
    localStorage.setItem('webdesk_icons_v2', JSON.stringify(newApps));
    localStorage.setItem('webdesk_recycle_bin', JSON.stringify(newBin));
    
    return { desktopApps: newApps, recycleBinApps: newBin };
  }),

  restoreDesktopApp: (id) => set((state) => {
    const appToRestore = state.recycleBinApps.find(app => app.id === id);
    if (!appToRestore) return state;

    // Place it back somewhere visible
    appToRestore.x = 20;
    appToRestore.y = 20;

    const newBin = state.recycleBinApps.filter(app => app.id !== id);
    const newApps = [...state.desktopApps, appToRestore];
    
    localStorage.setItem('webdesk_icons_v2', JSON.stringify(newApps));
    localStorage.setItem('webdesk_recycle_bin', JSON.stringify(newBin));
    
    return { desktopApps: newApps, recycleBinApps: newBin, layoutVersion: state.layoutVersion + 1 };
  }),

  emptyRecycleBin: () => set(() => {
    localStorage.setItem('webdesk_recycle_bin', JSON.stringify([]));
    return { recycleBinApps: [] };
  }),

  clampDesktopApps: (width, height) => set((state) => {
    let changed = false;
    const newApps = state.desktopApps.map(app => {
      let nx = app.x;
      let ny = app.y;
      if (nx > width - 100) { nx = Math.max(0, width - 100); changed = true; }
      if (ny > height - 100) { ny = Math.max(0, height - 100); changed = true; }
      if (nx < 0) { nx = 0; changed = true; }
      if (ny < 0) { ny = 0; changed = true; }
      return { ...app, x: nx, y: ny };
    });
    if (changed) {
      localStorage.setItem('webdesk_icons_v2', JSON.stringify(newApps));
      return { desktopApps: newApps, layoutVersion: state.layoutVersion + 1 };
    }
    return state;
  }),
  
  sortDesktopApps: () => set((state) => {
    const sortedApps = [...state.desktopApps].sort((a, b) => a.title.localeCompare(b.title));
    
    // Grid layout calculation (100x100 grid)
    const containerHeight = window.innerHeight - 64; // Approx height minus taskbar
    const rows = Math.max(1, Math.floor(containerHeight / 100));
    
    const positionedApps = sortedApps.map((app, index) => ({
      ...app,
      x: Math.floor(index / rows) * 100,
      y: (index % rows) * 100
    }));

    localStorage.setItem('webdesk_icons_v2', JSON.stringify(positionedApps));
    return { desktopApps: positionedApps, layoutVersion: state.layoutVersion + 1 };
  }),
  
  initWorkspace: async () => {
    const data = await fetchWorkspace();
    if (data && data.id) {
      set({ workspaceId: data.id, theme: data.theme, wallpaper: data.wallpaper });
      localStorage.setItem('webdesk_theme', data.theme);
      localStorage.setItem('webdesk_wallpaper', data.wallpaper);
    }
  },

  setWallpaper: async (wallpaper) => {
    set({ wallpaper });
    localStorage.setItem('webdesk_wallpaper', wallpaper);
    const state = get();
    if (state.workspaceId) {
      await updateWorkspace(state.workspaceId, state.theme, wallpaper);
    }
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('webdesk_theme', theme);
    const state = get();
    if (state.workspaceId) {
      updateWorkspace(state.workspaceId, theme, state.wallpaper);
    }
  },
  
  openWindow: (appId, title, icon, initialData) => set((state) => {
    const isMultiInstance = appId === 'terminal';
    const windowId = isMultiInstance ? `${appId}-${Math.random().toString(36).substr(2, 6)}` : appId;

    if (!isMultiInstance) {
      const exists = state.windows.find(w => w.id === windowId);
      if (exists) {
        const updated = state.windows.map(w => 
            w.id === windowId ? { ...w, isMinimized: false, zIndex: Math.max(...state.windows.map(win => win.zIndex), 100) + 1, initialData: initialData || w.initialData } : w
        );
        localStorage.setItem('webdesk_windows', JSON.stringify(updated));
        return {
          windows: updated,
          activeWindowId: windowId
        };
      }
    }
    
    const newWindow: WindowData = {
      id: windowId,
      appId,
      title: isMultiInstance ? `${title} (${windowId.split('-')[1]})` : title,
      icon,
      isOpen: true,
      isMinimized: false,
      zIndex: Math.max(...state.windows.map(w => w.zIndex), 100) + 1,
      initialData
    };
    
    const newWindows = [...state.windows, newWindow];
    localStorage.setItem('webdesk_windows', JSON.stringify(newWindows));
    return {
      windows: newWindows,
      activeWindowId: windowId
    };
  }),
  
  closeWindow: (id) => set((state) => {
    const newWindows = state.windows.filter(w => w.id !== id);
    localStorage.setItem('webdesk_windows', JSON.stringify(newWindows));
    return {
      windows: newWindows,
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
    };
  }),
  
  minimizeWindow: (id) => set((state) => {
    const newWindows = state.windows.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    );
    localStorage.setItem('webdesk_windows', JSON.stringify(newWindows));
    return {
      windows: newWindows,
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
    };
  }),
  
  setActiveWindow: (id) => set((state) => {
    const newWindows = state.windows.map(w => 
      w.id === id ? { ...w, isMinimized: false, zIndex: Math.max(...state.windows.map(win => win.zIndex), 100) + 1 } : w
    );
    localStorage.setItem('webdesk_windows', JSON.stringify(newWindows));
    return {
      windows: newWindows,
      activeWindowId: id
    };
  }),
}));

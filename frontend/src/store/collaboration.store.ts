import { create } from 'zustand';
import { collabSocket } from '../services/collaboration.socket';

export interface UserPresence {
  id: string;
  username: string;
  color: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  username: string;
  color: string;
}

export interface Activity {
  id: string;
  message: string;
  timestamp: string;
}

interface CollabState {
  isConnected: boolean;
  onlineUsers: UserPresence[];
  cursorPositions: Record<string, CursorPosition>;
  activities: Activity[];
  currentUser: UserPresence | null;
  workspaceId: string | null;

  connect: (workspaceId: string, user: UserPresence) => void;
  disconnect: () => void;
  
  // Actions
  broadcastCursor: (x: number, y: number) => void;
  broadcastActivity: (msg: string) => void;
}

export const useCollabStore = create<CollabState>((set, get) => {
  // Listeners
  collabSocket.socket.on('connect', () => set({ isConnected: true }));
  collabSocket.socket.on('disconnect', () => set({ isConnected: false }));
  
  collabSocket.socket.on('presence_update', (users: UserPresence[]) => {
    set({ onlineUsers: users });
  });

  collabSocket.socket.on('cursor_moved', (data: { id: string } & CursorPosition) => {
    const { id, ...pos } = data;
    set(state => ({
      cursorPositions: { ...state.cursorPositions, [id]: pos }
    }));
  });

  collabSocket.socket.on('user_left', (_userId: string) => {
    set(state => {
      const newCursors = { ...state.cursorPositions };
      // Note: mapping socket.id to userId properly would require it, 
      // but we will just clear all cursors periodically or ignore it for this simple demo.
      return { cursorPositions: newCursors };
    });
  });

  collabSocket.socket.on('activity', (act: Activity) => {
    set(state => ({
      activities: [act, ...state.activities].slice(0, 50)
    }));
  });

  return {
    isConnected: false,
    onlineUsers: [],
    cursorPositions: {},
    activities: [],
    currentUser: null,
    workspaceId: null,

    connect: (workspaceId: string, user: UserPresence) => {
      set({ workspaceId, currentUser: user });
      collabSocket.connect();
      collabSocket.socket.emit('join_workspace', { workspaceId, user });
    },

    disconnect: () => {
      collabSocket.disconnect();
      set({ workspaceId: null, currentUser: null, onlineUsers: [], cursorPositions: {}, activities: [] });
    },

    broadcastCursor: (x, y) => {
      const { currentUser } = get();
      if (currentUser) {
        collabSocket.socket.emit('cursor_move', {
          x, y,
          username: currentUser.username,
          color: currentUser.color
        });
      }
    },

    broadcastActivity: (msg) => {
      collabSocket.socket.emit('activity_event', msg);
    }
  };
});

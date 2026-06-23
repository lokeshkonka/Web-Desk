import { create } from 'zustand';

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  createdAt?: number;
}

interface NotificationState {
  notifications: Notification[];
  history: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearHistory: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  history: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotif = { ...notification, id, createdAt: Date.now() } as Notification & { createdAt: number };
    set((state) => ({
      notifications: [...state.notifications, newNotif],
      history: [newNotif, ...state.history],
    }));

    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration || 5000);
    }
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearHistory: () => set({ history: [] }),
}));

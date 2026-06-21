import { create } from 'zustand';

export interface ActivityEvent {
  id: string;
  type: 'opened_file' | 'created_folder' | 'started_container' | 'deleted_file' | 'system';
  description: string;
  timestamp: string;
}

interface ActivityState {
  activities: ActivityEvent[];
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  addActivity: (activity) => {
    const newActivity: ActivityEvent = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      activities: [newActivity, ...state.activities].slice(0, 50), // keep last 50
    }));
  },
  clearActivities: () => set({ activities: [] }),
}));

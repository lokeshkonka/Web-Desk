import { apiFetch } from './api';
import { useNotificationStore } from '../store/notification.store';

export const fetchWorkspace = async () => {
  try {
    return await apiFetch('/workspace');
  } catch (error) {
    return null; // fallback will be handled by store
  }
};

export const updateWorkspace = async (id: string, theme: string, wallpaper: string) => {
  try {
    return await apiFetch('/workspace', {
      method: 'PATCH',
      body: JSON.stringify({ id, theme, wallpaper }),
    });
  } catch (error: any) {
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Workspace Update Failed',
      message: error.message || 'Could not save workspace settings.',
    });
    return null;
  }
};

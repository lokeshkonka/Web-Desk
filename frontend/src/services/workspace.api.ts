import { apiFetch } from './api';

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
  } catch (error) {
    return null;
  }
};

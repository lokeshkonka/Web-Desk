import { apiFetch } from './api';
import { useNotificationStore } from '../store/notification.store';

export const fetchFileContent = async (fileId: string): Promise<string> => {
  try {
    const data = await apiFetch(`/editor/file/${fileId}`);
    return data.content;
  } catch (error: any) {
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Failed to Open File',
      message: error.message || 'Could not load the file contents.',
    });
    throw error;
  }
}

export const saveFileContent = async (fileId: string, content: string): Promise<boolean> => {
  await apiFetch(`/editor/file/${fileId}`, {
    method: "PATCH",
    body: JSON.stringify({ content })
  });
  return true;
}

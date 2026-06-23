import { apiFetch } from './api';
import { useNotificationStore } from '../store/notification.store';

const notifyError = (title: string, error: any) => {
  useNotificationStore.getState().addNotification({
    type: 'error',
    title,
    message: error.message || 'An unexpected error occurred.',
  });
};

const notifySuccess = (title: string, message: string) => {
  useNotificationStore.getState().addNotification({
    type: 'success',
    title,
    message,
  });
};

// Folders
export const fetchFolders = async (parentId?: string) => {
  try {
    const endpoint = parentId ? `/folders?parentId=${parentId}` : `/folders`;
    return await apiFetch(endpoint);
  } catch (error) {
    notifyError('Failed to fetch folders', error);
    throw error;
  }
};

export const createFolder = async (name: string, parentId?: string) => {
  try {
    const result = await apiFetch(`/folders`, {
      method: 'POST',
      body: JSON.stringify({ name, parentId }),
    });
    notifySuccess('Folder Created', `Successfully created folder "${name}".`);
    return result;
  } catch (error) {
    notifyError('Failed to create folder', error);
    throw error;
  }
};

export const updateFolder = async (id: string, name: string) => {
  try {
    const result = await apiFetch(`/folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    notifySuccess('Folder Renamed', `Successfully renamed to "${name}".`);
    return result;
  } catch (error) {
    notifyError('Failed to rename folder', error);
    throw error;
  }
};

export const deleteFolder = async (id: string) => {
  try {
    const result = await apiFetch(`/folders/${id}`, {
      method: 'DELETE',
    });
    notifySuccess('Folder Deleted', 'The folder was moved to trash.');
    return result;
  } catch (error) {
    notifyError('Failed to delete folder', error);
    throw error;
  }
};

// Files
export const fetchFiles = async (folderId?: string) => {
  try {
    const endpoint = folderId ? `/files?folderId=${folderId}` : `/files`;
    return await apiFetch(endpoint);
  } catch (error) {
    notifyError('Failed to fetch files', error);
    throw error;
  }
};

export const createFile = async (name: string, type: string, size: number, folderId?: string) => {
  try {
    const result = await apiFetch(`/files`, {
      method: 'POST',
      body: JSON.stringify({ name, type, size, folderId }),
    });
    notifySuccess('File Created', `Successfully created file "${name}".`);
    return result;
  } catch (error) {
    notifyError('Failed to create file', error);
    throw error;
  }
};

export const updateFile = async (id: string, name: string) => {
  try {
    const result = await apiFetch(`/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    notifySuccess('File Renamed', `Successfully renamed to "${name}".`);
    return result;
  } catch (error) {
    notifyError('Failed to rename file', error);
    throw error;
  }
};

export const deleteFile = async (id: string) => {
  try {
    const result = await apiFetch(`/files/${id}`, {
      method: 'DELETE',
    });
    notifySuccess('File Deleted', 'The file was moved to trash.');
    return result;
  } catch (error) {
    notifyError('Failed to delete file', error);
    throw error;
  }
};

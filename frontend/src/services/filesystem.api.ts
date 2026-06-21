import { apiFetch } from './api';

// Folders
export const fetchFolders = async (parentId?: string) => {
  const endpoint = parentId ? `/folders?parentId=${parentId}` : `/folders`;
  return await apiFetch(endpoint);
};

export const createFolder = async (name: string, parentId?: string) => {
  return await apiFetch(`/folders`, {
    method: 'POST',
    body: JSON.stringify({ name, parentId }),
  });
};

export const updateFolder = async (id: string, name: string) => {
  return await apiFetch(`/folders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
};

export const deleteFolder = async (id: string) => {
  return await apiFetch(`/folders/${id}`, {
    method: 'DELETE',
  });
};

// Files
export const fetchFiles = async (folderId?: string) => {
  const endpoint = folderId ? `/files?folderId=${folderId}` : `/files`;
  return await apiFetch(endpoint);
};

export const createFile = async (name: string, type: string, size: number, folderId?: string) => {
  return await apiFetch(`/files`, {
    method: 'POST',
    body: JSON.stringify({ name, type, size, folderId }),
  });
};

export const updateFile = async (id: string, name: string) => {
  return await apiFetch(`/files/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
};

export const deleteFile = async (id: string) => {
  return await apiFetch(`/files/${id}`, {
    method: 'DELETE',
  });
};

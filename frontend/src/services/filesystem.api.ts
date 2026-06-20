export const API_URL = 'http://localhost:3000';

// Folders
export const fetchFolders = async (parentId?: string) => {
  const url = parentId ? `${API_URL}/folders?parentId=${parentId}` : `${API_URL}/folders`;
  const res = await fetch(url);
  return res.json();
};

export const createFolder = async (name: string, parentId?: string) => {
  const res = await fetch(`${API_URL}/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, parentId }),
  });
  return res.json();
};

export const updateFolder = async (id: string, name: string) => {
  const res = await fetch(`${API_URL}/folders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export const deleteFolder = async (id: string) => {
  const res = await fetch(`${API_URL}/folders/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

// Files
export const fetchFiles = async (folderId?: string) => {
  const url = folderId ? `${API_URL}/files?folderId=${folderId}` : `${API_URL}/files`;
  const res = await fetch(url);
  return res.json();
};

export const createFile = async (name: string, type: string, size: number, folderId?: string) => {
  const res = await fetch(`${API_URL}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type, size, folderId }),
  });
  return res.json();
};

export const updateFile = async (id: string, name: string) => {
  const res = await fetch(`${API_URL}/files/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export const deleteFile = async (id: string) => {
  const res = await fetch(`${API_URL}/files/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

import { apiFetch } from './api';

export const fetchFileContent = async (fileId: string): Promise<string> => {
  const data = await apiFetch(`/editor/file/${fileId}`);
  return data.content;
}

export const saveFileContent = async (fileId: string, content: string): Promise<boolean> => {
  await apiFetch(`/editor/file/${fileId}`, {
    method: "PATCH",
    body: JSON.stringify({ content })
  });
  return true;
}

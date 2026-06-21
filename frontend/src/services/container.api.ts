import { apiFetch } from './api';

export const fetchContainers = async () => {
  return await apiFetch("/containers");
};

export const createContainer = async (name: string, image: string, opts?: any) => {
  return await apiFetch("/containers", {
    method: "POST",
    body: JSON.stringify({ name, image, opts })
  });
};

export const startContainer = async (id: string) => {
  return await apiFetch(`/containers/${id}/start`, { method: "POST" });
};

export const stopContainer = async (id: string) => {
  return await apiFetch(`/containers/${id}/stop`, { method: "POST" });
};

export const removeContainer = async (id: string) => {
  return await apiFetch(`/containers/${id}`, { method: "DELETE" });
};

export const fetchContainerLogs = async (id: string) => {
  return await apiFetch(`/containers/${id}/logs`);
};

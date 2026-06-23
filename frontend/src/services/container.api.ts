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

export const fetchContainers = async () => {
  try {
    return await apiFetch("/containers");
  } catch (error) {
    notifyError('Failed to fetch containers', error);
    throw error;
  }
};

export const createContainer = async (name: string, image: string, opts?: any) => {
  try {
    const result = await apiFetch("/containers", {
      method: "POST",
      body: JSON.stringify({ name, image, opts })
    });
    notifySuccess('Container Created', `Successfully created container "${name}".`);
    return result;
  } catch (error) {
    notifyError('Failed to create container', error);
    throw error;
  }
};

export const startContainer = async (id: string) => {
  try {
    const result = await apiFetch(`/containers/${id}/start`, { method: "POST" });
    notifySuccess('Container Started', `Container ${id.substring(0, 8)} is running.`);
    return result;
  } catch (error) {
    notifyError('Failed to start container', error);
    throw error;
  }
};

export const stopContainer = async (id: string) => {
  try {
    const result = await apiFetch(`/containers/${id}/stop`, { method: "POST" });
    notifySuccess('Container Stopped', `Container ${id.substring(0, 8)} was stopped.`);
    return result;
  } catch (error) {
    notifyError('Failed to stop container', error);
    throw error;
  }
};

export const removeContainer = async (id: string) => {
  try {
    const result = await apiFetch(`/containers/${id}`, { method: "DELETE" });
    notifySuccess('Container Removed', `Container ${id.substring(0, 8)} was removed.`);
    return result;
  } catch (error) {
    notifyError('Failed to remove container', error);
    throw error;
  }
};

export const fetchContainerLogs = async (id: string) => {
  try {
    return await apiFetch(`/containers/${id}/logs`);
  } catch (error) {
    notifyError('Failed to fetch container logs', error);
    throw error;
  }
};

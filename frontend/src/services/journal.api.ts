import { apiFetch } from './api';
import { useNotificationStore } from '../store/notification.store';

const notifyError = (title: string, error: any) => {
  useNotificationStore.getState().addNotification({
    type: 'error',
    title,
    message: error.message || 'An unexpected error occurred.',
  });
};

export const fetchJournalEntries = async () => {
  try {
    return await apiFetch("/journal");
  } catch (error) {
    notifyError("Failed to load journal entries", error);
    throw error;
  }
};

export const createJournalEntry = async (title: string, content: string) => {
  try {
    return await apiFetch("/journal", {
      method: "POST",
      body: JSON.stringify({ title, content })
    });
  } catch (error) {
    notifyError("Failed to create entry", error);
    throw error;
  }
};

export const updateJournalEntry = async (id: string, title?: string, content?: string) => {
  try {
    return await apiFetch(`/journal/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, content })
    });
  } catch (error) {
    notifyError("Failed to save entry", error);
    throw error;
  }
};

export const deleteJournalEntry = async (id: string) => {
  try {
    return await apiFetch(`/journal/${id}`, {
      method: "DELETE"
    });
  } catch (error) {
    notifyError("Failed to delete entry", error);
    throw error;
  }
};

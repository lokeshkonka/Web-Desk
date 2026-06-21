import { useNotificationStore } from '../store/notification.store';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiFetch = async <T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        errorMessage = errJson.message || errorMessage;
      } catch (e) {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error);
    useNotificationStore.getState().addNotification({
      type: 'error',
      title: 'Network Error',
      message: error.message || 'Failed to communicate with the server.',
    });
    throw error;
  }
};

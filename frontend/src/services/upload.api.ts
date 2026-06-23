import { apiFetch, API_URL } from './api';
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

export const uploadFileAPI = (
  file: File,
  folderId?: string,
  onProgress?: (progress: number) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) {
      formData.append("folderId", folderId);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          notifySuccess('Upload Complete', `Successfully uploaded "${file.name}".`);
          resolve(res);
        } catch (e) {
          notifySuccess('Upload Complete', `Successfully uploaded "${file.name}".`);
          resolve(xhr.responseText);
        }
      } else {
        const err = new Error(`Upload failed with status ${xhr.status}`);
        notifyError('Upload Failed', err);
        reject(err);
      }
    };

    xhr.onerror = () => {
      const err = new Error("Network error during upload");
      notifyError('Upload Failed', err);
      reject(err);
    };

    xhr.open("POST", `${API_URL}/upload`);
    xhr.send(formData);
  });
};

export const deleteFileAPI = async (id: string) => {
  try {
    const res = await apiFetch(`/upload/${id}`, {
      method: "DELETE",
    });
    notifySuccess('File Deleted', 'File moved to trash.');
    return res;
  } catch (error) {
    notifyError('Failed to delete file', error);
    throw error;
  }
};

export const permanentDeleteFileAPI = async (id: string) => {
  try {
    const res = await apiFetch(`/upload/${id}/permanent`, {
      method: "DELETE",
    });
    notifySuccess('File Destroyed', 'File permanently deleted.');
    return res;
  } catch (error) {
    notifyError('Failed to delete file', error);
    throw error;
  }
};

export const restoreFileAPI = async (id: string) => {
  try {
    const res = await apiFetch(`/upload/${id}/restore`, {
      method: "POST",
    });
    notifySuccess('File Restored', 'File successfully restored.');
    return res;
  } catch (error) {
    notifyError('Failed to restore file', error);
    throw error;
  }
};

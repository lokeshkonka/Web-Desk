import { apiFetch, API_URL } from './api';

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
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };

    xhr.open("POST", `${API_URL}/upload`);
    xhr.send(formData);
  });
};

export const deleteFileAPI = async (id: string) => {
  return await apiFetch(`/upload/${id}`, {
    method: "DELETE",
  });
};

export const permanentDeleteFileAPI = async (id: string) => {
  return await apiFetch(`/upload/${id}/permanent`, {
    method: "DELETE",
  });
};

export const restoreFileAPI = async (id: string) => {
  return await apiFetch(`/upload/${id}/restore`, {
    method: "POST",
  });
};

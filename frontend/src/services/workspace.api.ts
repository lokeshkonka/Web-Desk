const API_URL = 'http://localhost:3000/api';

export const fetchWorkspace = async () => {
  try {
    const response = await fetch(`${API_URL}/workspace`);
    if (!response.ok) throw new Error('Failed to fetch workspace');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

export const updateWorkspace = async (id: string, theme: string, wallpaper: string) => {
  try {
    const response = await fetch(`${API_URL}/workspace`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, theme, wallpaper }),
    });
    if (!response.ok) throw new Error('Failed to update workspace');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

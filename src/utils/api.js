const BASE_URL = 'https://notes-api.dicoding.dev/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || 'Terjadi kesalahan saat menghubungi server.');
  }

  return result;
}

export const register = ({ name, email, password }) => request('/register', {
  method: 'POST',
  body: JSON.stringify({ name, email, password }),
});

export const login = ({ email, password }) => request('/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

export const getActiveNotes = () => request('/notes');
export const getArchivedNotes = () => request('/notes/archived');
export const getNote = (id) => request(`/notes/${id}`);

export const addNote = ({ title, body }) => request('/notes', {
  method: 'POST',
  body: JSON.stringify({ title, body }),
});

export const deleteNote = (id) => request(`/notes/${id}`, {
  method: 'DELETE',
});

export const archiveNote = (id) => request(`/notes/${id}/archive`, {
  method: 'POST',
});

export const unarchiveNote = (id) => request(`/notes/${id}/unarchive`, {
  method: 'POST',
});

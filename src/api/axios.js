import axios from 'axios';

function normalizeBaseUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

const apiBase = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${apiBase}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

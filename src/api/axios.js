import axios from 'axios';

function normalizeBaseUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

const isProd = Boolean(import.meta.env.PROD);
const configuredApiBase = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

// Security: fail fast if production is misconfigured. Falling back to HTTP in production can cause mixed-content
// failures in browsers and risks accidental downgrade to an insecure transport.
if (isProd) {
  if (!configuredApiBase) {
    throw new Error('VITE_API_BASE_URL must be set in production');
  }
  if (configuredApiBase.startsWith('http://')) {
    throw new Error('VITE_API_BASE_URL must use https:// in production');
  }
}

const apiBase = configuredApiBase || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${apiBase}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

import axios from 'axios';

// Where the JWT lives. localStorage keeps the user logged in across reloads.
// (For higher security one could move to httpOnly cookies; localStorage keeps
// the MVP simple and is fine for a first version.)
const TOKEN_KEY = 'sumly_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// A single configured axios instance used by every API module. The base URL is
// empty by default so requests hit same-origin "/api" paths (proxied to the
// backend in both dev and production).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the bearer token to every request when present.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response handling: on 401 the token is stale/invalid, so clear it and
// bounce to login. Other errors are surfaced to the caller.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// Extracts a human-friendly message from an axios error for display in the UI.
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'Something went wrong';
  }
  return 'Something went wrong';
}

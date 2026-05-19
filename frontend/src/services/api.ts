import axios from 'axios';

const backendUrl =
  (import.meta.env.VITE_BACKEND_URL as string) ||
  (import.meta.env.REACT_APP_BACKEND_URL as string) ||
  'http://localhost:8001';

const api = axios.create({
  baseURL: backendUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login (but NOT for auth endpoints)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

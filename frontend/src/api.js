import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle expired access token and refresh it automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and this is the first retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);

      if (!refreshToken) {
        return Promise.reject(error); // No refresh token, can't retry
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = res.data.access;
        localStorage.setItem(ACCESS_TOKEN, newAccessToken);

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh token is invalid/expired — force logout
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

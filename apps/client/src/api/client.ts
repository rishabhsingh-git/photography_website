import axios from "axios";
import { getAccessToken } from "../state/tokenStorage";

// Default to localhost:3000/api for development if not set
// Note: The API has a global prefix '/api' set in main.ts
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const baseURL = apiBaseURL.endsWith('/api') ? apiBaseURL : `${apiBaseURL}/api`;

// Log the base URL for debugging
console.log('🔗 API Base URL:', baseURL);
console.log('🔗 VITE_API_URL env:', import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: hook into global error handling / logout on 401 if needed.
    return Promise.reject(error);
  }
);



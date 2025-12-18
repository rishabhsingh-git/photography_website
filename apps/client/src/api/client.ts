import axios from "axios";
import { getAccessToken } from "../state/tokenStorage";

const baseURL = import.meta.env.VITE_API_URL as string | undefined;

if (!baseURL) {
  // In production you might want to fail fast; for now we log to help local dev.
  // eslint-disable-next-line no-console
  console.warn("VITE_API_URL is not set. API calls will likely fail.");
}

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



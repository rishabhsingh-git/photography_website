import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens } from "../state/tokenStorage";

// Always use absolute URL pointing to backend API (port 3000)
// In Docker, this will be handled by the network, locally it's localhost:3000
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Ensure we have /api prefix
let baseURL = apiBaseURL;
if (!baseURL.endsWith('/api')) {
  baseURL = `${baseURL}/api`;
}

// Log the base URL for debugging
console.log('🔗 API Base URL:', baseURL);
console.log('🔗 VITE_API_URL env:', import.meta.env.VITE_API_URL);
console.log('🔗 Full request will go to:', baseURL);

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  // Ensure baseURL is set - if not, use the configured baseURL
  if (!config.baseURL) {
    config.baseURL = baseURL;
  }
  const fullURL = config.baseURL && config.url 
    ? `${config.baseURL}${config.url.startsWith('/') ? config.url : `/${config.url}`}`
    : config.url;
  
  console.log('🌐 [API Request]', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL || 'NOT SET',
    fullURL: fullURL,
    hasToken: !!token,
    axiosDefaults: api.defaults.baseURL,
  });
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    console.log('✅ [API Response]', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        processQueue(error, null);
        isRefreshing = false;
        // Redirect to login if no refresh token
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<{
          accessToken: string;
          refreshToken: string;
        }>(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }

        processQueue(null, data.accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearTokens();
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);



import axios, { AxiosInstance, AxiosResponse } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "X-Client-Type": "web",
    "x-api-key": import.meta.env.VITE_API_KEY,
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err) => {
    console.error("API ERROR", err.response || err);
    return Promise.reject(err.response?.data ?? err);
  },
);

export default api;

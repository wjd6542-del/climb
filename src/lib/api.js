import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "X-Client-Type": "web",
    "x-api-key": import.meta.env.VITE_API_KEY,
  },
});

api.interceptors.request.use((config) => {
  //console.log("🚀 요청 URL:", config.url);
  //console.log("📦 요청 헤더:", config.headers);
  //console.log("📨 요청 데이터:", config.data);

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 (공통 에러)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR", err.response || err);
    return Promise.reject(err.response.data);
  },
);

export default api;

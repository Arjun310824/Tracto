import axios from "axios";

const getApiBase = () => {

  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000/api/`;
  }
  return "http://127.0.0.1:8000/api/";
};

const api = axios.create({
  baseURL: getApiBase(),
  headers: {
    "Content-Type": "application/json",
  },
});



api.interceptors.request.use(
  (config) => {
    // Don't send old JWT token during login/register
    if (
      !config.url.includes("accounts/login/") &&
      !config.url.includes("accounts/register/")
    ) {
      const token = localStorage.getItem("access_token") || localStorage.getItem("access");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }


    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
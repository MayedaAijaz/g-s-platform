import axios from "axios";

const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Inject JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("gsmedcure_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("gsmedcure_token");
      localStorage.removeItem("gsmedcure_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

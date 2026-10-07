import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT login
export const login = async () => {
  const username =
    import.meta.env.VITE_API_USERNAME || "admin@example.com";

  const password =
    import.meta.env.VITE_API_PASSWORD || "Admin@12345";

  const response = await axios.post(
    `${API_BASE_URL}/auth/token/`,
    {
      username,
      password,
    }
  );

  localStorage.setItem(
    "access_token",
    response.data.access
  );

  localStorage.setItem(
    "refresh_token",
    response.data.refresh
  );

  return response.data;
};

// Attach JWT token to API requests
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired access token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }

    return Promise.reject(error);
  }
);

export default api;
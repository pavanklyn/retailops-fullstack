import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = async () => {
  const response = await axios.post(
    "http://127.0.0.1:8000/api/auth/token/",
    {
      username: "admin@example.com",
      password: "Admin@12345",
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

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization =
        "Bearer " + token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
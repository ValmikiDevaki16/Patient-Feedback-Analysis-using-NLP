import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authAPI = {
  verifyClerk: (key) => api.post("/auth/verify-clerk", { key }),
  hospitalLogin: (password) => api.post("/auth/hospital-login", { password }),
};

export const feedbackAPI = {
  submit: (data) => api.post("/feedback", data),
  getAll: () => api.get("/feedback/all"),
};

export const adminAPI = {
  getOverview: () => api.get("/admin/overview"),
  chat: (message) => api.post("/admin/chat", { message }),
  summary: () => api.get("/admin/summary"),
  getTopDoctors: () => api.get("/admin/top-doctors"),
};

export default api;

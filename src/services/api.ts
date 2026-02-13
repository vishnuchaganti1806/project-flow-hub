import axios from "axios";
import { toast } from "sonner";

// Base API instance — reads from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      toast.error("Access denied. You don't have permission.");
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (!error.response) {
      toast.error("Network error. Check your connection.");
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth endpoints ───
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// ─── Ideas endpoints ───
export const ideasAPI = {
  getAll: (params?: Record<string, string>) =>
    api.get("/ideas", { params }),
  getById: (id: string) => api.get(`/ideas/${id}`),
  create: (data: Record<string, unknown>) => api.post("/ideas", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/ideas/${id}`, data),
  updateStatus: (id: string, status: string, feedback?: string) =>
    api.patch(`/ideas/${id}/status`, { status, feedback }),
  delete: (id: string) => api.delete(`/ideas/${id}`),
};

// ─── Students endpoints ───
export const studentsAPI = {
  getAll: () => api.get("/students"),
  getById: (id: string) => api.get(`/students/${id}`),
  getProfile: () => api.get("/students/profile"),
  updateProfile: (data: Record<string, unknown>) => api.put("/students/profile", data),
};

// ─── Guides endpoints ───
export const guidesAPI = {
  getAll: () => api.get("/guides"),
  getById: (id: string) => api.get(`/guides/${id}`),
};

// ─── Teams endpoints ───
export const teamsAPI = {
  getAll: () => api.get("/teams"),
  create: (data: { name: string; members: string[] }) =>
    api.post("/teams", data),
  delete: (id: string) => api.delete(`/teams/${id}`),
  addMember: (teamId: string, memberId: string) =>
    api.post(`/teams/${teamId}/members`, { memberId }),
  removeMember: (teamId: string, memberId: string) =>
    api.delete(`/teams/${teamId}/members/${memberId}`),
  assignGuide: (teamId: string, guideId: string) =>
    api.patch(`/teams/${teamId}/guide`, { guideId }),
};

// ─── Doubts endpoints ───
export const doubtsAPI = {
  getAll: () => api.get("/doubts"),
  getByProject: (projectId: string) =>
    api.get(`/doubts/project/${projectId}`),
  create: (data: { subject: string; guideId: string; message: string }) =>
    api.post("/doubts", data),
  reply: (doubtId: string, text: string) =>
    api.post(`/doubts/${doubtId}/reply`, { text }),
  resolve: (doubtId: string) =>
    api.patch(`/doubts/${doubtId}/resolve`),
};

// ─── Deadlines endpoints ───
export const deadlinesAPI = {
  getAll: () => api.get("/deadlines"),
  create: (data: { title: string; date: string; projectId?: string }) =>
    api.post("/deadlines", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/deadlines/${id}`, data),
  delete: (id: string) => api.delete(`/deadlines/${id}`),
};

// ─── Reviews & Ratings endpoints ───
export const reviewsAPI = {
  getAll: () => api.get("/reviews"),
  submit: (data: { studentId: string; rating: number; comment: string }) =>
    api.post("/reviews", data),
  getByStudent: (studentId: string) =>
    api.get(`/reviews/student/${studentId}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/reviews/${id}`, data),
};

// ─── Admin stats endpoint ───
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  assignStudentToGuide: (studentId: string, guideId: string) =>
    api.post("/admin/assign", { studentId, guideId }),
};

// ─── Notifications endpoints ───
export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getVolunteers: () => api.get('/users/volunteers'),
  getNGOs: () => api.get('/users/ngos'),
};

// Donation API
export const donationAPI = {
  create: (data) => api.post('/donations', data),
  getAll: (params) => api.get('/donations', { params }),
  accept: (id) => api.put(`/donations/${id}/accept`),
  assignVolunteer: (id, volunteerId) => api.put(`/donations/${id}/assign-volunteer`, { volunteerId }),
  updateStatus: (id, data) => api.put(`/donations/${id}/status`, data),
};

// Task API
export const taskAPI = {
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  start: (id) => api.put(`/tasks/${id}/start`),
  complete: (id, data) => api.put(`/tasks/${id}/complete`, data),
};

// Payment API
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
  getTaxReceipt: (donationId) => api.get(`/payments/tax-receipt/${donationId}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
  getDonations: () => api.get('/admin/donations'),
};

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('adventiq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adventiq_token');
      localStorage.removeItem('adventiq_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ─── Experts ──────────────────────────────────────────────────────────────────
export const expertsApi = {
  list: params => api.get('/experts', { params }),
  get: id => api.get(`/experts/${id}`),
  update: (id, data) => api.put(`/experts/${id}`, data),
};

// ─── Labs ─────────────────────────────────────────────────────────────────────
export const labsApi = {
  list: params => api.get('/labs', { params }),
  get: id => api.get(`/labs/${id}`),
  update: (id, data) => api.put(`/labs/${id}`, data),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingsApi = {
  create: data => api.post('/bookings', data),
  list: () => api.get('/bookings'),
  get: id => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  submit: (formData) => api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getByBooking: bookingId => api.get(`/reports/booking/${bookingId}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: params => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  deleteUser: id => api.delete(`/admin/users/${id}`),
  bookings: params => api.get('/admin/bookings', { params }),
};

export default api;

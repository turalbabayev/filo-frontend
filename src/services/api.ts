import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-dd05.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor - her istekte token'ı ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - 401 hatası durumunda refresh token ile yeni token al
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API fonksiyonları
export const apiService = {
  // Dashboard istatistikleri
  getDashboardStats: () => api.get('/api/dashboard/stats/'),
  getRecentActivities: () => api.get('/api/dashboard/activities/'),

  // Araçlar
  getVehicles: () => api.get('/api/araclar/'),
  getVehicle: (id: number) => api.get(`/api/araclar/${id}/`),
  createVehicle: (data: any) => api.post('/api/araclar/', data),
  updateVehicle: (id: number, data: any) => api.put(`/api/araclar/${id}/`, data),
  deleteVehicle: (id: number) => api.delete(`/api/araclar/${id}/`),

  // Sürücüler
  getDrivers: () => api.get('/api/suruculer/'),
  getDriver: (id: number) => api.get(`/api/suruculer/${id}/`),
  createDriver: (data: any) => api.post('/api/suruculer/', data),
  updateDriver: (id: number, data: any) => api.put(`/api/suruculer/${id}/`, data),
  deleteDriver: (id: number) => api.delete(`/api/suruculer/${id}/`),

  // Görevler
  getTasks: () => api.get('/api/gorevler/'),
  getTask: (id: number) => api.get(`/api/gorevler/${id}/`),
  createTask: (data: any) => api.post('/api/gorevler/', data),
  updateTask: (id: number, data: any) => api.put(`/api/gorevler/${id}/`, data),
  deleteTask: (id: number) => api.delete(`/api/gorevler/${id}/`),

  // Kilometre kayıtları
  getMileages: () => api.get('/api/kilometreler/'),
  getMileage: (id: number) => api.get(`/api/kilometreler/${id}/`),
  createMileage: (data: any) => api.post('/api/kilometreler/', data),
  updateMileage: (id: number, data: any) => api.put(`/api/kilometreler/${id}/`, data),
  deleteMileage: (id: number) => api.delete(`/api/kilometreler/${id}/`),

  // Harcamalar
  getExpenses: () => api.get('/api/harcamalar/'),
  getExpense: (id: number) => api.get(`/api/harcamalar/${id}/`),
  createExpense: (data: any) => api.post('/api/harcamalar/', data),
  updateExpense: (id: number, data: any) => api.put(`/api/harcamalar/${id}/`, data),
  deleteExpense: (id: number) => api.delete(`/api/harcamalar/${id}/`),
};

export default apiService; 
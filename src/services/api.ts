import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-dd05.up.railway.app';

// Interfaces
export interface Vehicle {
  id: number;
  plaka: string;
  marka: string;
  model: string;
  yil: number;
  tip: string;
  mevcut_durum: 'havuzda' | 'kullanımda';
  created_at: string;
}

export interface Driver {
  id: number;
  ad_soyad: string;
  telefon: string;
  ehliyet_no: string;
  ehliyet_sinifi: string;
  aktif: boolean;
  created_at: string;
}

export interface Task {
  id: number;
  baslik: string;
  aciklama: string;
  durum: 'beklemede' | 'devam_ediyor' | 'tamamlandi' | 'iptal_edildi';
  baslangic_tarihi: string;
  bitis_tarihi: string;
  created_at: string;
}

export interface Mileage {
  id: number;
  arac_plaka: string;
  surucu_adi: string;
  kilometre: number;
  tarih: string;
  aciklama: string;
  created_at: string;
}

export interface Expense {
  id: number;
  kategori: string;
  tutar: number;
  tarih: string;
  aciklama: string;
  arac_plaka: string;
  created_at: string;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekleme
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - token yenileme
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// API fonksiyonları
const apiService = {
  // Auth
  login: (username: string, password: string) =>
    api.post('/auth/token/', { username, password }),

  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats/'),
  getRecentActivities: () => api.get('/dashboard/activities/'),

  // Vehicles
  getVehicles: () => api.get('/vehicles/'),
  getVehicle: (id: number) => api.get(`/vehicles/${id}/`),
  createVehicle: (data: Partial<Vehicle>) => api.post('/vehicles/', data),
  updateVehicle: (id: number, data: Partial<Vehicle>) => api.put(`/vehicles/${id}/`, data),
  deleteVehicle: (id: number) => api.delete(`/vehicles/${id}/`),

  // Drivers
  getDrivers: () => api.get('/drivers/'),
  getDriver: (id: number) => api.get(`/drivers/${id}/`),
  createDriver: (data: Partial<Driver>) => api.post('/drivers/', data),
  updateDriver: (id: number, data: Partial<Driver>) => api.put(`/drivers/${id}/`, data),
  deleteDriver: (id: number) => api.delete(`/drivers/${id}/`),

  // Tasks
  getTasks: () => api.get('/tasks/'),
  getTask: (id: number) => api.get(`/tasks/${id}/`),
  createTask: (data: Partial<Task>) => api.post('/tasks/', data),
  updateTask: (id: number, data: Partial<Task>) => api.put(`/tasks/${id}/`, data),
  deleteTask: (id: number) => api.delete(`/tasks/${id}/`),

  // Mileages
  getMileages: () => api.get('/mileages/'),
  getMileage: (id: number) => api.get(`/mileages/${id}/`),
  createMileage: (data: Partial<Mileage>) => api.post('/mileages/', data),
  updateMileage: (id: number, data: Partial<Mileage>) => api.put(`/mileages/${id}/`, data),
  deleteMileage: (id: number) => api.delete(`/mileages/${id}/`),

  // Expenses
  getExpenses: () => api.get('/expenses/'),
  getExpense: (id: number) => api.get(`/expenses/${id}/`),
  createExpense: (data: Partial<Expense>) => api.post('/expenses/', data),
  updateExpense: (id: number, data: Partial<Expense>) => api.put(`/expenses/${id}/`, data),
  deleteExpense: (id: number) => api.delete(`/expenses/${id}/`),
};

export default apiService; 
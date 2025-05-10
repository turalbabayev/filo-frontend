import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-dd05.up.railway.app';

// Interfaces
export interface Vehicle {
  id: number;
  plaka: string;
  marka: string;
  model: string;
  yil: number;
  tip: string;
  kaynak_tipi: string;
  mevcut_durum: string;
  aciklama?: string;
  created_at: string;
}

export interface Driver {
  id: number;
  ad: string;
  soyad: string;
  ehliyet_no: string;
  telefon: string;
  aktif: boolean;
  created_at: string;
}

export interface Task {
  id: number;
  arac: number;
  surucu: number;
  baslangic_tarihi: string;
  bitis_tarihi?: string;
  aciklama: string;
  created_at: string;
}

export interface Mileage {
  id: number;
  arac: number;
  tarih: string;
  kilometre: number;
  created_at: string;
}

export interface Expense {
  id: number;
  arac: number;
  tarih: string;
  tip: string;
  tutar: number;
  aciklama: string;
  created_at: string;
}

interface TokenRefreshResponse {
  access: string;
}

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor - her istekte token'ı ekle
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - 401 hatası durumunda refresh token ile yeni token al
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post<TokenRefreshResponse>(`${API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
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
  getVehicles: () => api.get<Vehicle[]>('/api/araclar/'),
  getVehicle: (id: number) => api.get<Vehicle>(`/api/araclar/${id}/`),
  createVehicle: (data: Omit<Vehicle, 'id' | 'created_at'>) => api.post<Vehicle>('/api/araclar/', data),
  updateVehicle: (id: number, data: Partial<Omit<Vehicle, 'id' | 'created_at'>>) => api.put<Vehicle>(`/api/araclar/${id}/`, data),
  deleteVehicle: (id: number) => api.delete(`/api/araclar/${id}/`),

  // Sürücüler
  getDrivers: () => api.get<Driver[]>('/api/suruculer/'),
  getDriver: (id: number) => api.get<Driver>(`/api/suruculer/${id}/`),
  createDriver: (data: Omit<Driver, 'id' | 'created_at'>) => api.post<Driver>('/api/suruculer/', data),
  updateDriver: (id: number, data: Partial<Omit<Driver, 'id' | 'created_at'>>) => api.put<Driver>(`/api/suruculer/${id}/`, data),
  deleteDriver: (id: number) => api.delete(`/api/suruculer/${id}/`),

  // Görevler
  getTasks: () => api.get<Task[]>('/api/gorevler/'),
  getTask: (id: number) => api.get<Task>(`/api/gorevler/${id}/`),
  createTask: (data: Omit<Task, 'id' | 'created_at'>) => api.post<Task>('/api/gorevler/', data),
  updateTask: (id: number, data: Partial<Omit<Task, 'id' | 'created_at'>>) => api.put<Task>(`/api/gorevler/${id}/`, data),
  deleteTask: (id: number) => api.delete(`/api/gorevler/${id}/`),

  // Kilometre kayıtları
  getMileages: () => api.get<Mileage[]>('/api/kilometreler/'),
  getMileage: (id: number) => api.get<Mileage>(`/api/kilometreler/${id}/`),
  createMileage: (data: Omit<Mileage, 'id' | 'created_at'>) => api.post<Mileage>('/api/kilometreler/', data),
  updateMileage: (id: number, data: Partial<Omit<Mileage, 'id' | 'created_at'>>) => api.put<Mileage>(`/api/kilometreler/${id}/`, data),
  deleteMileage: (id: number) => api.delete(`/api/kilometreler/${id}/`),

  // Harcamalar
  getExpenses: () => api.get<Expense[]>('/api/harcamalar/'),
  getExpense: (id: number) => api.get<Expense>(`/api/harcamalar/${id}/`),
  createExpense: (data: Omit<Expense, 'id' | 'created_at'>) => api.post<Expense>('/api/harcamalar/', data),
  updateExpense: (id: number, data: Partial<Omit<Expense, 'id' | 'created_at'>>) => api.put<Expense>(`/api/harcamalar/${id}/`, data),
  deleteExpense: (id: number) => api.delete(`/api/harcamalar/${id}/`),
};

export default apiService; 
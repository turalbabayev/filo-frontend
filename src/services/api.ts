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
  kaynak_tipi: 'ozmal' | 'kiralik';
  mevcut_durum: 'havuzda' | 'kullanımda';
  aciklama?: string;
  created_at: string;
}

export interface Driver {
  id: number;
  ad: string;
  soyad: string;
  telefon: string;
  ehliyet_no: string;
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
  arac: number;
  surucu: number;
  arac_plaka: string;
  surucu_adi: string;
  created_at: string;
}

export interface Mileage {
  id: number;
  arac: number;
  arac_plaka: string;
  surucu_adi: string;
  kilometre: number;
  tarih: string;
  aciklama: string;
  created_at: string;
}

export interface Expense {
  id: number;
  arac: number;
  tarih: string;
  tip: 'bakim' | 'kasko' | 'yakıt' | 'lastik' | 'tamir';
  tutar: number;
  aciklama?: string;
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
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// API fonksiyonları
const apiService = {
  // Auth
  login: (username: string, password: string) =>
    api.post('/api/token/', { username, password }),

  // Dashboard
  getDashboardStats: () => api.get('/api/dashboard/stats/'),
  getRecentActivities: () => api.get('/api/dashboard/activities/'),

  // Vehicles
  getVehicles: () => api.get('/api/vehicles/'),
  getVehicle: (id: number) => api.get(`/api/vehicles/${id}/`),
  createVehicle: (data: Partial<Vehicle>) => api.post('/api/vehicles/', data),
  updateVehicle: (id: number, data: Partial<Vehicle>) => api.put(`/api/vehicles/${id}/`, data),
  deleteVehicle: (id: number) => api.delete(`/api/vehicles/${id}/`),

  // Drivers
  getDrivers: async (): Promise<Driver[]> => {
    const response = await api.get('/api/drivers/');
    return response.data;
  },
  getDriver: (id: number) => api.get(`/api/drivers/${id}/`),
  createDriver: async (data: Partial<Driver>): Promise<Driver> => {
    const response = await api.post('/api/drivers/', data);
    return response.data;
  },
  updateDriver: async (id: number, data: Partial<Driver>): Promise<Driver> => {
    const response = await api.put(`/api/drivers/${id}/`, data);
    return response.data;
  },
  deleteDriver: async (id: number): Promise<void> => {
    await api.delete(`/api/drivers/${id}/`);
  },

  // Tasks
  getTasks: async () => {
    const response = await api.get('/api/tasks/');
    return response;
  },
  getTask: async (id: number) => {
    const response = await api.get(`/api/tasks/${id}/`);
    return response;
  },
  createTask: async (data: Partial<Task>) => {
    const response = await api.post('/api/tasks/', data);
    return response;
  },
  updateTask: async (id: number, data: Partial<Task>) => {
    const response = await api.put(`/api/tasks/${id}/`, data);
    return response;
  },
  deleteTask: async (id: number) => {
    await api.delete(`/api/tasks/${id}/`);
  },

  // Mileages
  getMileages: () => api.get('/api/mileages/'),
  getMileage: (id: number) => api.get(`/api/mileages/${id}/`),
  createMileage: (data: Partial<Mileage>) => api.post('/api/mileages/', data),
  updateMileage: (id: number, data: Partial<Mileage>) => api.put(`/api/mileages/${id}/`, data),
  deleteMileage: (id: number) => api.delete(`/api/mileages/${id}/`),

  // Expenses
  getExpenses: () => api.get('/api/expenses/'),
  getExpense: (id: number) => api.get(`/api/expenses/${id}/`),
  createExpense: (data: Partial<Expense>) => api.post('/api/expenses/', data),
  updateExpense: (id: number, data: Partial<Expense>) => api.put(`/api/expenses/${id}/`, data),
  deleteExpense: (id: number) => api.delete(`/api/expenses/${id}/`),
};

export default apiService; 
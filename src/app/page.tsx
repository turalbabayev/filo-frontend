'use client';

import { useEffect, useState } from 'react';
import apiService from '@/services/api';
import { AxiosError } from 'axios';
import Layout from '@/components/Layout';

interface DashboardStats {
  total_vehicles: number;
  active_drivers: number;
  monthly_tasks: number;
  monthly_expenses: number;
}

interface Activity {
  type: string;
  description: string;
  date: string;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('API çağrıları başlıyor...');
        
        const [statsResponse, activitiesResponse] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getRecentActivities()
        ]);
        
        console.log('Stats yanıtı:', statsResponse.data);
        console.log('Activities yanıtı:', activitiesResponse.data);
        
        setStats(statsResponse.data);
        setActivities(activitiesResponse.data);
      } catch (err: unknown) {
        console.error('Dashboard veri yükleme hatası:', err);
        
        if (err instanceof AxiosError) {
          console.error('Hata detayları:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
          setError(`Veriler yüklenirken bir hata oluştu: ${err.response?.data?.detail || err.message}`);
        } else {
          setError('Beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const content = (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hoş Geldiniz 👋</h1>
          <p className="mt-1 text-gray-600">Filo yönetim sisteminize genel bakış</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50">
            Rapor İndir
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Yeni Görev
          </button>
        </div>
      </div>
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="text-4xl mb-2">🚗</div>
          <div className="text-3xl font-bold mb-1">{stats?.total_vehicles || 0}</div>
          <div className="text-blue-100">Toplam Araç</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="text-4xl mb-2">👤</div>
          <div className="text-3xl font-bold mb-1">{stats?.active_drivers || 0}</div>
          <div className="text-green-100">Aktif Sürücü</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-3xl font-bold mb-1">{stats?.monthly_tasks || 0}</div>
          <div className="text-purple-100">Aylık Görev</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-3xl font-bold mb-1">{stats?.monthly_expenses?.toLocaleString('tr-TR')} ₺</div>
          <div className="text-orange-100">Aylık Harcama</div>
        </div>
      </div>
      
      {/* Son Aktiviteler */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Son Aktiviteler</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Tümünü Gör →
            </button>
          </div>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
              >
                <div className={`p-3 rounded-xl ${
                  activity.type === 'task' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  <span className="text-2xl">{activity.type === 'task' ? '🚗' : '💰'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(activity.date).toLocaleString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  •••
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        </div>
      </Layout>
    );
  }

  return <Layout>{content}</Layout>;
}

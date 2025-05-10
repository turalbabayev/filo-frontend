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
    <div className="space-y-6">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Toplam Araç</h3>
          <p className="text-3xl">{stats?.total_vehicles}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Aktif Sürücü</h3>
          <p className="text-3xl">{stats?.active_drivers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Aylık Görev</h3>
          <p className="text-3xl">{stats?.monthly_tasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Aylık Harcama</h3>
          <p className="text-3xl">{stats?.monthly_expenses} ₺</p>
        </div>
      </div>
      
      {/* Son Aktiviteler */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Son Aktiviteler</h2>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded">
              <div className={`p-2 rounded-full ${
                activity.type === 'task' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              }`}>
                {activity.type === 'task' ? '🚗' : '💰'}
              </div>
              <div>
                <p className="text-gray-800">{activity.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.date).toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          ))}
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </Layout>
    );
  }

  return <Layout>{content}</Layout>;
}

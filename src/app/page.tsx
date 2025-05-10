'use client';

import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import { FiTruck, FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { apiService } from '@/services/api';

interface DashboardStats {
  total_vehicles: number;
  active_drivers: number;
  monthly_tasks: number;
  monthly_expenses: number;
}

interface Activity {
  type: 'task' | 'expense';
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
        const [statsResponse, activitiesResponse] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getRecentActivities()
        ]);
        
        setStats(statsResponse.data);
        setActivities(activitiesResponse.data);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu.');
        console.error('Dashboard veri hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { 
      title: 'Toplam Araç', 
      value: stats?.total_vehicles ?? '-', 
      icon: FiTruck, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Aktif Sürücü', 
      value: stats?.active_drivers ?? '-', 
      icon: FiUsers, 
      color: 'bg-green-500' 
    },
    { 
      title: 'Aylık Görev', 
      value: stats?.monthly_tasks ?? '-', 
      icon: FiCalendar, 
      color: 'bg-purple-500' 
    },
    { 
      title: 'Aylık Harcama', 
      value: stats ? `₺${stats.monthly_expenses.toLocaleString('tr-TR')}` : '-', 
      icon: FiDollarSign, 
      color: 'bg-yellow-500' 
    },
  ];

  if (error) {
    return (
      <Layout>
        <div className="py-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Genel Bakış</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-sm font-medium text-gray-600">{stat.title}</h2>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loading ? (
                        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Son Aktiviteler</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-200 h-5 w-5 rounded"></div>
                      <div className="bg-gray-200 h-4 w-64 rounded"></div>
                    </div>
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {activity.type === 'task' ? (
                        <FiUsers className="w-5 h-5 text-green-500" />
                      ) : (
                        <FiDollarSign className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className="ml-3 text-gray-700">{activity.description}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(activity.date), { 
                        addSuffix: true,
                        locale: tr 
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

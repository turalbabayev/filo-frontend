'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import apiService, { Task } from '@/services/api';
import { AxiosError } from 'axios';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getTasks();
        setTasks(response.data);
      } catch (err) {
        console.error('Görevler yüklenirken hata:', err);
        if (err instanceof AxiosError) {
          setError(`Görevler yüklenirken hata oluştu: ${err.response?.data?.detail || err.message}`);
        } else {
          setError('Beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task =>
    task.baslik.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.aciklama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (durum: string) => {
    switch (durum) {
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-700';
      case 'devam_ediyor':
        return 'bg-blue-100 text-blue-700';
      case 'tamamlandi':
        return 'bg-green-100 text-green-700';
      case 'iptal_edildi':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (durum: string) => {
    switch (durum) {
      case 'beklemede':
        return 'Beklemede';
      case 'devam_ediyor':
        return 'Devam Ediyor';
      case 'tamamlandi':
        return 'Tamamlandı';
      case 'iptal_edildi':
        return 'İptal Edildi';
      default:
        return durum;
    }
  };

  const content = (
    <div className="space-y-8">
      {/* Başlık ve Üst Kısım */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Görev Yönetimi</h1>
          <p className="mt-1 text-gray-600">Toplam {tasks.length} görev bulunmaktadır</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Görev ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
            <span className="absolute left-3 top-2.5">🔍</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200">
            + Yeni Görev Ekle
          </button>
        </div>
      </div>

      {/* Görev Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.durum)}`}>
                  {getStatusText(task.durum)}
                </span>
                <button className="text-gray-400 hover:text-gray-600">•••</button>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-xl text-blue-600 text-2xl">
                  📋
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{task.baslik}</h3>
                  <p className="text-gray-600 line-clamp-1">{task.aciklama}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-500">Başlangıç</p>
                  <p className="font-medium text-gray-800">
                    {new Date(task.baslangic_tarihi).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-500">Bitiş</p>
                  <p className="font-medium text-gray-800">
                    {new Date(task.bitis_tarihi).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200">
                  Düzenle
                </button>
                <button className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200">
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
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
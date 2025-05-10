'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import apiService, { Task } from '@/services/api';
import TaskModal from '@/components/modals/TaskModal';
import { toast } from 'react-hot-toast';

export default function Gorevler() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTasks();
      setTasks(response.data);
      setError(null);
    } catch (error) {
      console.error('Görevler yüklenirken hata:', error);
      setError('Beklenmeyen bir hata oluştu');
      toast.error('Görevler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSave = async (data: Partial<Task>) => {
    try {
      if (selectedTask) {
        await apiService.updateTask(selectedTask.id, data);
        toast.success('Görev başarıyla güncellendi');
      } else {
        console.log('Görev oluşturma verisi:', data); // Debug için veriyi logla
        const response = await apiService.createTask(data);
        console.log('Görev oluşturma yanıtı:', response); // Debug için yanıtı logla
        toast.success('Görev başarıyla oluşturuldu');
      }
      fetchTasks();
      setIsModalOpen(false);
      setSelectedTask(undefined);
    } catch (error: any) {
      console.error('Görev kaydedilirken hata detayı:', error.response?.data || error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         'Görev kaydedilirken bir hata oluştu';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteTask(id);
        setTasks(tasks.filter(task => task.id !== id));
        toast.success('Görev başarıyla silindi');
      } catch (error) {
        console.error('Görev silinirken hata:', error);
        toast.error('Görev silinirken bir hata oluştu');
      }
    }
  };

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Görevler</h1>
          <button
            onClick={() => {
              setSelectedTask(undefined);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Yeni Görev Ekle
          </button>
        </div>

        {tasks.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlangıç</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bitiş</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.baslik}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.arac_plaka}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.surucu_adi}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.durum === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
                          task.durum === 'devam_ediyor' ? 'bg-blue-100 text-blue-800' :
                          task.durum === 'tamamlandi' ? 'bg-green-100 text-green-800' :
                          task.durum === 'iptal_edildi' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.durum === 'beklemede' ? 'Beklemede' :
                           task.durum === 'devam_ediyor' ? 'Devam Ediyor' :
                           task.durum === 'tamamlandi' ? 'Tamamlandı' :
                           task.durum === 'iptal_edildi' ? 'İptal Edildi' :
                           task.durum}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(task.baslangic_tarihi).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(task.bitis_tarihi).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setIsModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">Henüz hiç görev eklenmemiş</p>
          </div>
        )}

        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTask(undefined);
            }}
            onSave={handleSave}
            task={selectedTask}
          />
        )}
      </div>
    </Layout>
  );
} 
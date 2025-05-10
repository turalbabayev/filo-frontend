'use client';

import { useState, useEffect } from 'react';
import apiService, { Driver } from '@/services/api';
import DriverModal from '@/components/modals/DriverModal';
import { toast } from 'react-hot-toast';
import Layout from '@/components/Layout';

export default function Suruculer() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDrivers();
      setDrivers(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Beklenmeyen bir hata oluştu');
      toast.error('Sürücüler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu sürücüyü silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteDriver(id);
        setDrivers(drivers.filter(driver => driver.id !== id));
        toast.success('Sürücü başarıyla silindi');
      } catch (error) {
        console.error('Error deleting driver:', error);
        toast.error('Sürücü silinirken bir hata oluştu');
      }
    }
  };

  const handleSave = async (data: Partial<Driver>) => {
    try {
      if (selectedDriver) {
        await apiService.updateDriver(selectedDriver.id, data);
      } else {
        await apiService.createDriver(data);
      }
      fetchDrivers();
      setIsModalOpen(false);
      toast.success(selectedDriver ? 'Sürücü başarıyla güncellendi' : 'Sürücü başarıyla kaydedildi');
    } catch (error) {
      console.error('Sürücü kaydedilirken hata:', error);
      toast.error('Sürücü kaydedilirken bir hata oluştu');
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
          <h1 className="text-2xl font-bold text-gray-900">Sürücüler</h1>
          <button
            onClick={() => {
              setSelectedDriver(undefined);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Yeni Sürücü Ekle
          </button>
        </div>

        {drivers.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soyad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ehliyet No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.ad}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.soyad}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.telefon}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.ehliyet_no}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {driver.aktif ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedDriver(driver);
                            setIsModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id)}
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
            <p className="text-gray-500 text-lg">Henüz hiç sürücü eklenmemiş</p>
          </div>
        )}

        {isModalOpen && (
          <DriverModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            driver={selectedDriver}
          />
        )}
      </div>
    </Layout>
  );
} 
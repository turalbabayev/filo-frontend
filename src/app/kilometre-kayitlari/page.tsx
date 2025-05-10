'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import apiService, { Mileage, Vehicle } from '@/services/api';
import { AxiosError } from 'axios';
import MileageModal from '@/components/modals/MileageModal';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function Mileages() {
  const [mileages, setMileages] = useState<Mileage[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMileage, setSelectedMileage] = useState<Mileage | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [mileagesResponse, vehiclesResponse] = await Promise.all([
          apiService.getMileages(),
          apiService.getVehicles()
        ]);
        setMileages(mileagesResponse.data);
        setVehicles(vehiclesResponse.data);
      } catch (err) {
        console.error('Veriler yüklenirken hata:', err);
        if (err instanceof AxiosError) {
          setError(`Veriler yüklenirken hata oluştu: ${err.response?.data?.detail || err.message}`);
        } else {
          setError('Beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (mileageData: Partial<Mileage>) => {
    try {
      if (selectedMileage) {
        const response = await apiService.updateMileage(selectedMileage.id, mileageData);
        setMileages(mileages.map(mileage => 
          mileage.id === selectedMileage.id ? response.data : mileage
        ));
      } else {
        const response = await apiService.createMileage(mileageData);
        setMileages([response.data, ...mileages]);
      }
      setIsModalOpen(false);
      setSelectedMileage(undefined);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu kilometre kaydını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await apiService.deleteMileage(id);
      setMileages(mileages.filter(mileage => mileage.id !== id));
      toast.success('Kilometre kaydı başarıyla silindi');
    } catch (error) {
      console.error('Kilometre kaydı silinirken hata:', error);
      toast.error('Kilometre kaydı silinirken bir hata oluştu');
    }
  };

  const filteredMileages = mileages.filter(mileage => {
    const searchTermLower = searchTerm.toLowerCase();
    const vehicle = vehicles.find(v => v.id === mileage.arac);
    const vehiclePlate = vehicle?.plaka.toLowerCase() || '';
    return (
      mileage.kilometre.toString().includes(searchTerm) ||
      vehiclePlate.includes(searchTermLower) ||
      mileage.aciklama?.toLowerCase().includes(searchTermLower)
    );
  });

  const content = (
    <div className="space-y-8">
      {/* Başlık ve Üst Kısım */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kilometre Kayıtları</h1>
          <p className="mt-1 text-gray-600">
            Toplam {mileages.length} kilometre kaydı bulunmaktadır
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Kayıt ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
            <span className="absolute left-3 top-2.5">🔍</span>
          </div>
          <button 
            onClick={() => {
              setSelectedMileage(undefined);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            + Yeni Kayıt Ekle
          </button>
        </div>
      </div>

      {/* Kilometre Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMileages.map((mileage) => {
          const vehicle = vehicles.find(v => v.id === mileage.arac);
          return (
            <div key={mileage.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {vehicle?.plaka || 'Araç bulunamadı'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMileage(mileage);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(mileage.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-xl text-blue-600 text-2xl">
                    🚗
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {mileage.kilometre.toLocaleString('tr-TR')} km
                    </h3>
                    <p className="text-gray-600">{vehicle?.marka} {vehicle?.model}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-sm text-gray-500">Tarih</p>
                    <p className="font-medium text-gray-800">
                      {new Date(mileage.tarih).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-sm text-gray-500">Açıklama</p>
                    <p className="font-medium text-gray-800 line-clamp-1">{mileage.aciklama || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MileageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMileage(undefined);
        }}
        onSave={handleSave}
        mileage={selectedMileage}
      />
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
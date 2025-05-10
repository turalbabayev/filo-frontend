'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import apiService, { Vehicle } from '@/services/api';
import { AxiosError } from 'axios';
import VehicleModal from '@/components/modals/VehicleModal';
import { toast } from 'react-hot-toast';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getVehicles();
      setVehicles(response.data);
    } catch (err) {
      console.error('Araçlar yüklenirken hata:', err);
      if (err instanceof AxiosError) {
        setError(`Araçlar yüklenirken hata oluştu: ${err.response?.data?.detail || err.message}`);
      } else {
        setError('Beklenmeyen bir hata oluştu');
      }
      toast.error('Araçlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSave = async (data: Partial<Vehicle>) => {
    try {
      if (selectedVehicle) {
        await apiService.updateVehicle(selectedVehicle.id, data);
      } else {
        await apiService.createVehicle(data);
      }
      fetchVehicles();
      setIsModalOpen(false);
      setSelectedVehicle(undefined);
      toast.success('Araç başarıyla kaydedildi');
    } catch (error) {
      console.error('Araç kaydedilirken hata:', error);
      alert('Araç kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteVehicle(id);
        setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
        toast.success('Araç başarıyla silindi');
      } catch (error) {
        console.error('Araç silinirken hata:', error);
        toast.error('Araç silinirken bir hata oluştu');
      }
    }
  };

  const handleUpdate = () => {
    fetchVehicles();
    toast.success('Araç başarıyla güncellendi');
    setIsModalOpen(false);
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plaka.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.marka.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const content = (
    <div className="space-y-8">
      {/* Başlık ve Üst Kısım */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Araç Filosu</h1>
          <p className="mt-1 text-gray-600">Toplam {vehicles.length} araç bulunmaktadır</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Araç ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
            <span className="absolute left-3 top-2.5">🔍</span>
          </div>
          <button 
            onClick={() => {
              setSelectedVehicle(undefined);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            + Yeni Araç Ekle
          </button>
        </div>
      </div>

      {/* Araç Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  vehicle.mevcut_durum === 'havuzda'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {vehicle.mevcut_durum}
                </span>
                <button className="text-gray-400 hover:text-gray-600">•••</button>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-xl text-blue-600 text-2xl">
                  🚗
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{vehicle.plaka}</h3>
                  <p className="text-gray-600">{vehicle.marka} {vehicle.model}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-500">Yıl</p>
                  <p className="font-medium text-gray-800">{vehicle.yil}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-500">Tip</p>
                  <p className="font-medium text-gray-800">{vehicle.tip}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200"
                >
                  Düzenle
                </button>
                <button 
                  onClick={() => handleDelete(vehicle.id)}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(undefined);
        }}
        onSave={handleSave}
        onUpdate={handleUpdate}
        vehicle={selectedVehicle}
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
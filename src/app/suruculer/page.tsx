'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import apiService, { Driver } from '@/services/api';
import { AxiosError } from 'axios';

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getDrivers();
        setDrivers(response.data);
      } catch (err) {
        console.error('Sürücüler yüklenirken hata:', err);
        if (err instanceof AxiosError) {
          setError(`Sürücüler yüklenirken hata oluştu: ${err.response?.data?.detail || err.message}`);
        } else {
          setError('Beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(driver =>
    driver.ad_soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.ehliyet_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const content = (
    <div className="space-y-8">
      {/* Başlık ve Üst Kısım */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sürücü Yönetimi</h1>
          <p className="mt-1 text-gray-600">Toplam {drivers.length} sürücü bulunmaktadır</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Sürücü ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
            <span className="absolute left-3 top-2.5">🔍</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200">
            + Yeni Sürücü Ekle
          </button>
        </div>
      </div>

      {/* Sürücü Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <div key={driver.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  driver.aktif
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {driver.aktif ? 'Aktif' : 'Pasif'}
                </span>
                <button className="text-gray-400 hover:text-gray-600">•••</button>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-xl text-blue-600 text-2xl">
                  👤
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{driver.ad_soyad}</h3>
                  <p className="text-gray-600">Ehliyet No: {driver.ehliyet_no}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium text-gray-800">{driver.telefon}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-500">Ehliyet Sınıfı</p>
                  <p className="font-medium text-gray-800">{driver.ehliyet_sinifi}</p>
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
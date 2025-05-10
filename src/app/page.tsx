'use client';

import Layout from './components/Layout';
import { FiTruck, FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi';

export default function Home() {
  const stats = [
    { title: 'Toplam Araç', value: '12', icon: FiTruck, color: 'bg-blue-500' },
    { title: 'Aktif Sürücü', value: '8', icon: FiUsers, color: 'bg-green-500' },
    { title: 'Günlük Görev', value: '15', icon: FiCalendar, color: 'bg-purple-500' },
    { title: 'Aylık Harcama', value: '₺45,250', icon: FiDollarSign, color: 'bg-yellow-500' },
  ];

  return (
    <Layout>
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Genel Bakış</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-sm font-medium text-gray-600">{stat.title}</h2>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FiTruck className="w-5 h-5 text-blue-500" />
                  <span className="ml-3 text-gray-700">34 ABC 123 plakalı araç bakıma gönderildi</span>
                </div>
                <span className="text-sm text-gray-500">2 saat önce</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FiUsers className="w-5 h-5 text-green-500" />
                  <span className="ml-3 text-gray-700">Ahmet Yılmaz yeni görev atandı</span>
                </div>
                <span className="text-sm text-gray-500">4 saat önce</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FiDollarSign className="w-5 h-5 text-yellow-500" />
                  <span className="ml-3 text-gray-700">Yakıt harcaması kaydedildi</span>
                </div>
                <span className="text-sm text-gray-500">6 saat önce</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import apiService, { Expense } from '@/services/api';
import { AxiosError } from 'axios';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getExpenses();
        setExpenses(response.data);
      } catch (err) {
        console.error('Harcamalar yüklenirken hata:', err);
        if (err instanceof AxiosError) {
          setError(`Harcamalar yüklenirken hata oluştu: ${err.response?.data?.detail || err.message}`);
        } else {
          setError('Beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter(expense =>
    expense.aciklama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExpenseIcon = (kategori: string) => {
    switch (kategori.toLowerCase()) {
      case 'yakit':
        return '⛽';
      case 'bakim':
        return '🔧';
      case 'sigorta':
        return '📄';
      case 'vergi':
        return '💰';
      default:
        return '💳';
    }
  };

  const content = (
    <div className="space-y-8">
      {/* Başlık ve Üst Kısım */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Harcama Yönetimi</h1>
          <p className="mt-1 text-gray-600">
            Toplam {expenses.length} harcama kaydı bulunmaktadır
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Harcama ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
            <span className="absolute left-3 top-2.5">🔍</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200">
            + Yeni Harcama Ekle
          </button>
        </div>
      </div>

      {/* Harcama Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                  {expense.kategori}
                </span>
                <button className="text-gray-400 hover:text-gray-600">•••</button>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-xl text-blue-600 text-2xl">
                  {getExpenseIcon(expense.kategori)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {expense.tutar.toLocaleString('tr-TR')} ₺
                  </h3>
                  <p className="text-gray-600 line-clamp-1">{expense.aciklama}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-500">Tarih</p>
                  <p className="font-medium text-gray-800">
                    {new Date(expense.tarih).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-500">Araç</p>
                  <p className="font-medium text-gray-800">{expense.arac_plaka}</p>
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
'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/services/api';
import apiService from '@/services/api';
import Layout from '@/components/Layout';
import { AxiosError } from 'axios';

export default function ExpensesPage() {
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
        console.error('Harcama verileri yüklenirken hata:', err);
        if (err instanceof AxiosError) {
          setError(err.response?.data?.detail || err.message);
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
    (expense.aciklama?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    expense.tip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.tutar.toString().includes(searchTerm)
  );

  const getExpenseTypeColor = (tip: string) => {
    switch (tip) {
      case 'bakim':
        return 'bg-blue-100 text-blue-800';
      case 'kasko':
        return 'bg-purple-100 text-purple-800';
      case 'yakıt':
        return 'bg-green-100 text-green-800';
      case 'lastik':
        return 'bg-yellow-100 text-yellow-800';
      case 'tamir':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Harcamalar</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Yeni Harcama
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Harcamalarda ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExpenseTypeColor(expense.tip)}`}>
                  {expense.tip}
                </span>
                <p className="mt-2 text-2xl font-bold text-gray-800">
                  {expense.tutar.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">•••</button>
            </div>

            {expense.aciklama && (
              <p className="text-gray-600 mb-4">{expense.aciklama}</p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {new Date(expense.tarih).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span>Araç ID: {expense.arac}</span>
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
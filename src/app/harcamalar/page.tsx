'use client';

import { useState, useEffect } from 'react';
import { Expense, Vehicle } from '@/services/api';
import apiService from '@/services/api';
import Layout from '@/components/Layout';
import ExpenseModal from '@/components/modals/ExpenseModal';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [expensesResponse, vehiclesResponse] = await Promise.all([
          apiService.getExpenses(),
          apiService.getVehicles()
        ]);
        setExpenses(expensesResponse.data);
        setVehicles(vehiclesResponse.data);
      } catch (err) {
        console.error('Veriler yüklenirken hata:', err);
        if (err instanceof AxiosError) {
          setError(err.response?.data?.detail || err.message);
        } else {
          setError('Beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (expenseData: Partial<Expense>) => {
    try {
      if (selectedExpense) {
        const response = await apiService.updateExpense(selectedExpense.id, expenseData);
        setExpenses(expenses.map(expense => 
          expense.id === selectedExpense.id ? response.data : expense
        ));
      } else {
        const response = await apiService.createExpense(expenseData);
        setExpenses([response.data, ...expenses]);
      }
      setIsModalOpen(false);
      setSelectedExpense(undefined);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu harcamayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await apiService.deleteExpense(id);
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast.success('Harcama başarıyla silindi');
    } catch (error) {
      console.error('Harcama silinirken hata:', error);
      toast.error('Harcama silinirken bir hata oluştu');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const searchTermLower = searchTerm.toLowerCase();
    const vehiclePlate = vehicles.find(v => v.id === expense.arac)?.plaka.toLowerCase() || '';
    return (
      expense.aciklama?.toLowerCase().includes(searchTermLower) ||
      expense.tip.toLowerCase().includes(searchTermLower) ||
      expense.tutar.toString().includes(searchTerm) ||
      vehiclePlate.includes(searchTermLower)
    );
  });

  const getExpenseTypeLabel = (tip: string) => {
    const types: { [key: string]: string } = {
      'bakim': 'Bakım',
      'kasko': 'Kasko',
      'yakıt': 'Yakıt',
      'lastik': 'Lastik',
      'tamir': 'Tamir'
    };
    return types[tip] || tip;
  };

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
        <button 
          onClick={() => {
            setSelectedExpense(undefined);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
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
        {filteredExpenses.map((expense) => {
          const vehicle = vehicles.find(v => v.id === expense.arac);
          return (
            <div
              key={expense.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExpenseTypeColor(expense.tip)}`}>
                    {getExpenseTypeLabel(expense.tip)}
                  </span>
                  <p className="mt-2 text-2xl font-bold text-gray-800">
                    {expense.tutar.toLocaleString('tr-TR')} ₺
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedExpense(expense);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
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
                <span>{vehicle?.plaka || 'Araç bulunamadı'}</span>
              </div>
            </div>
          );
        })}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(undefined);
        }}
        onSave={handleSave}
        expense={selectedExpense}
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
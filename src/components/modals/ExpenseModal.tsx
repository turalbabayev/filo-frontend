import { useState, useEffect } from 'react';
import { Expense, Vehicle } from '@/services/api';
import apiService from '@/services/api';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

type ExpenseType = 'bakim' | 'kasko' | 'yakıt' | 'lastik' | 'tamir';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Partial<Expense>) => Promise<void>;
  expense?: Expense;
}

interface ExpenseFormData {
  arac?: number;
  tarih: string;
  tip: ExpenseType;
  tutar: number;
  aciklama: string;
}

export default function ExpenseModal({ isOpen, onClose, onSave, expense }: ExpenseModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    arac: undefined,
    tarih: new Date().toISOString().split('T')[0],
    tip: 'bakim',
    tutar: 0,
    aciklama: ''
  });

  const expenseTypes: { value: ExpenseType; label: string }[] = [
    { value: 'bakim', label: 'Bakım' },
    { value: 'kasko', label: 'Kasko' },
    { value: 'yakıt', label: 'Yakıt' },
    { value: 'lastik', label: 'Lastik' },
    { value: 'tamir', label: 'Tamir' }
  ];

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await apiService.getVehicles();
        setVehicles(response.data);
      } catch (error) {
        console.error('Araçlar yüklenirken hata:', error);
        toast.error('Araçlar yüklenirken bir hata oluştu');
      }
    };

    fetchVehicles();
  }, []);

  useEffect(() => {
    if (expense) {
      setFormData({
        arac: expense.arac,
        tarih: expense.tarih,
        tip: expense.tip as ExpenseType,
        tutar: expense.tutar,
        aciklama: expense.aciklama || ''
      });
    } else {
      setFormData({
        arac: undefined,
        tarih: new Date().toISOString().split('T')[0],
        tip: 'bakim',
        tutar: 0,
        aciklama: ''
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.arac) {
      toast.error('Lütfen bir araç seçin');
      return;
    }

    if (!formData.tarih) {
      toast.error('Lütfen bir tarih seçin');
      return;
    }

    if (formData.tutar <= 0) {
      toast.error('Lütfen geçerli bir tutar girin');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
      toast.success(expense ? 'Harcama güncellendi' : 'Harcama eklendi');
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorData = error.response?.data;
        if (typeof errorData === 'object' && errorData !== null) {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${messages}`)
            .join('\n');
          toast.error(errorMessages);
        } else {
          toast.error('Harcama kaydedilirken bir hata oluştu');
        }
      } else {
        console.error('Beklenmeyen hata:', error);
        toast.error('Beklenmeyen bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          {expense ? 'Harcama Düzenle' : 'Yeni Harcama'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Araç
            </label>
            <select
              value={formData.arac}
              onChange={(e) => setFormData({ ...formData, arac: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Araç Seçin</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plaka} - {vehicle.marka} {vehicle.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarih
            </label>
            <input
              type="date"
              value={formData.tarih}
              onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harcama Tipi
            </label>
            <select
              value={formData.tip}
              onChange={(e) => setFormData({ ...formData, tip: e.target.value as ExpenseType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {expenseTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tutar (₺)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.tutar}
              onChange={(e) => setFormData({ ...formData, tutar: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Harcama açıklaması..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : expense ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 
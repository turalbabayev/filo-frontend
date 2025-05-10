'use client';

import { useState, useEffect } from 'react';
import { Mileage, Vehicle } from '@/services/api';
import apiService from '@/services/api';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface MileageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Mileage>) => Promise<void>;
  mileage?: Mileage;
}

interface MileageFormData {
  arac: number;
  kilometre: number;
  tarih: string;
  aciklama: string;
}

export default function MileageModal({ isOpen, onClose, onSave, mileage }: MileageModalProps) {
  const [formData, setFormData] = useState<MileageFormData>({
    arac: 0,
    kilometre: 0,
    tarih: new Date().toISOString().split('T')[0],
    aciklama: '',
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mileage) {
      setFormData({
        arac: mileage.arac,
        kilometre: mileage.kilometre,
        tarih: mileage.tarih.split('T')[0],
        aciklama: mileage.aciklama,
      });
    } else {
      setFormData({
        arac: 0,
        kilometre: 0,
        tarih: new Date().toISOString().split('T')[0],
        aciklama: '',
      });
    }
  }, [mileage]);

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

    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.arac) {
      toast.error('Lütfen bir araç seçin');
      return;
    }

    if (formData.kilometre <= 0) {
      toast.error('Kilometre değeri 0\'dan büyük olmalıdır');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      toast.success(mileage ? 'Kilometre kaydı güncellendi' : 'Yeni kilometre kaydı oluşturuldu');
      onClose();
    } catch (error) {
      console.error('Kilometre kaydı kaydedilirken hata:', error);
      if (error instanceof AxiosError) {
        toast.error(`Hata: ${error.response?.data?.detail || error.message}`);
      } else {
        toast.error('Kilometre kaydı kaydedilirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mileage ? 'Kilometre Kaydını Düzenle' : 'Yeni Kilometre Kaydı'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="arac" className="block text-sm font-medium text-gray-700">
            Araç
          </label>
          <select
            id="arac"
            value={formData.arac}
            onChange={(e) => setFormData({ ...formData, arac: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Araç seçin</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plaka} - {vehicle.marka} {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="kilometre" className="block text-sm font-medium text-gray-700">
            Kilometre
          </label>
          <input
            type="number"
            id="kilometre"
            value={formData.kilometre}
            onChange={(e) => setFormData({ ...formData, kilometre: Number(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="0"
          />
        </div>

        <div>
          <label htmlFor="tarih" className="block text-sm font-medium text-gray-700">
            Tarih
          </label>
          <input
            type="date"
            id="tarih"
            value={formData.tarih}
            onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700">
            Açıklama
          </label>
          <textarea
            id="aciklama"
            value={formData.aciklama}
            onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : mileage ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </form>
    </Modal>
  );
} 
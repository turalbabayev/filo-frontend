'use client';

import { useState, useEffect } from 'react';
import { Vehicle } from '@/services/api';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Vehicle>) => void;
  vehicle?: Vehicle;
}

export default function VehicleModal({ isOpen, onClose, onSave, vehicle }: VehicleModalProps) {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plaka: '',
    marka: '',
    model: '',
    yil: new Date().getFullYear(),
    tip: '',
    kaynak_tipi: 'ozmal',
    mevcut_durum: 'havuzda',
    aciklama: ''
  });

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    }
  }, [vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{vehicle ? 'Aracı Düzenle' : 'Yeni Araç'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Plaka</label>
            <input
              type="text"
              value={formData.plaka}
              onChange={(e) => setFormData({ ...formData, plaka: e.target.value.toUpperCase() })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Marka</label>
            <input
              type="text"
              value={formData.marka}
              onChange={(e) => setFormData({ ...formData, marka: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Yıl</label>
            <input
              type="number"
              value={formData.yil}
              onChange={(e) => setFormData({ ...formData, yil: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tip</label>
            <input
              type="text"
              value={formData.tip}
              onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Kaynak Tipi</label>
            <select
              value={formData.kaynak_tipi}
              onChange={(e) => setFormData({ ...formData, kaynak_tipi: e.target.value as 'ozmal' | 'kiralik' })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            >
              <option value="ozmal">Özmal</option>
              <option value="kiralik">Kiralık</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Durum</label>
            <select
              value={formData.mevcut_durum}
              onChange={(e) => setFormData({ ...formData, mevcut_durum: e.target.value as Vehicle['mevcut_durum'] })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            >
              <option value="havuzda">Havuzda</option>
              <option value="kullanımda">Kullanımda</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama</label>
            <textarea
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {vehicle ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
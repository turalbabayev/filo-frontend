import { useState, useEffect } from 'react';
import { Driver } from '@/services/api';
import Modal from '@/components/ui/Modal';

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Driver>) => Promise<void>;
  driver?: Driver;
}

export default function DriverModal({ isOpen, onClose, onSave, driver }: DriverModalProps) {
  const [formData, setFormData] = useState<Partial<Driver>>({
    ad: '',
    soyad: '',
    telefon: '',
    ehliyet_no: '',
    aktif: true
  });

  useEffect(() => {
    if (driver) {
      setFormData(driver);
    } else {
      setFormData({
        ad: '',
        soyad: '',
        telefon: '',
        ehliyet_no: '',
        aktif: true
      });
    }
  }, [driver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {driver ? 'Sürücü Düzenle' : 'Yeni Sürücü Ekle'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="ad" className="block text-sm font-medium text-gray-700">
                Ad
              </label>
              <input
                type="text"
                id="ad"
                value={formData.ad}
                onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="soyad" className="block text-sm font-medium text-gray-700">
                Soyad
              </label>
              <input
                type="text"
                id="soyad"
                value={formData.soyad}
                onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">
                Telefon
              </label>
              <input
                type="tel"
                id="telefon"
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="ehliyet_no" className="block text-sm font-medium text-gray-700">
                Ehliyet No
              </label>
              <input
                type="text"
                id="ehliyet_no"
                value={formData.ehliyet_no}
                onChange={(e) => setFormData({ ...formData, ehliyet_no: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="aktif"
                checked={formData.aktif}
                onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="aktif" className="ml-2 block text-sm text-gray-900">
                Aktif
              </label>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:text-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            >
              {driver ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 
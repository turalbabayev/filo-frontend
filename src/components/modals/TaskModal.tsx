import { useState, useEffect } from 'react';
import { Task, Vehicle, Driver } from '@/services/api';
import Modal from '@/components/ui/Modal';
import apiService from '@/services/api';
import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Task>) => Promise<void>;
  task?: Task;
}

export default function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    baslik: '',
    aciklama: '',
    durum: 'beklemede',
    baslangic_tarihi: new Date().toISOString().split('T')[0],
    bitis_tarihi: new Date().toISOString().split('T')[0],
    arac: undefined,
    surucu: undefined
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesResponse, driversResponse] = await Promise.all([
          apiService.getVehicles(),
          apiService.getDrivers()
        ]);
        setVehicles(vehiclesResponse.data);
        setDrivers(driversResponse);
        setLoading(false);
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (task) {
      console.log('Düzenlenen görev:', task);
      setFormData({
        baslik: task.baslik,
        aciklama: task.aciklama,
        durum: task.durum,
        baslangic_tarihi: task.baslangic_tarihi.split('T')[0],
        bitis_tarihi: task.bitis_tarihi.split('T')[0],
        arac: task.arac,
        surucu: task.surucu
      });
    } else {
      // Yeni görev için varsayılan değerler
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        baslik: '',
        aciklama: '',
        durum: 'beklemede',
        baslangic_tarihi: today,
        bitis_tarihi: today,
        arac: undefined,
        surucu: undefined
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form verilerini kontrol et
    if (!formData.baslik?.trim()) {
      toast.error('Başlık gereklidir');
      return;
    }

    if (!formData.arac) {
      toast.error('Araç seçimi gereklidir');
      return;
    }

    if (!formData.surucu) {
      toast.error('Sürücü seçimi gereklidir');
      return;
    }

    if (!formData.baslangic_tarihi || !formData.bitis_tarihi) {
      toast.error('Başlangıç ve bitiş tarihleri gereklidir');
      return;
    }

    // Bitiş tarihi başlangıç tarihinden önce olamaz
    if (formData.bitis_tarihi < formData.baslangic_tarihi) {
      toast.error('Bitiş tarihi başlangıç tarihinden önce olamaz');
      return;
    }

    const submissionData = {
      ...formData,
      baslik: formData.baslik.trim(),
      aciklama: formData.aciklama?.trim() || '',
      durum: formData.durum || 'beklemede',
      baslangic_tarihi: formData.baslangic_tarihi,
      bitis_tarihi: formData.bitis_tarihi,
      arac: formData.arac,
      surucu: formData.surucu
    };

    console.log('Gönderilecek form verisi:', submissionData);

    try {
      await onSave(submissionData);
      onClose();
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorData = error.response?.data;
        if (typeof errorData === 'object' && errorData !== null) {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${messages}`)
            .join('\n');
          toast.error(errorMessages);
        } else {
          toast.error('Görev kaydedilirken bir hata oluştu');
        }
        console.error('Form gönderim hatası:', errorData);
      } else {
        console.error('Beklenmeyen hata:', error);
        toast.error('Beklenmeyen bir hata oluştu');
      }
    }
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {task ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="baslik" className="block text-sm font-medium text-gray-700">
                Başlık
              </label>
              <input
                type="text"
                id="baslik"
                value={formData.baslik}
                onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                required
              />
            </div>
            <div>
              <label htmlFor="arac" className="block text-sm font-medium text-gray-700">
                Araç
              </label>
              <select
                id="arac"
                value={formData.arac || ''}
                onChange={(e) => setFormData({ ...formData, arac: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
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
              <label htmlFor="surucu" className="block text-sm font-medium text-gray-700">
                Sürücü
              </label>
              <select
                id="surucu"
                value={formData.surucu || ''}
                onChange={(e) => setFormData({ ...formData, surucu: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Sürücü Seçin</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.ad} {driver.soyad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="durum" className="block text-sm font-medium text-gray-700">
                Durum
              </label>
              <select
                id="durum"
                value={formData.durum}
                onChange={(e) => setFormData({ ...formData, durum: e.target.value as Task['durum'] })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="beklemede">Beklemede</option>
                <option value="devam_ediyor">Devam Ediyor</option>
                <option value="tamamlandi">Tamamlandı</option>
                <option value="iptal_edildi">İptal Edildi</option>
              </select>
            </div>
            <div>
              <label htmlFor="baslangic_tarihi" className="block text-sm font-medium text-gray-700">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                id="baslangic_tarihi"
                value={formData.baslangic_tarihi}
                onChange={(e) => setFormData({ ...formData, baslangic_tarihi: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="bitis_tarihi" className="block text-sm font-medium text-gray-700">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                id="bitis_tarihi"
                value={formData.bitis_tarihi}
                onChange={(e) => setFormData({ ...formData, bitis_tarihi: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
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
              {task ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 
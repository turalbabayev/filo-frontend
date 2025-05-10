import Image from "next/image";

export default function Home() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h1>Hoşgeldiniz! 🚗</h1>
      <h2>Filo Yönetim Sistemi Frontend Başarıyla Çalışıyor</h2>
      <p>Artık canlıda modern arayüz geliştirmeye başlayabiliriz.</p>
    </main>
  );
}

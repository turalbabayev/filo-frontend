'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FiHome, FiTruck, FiUsers, FiCalendar, FiBarChart2, FiDollarSign, FiMenu, FiX, FiLogOut } from 'react-icons/fi';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
      setIsLoading(false);

      if (!token && pathname !== '/login') {
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  const menuItems = [
    { path: '/', label: 'Ana Sayfa', icon: FiHome },
    { path: '/araclar', label: 'Araçlar', icon: FiTruck },
    { path: '/suruculer', label: 'Sürücüler', icon: FiUsers },
    { path: '/gorevler', label: 'Görevler', icon: FiCalendar },
    { path: '/kilometre', label: 'Kilometre Takibi', icon: FiBarChart2 },
    { path: '/harcamalar', label: 'Harcamalar', icon: FiDollarSign },
  ];

  // Loading durumunda veya login sayfasındaysa direkt içeriği göster
  if (isLoading || pathname === '/login') {
    return <>{children}</>;
  }

  // Giriş yapılmamışsa ve login sayfasında değilse null döndür
  if (!isLoggedIn && pathname !== '/login') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-white border-r border-gray-200`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Filo Yönetimi</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 w-full"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`p-4 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2">
            <FiMenu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Filo Yönetimi</h1>
        </div>
        
        {/* Page Content */}
        <main className="container mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/araclar', label: 'Araçlar', icon: '🚗' },
    { href: '/suruculer', label: 'Sürücüler', icon: '👤' },
    { href: '/gorevler', label: 'Görevler', icon: '📋' },
    { href: '/harcamalar', label: 'Harcamalar', icon: '💰' },
    { href: '/kilometre-kayitlari', label: 'Kilometre Kayıtları', icon: '📍' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white w-64 flex-shrink-0 ${isSidebarOpen ? '' : 'hidden'}`}>
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-6">Filo Yönetimi</h2>
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-700 ${
                      pathname === item.href ? 'bg-gray-700' : ''
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Navbar */}
        <div className="bg-white shadow">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-600"
            >
              {isSidebarOpen ? '◀️' : '▶️'}
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
                  document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
                  window.location.href = '/login';
                }}
                className="text-red-600 hover:text-red-700"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
} 
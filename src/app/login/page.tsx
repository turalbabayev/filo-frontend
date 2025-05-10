'use client';

import { useState } from 'react';
import axios, { AxiosError } from 'axios';

interface LoginResponse {
  access: string;
  refresh: string;
}

const API_URL = 'https://web-production-dd05.up.railway.app';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const apiUrl = `${API_URL}/api/token/`;
    console.log('Login attempt with:', { apiUrl, username });
    
    try {
      const response = await axios.post<LoginResponse>(
        apiUrl,
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Login response:', response.data);
      
      if (response.data.access && response.data.refresh) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        throw new Error('Token alınamadı');
      }

    } catch (error) {
      console.error('Login error details:', {
        error,
        response: error instanceof AxiosError ? error.response?.data : null,
        status: error instanceof AxiosError ? error.response?.status : null
      });

      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           'Kullanıcı adı veya şifre hatalı!';
        setError(`Giriş başarısız: ${errorMessage}`);
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Giriş Yap</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-2">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
} 
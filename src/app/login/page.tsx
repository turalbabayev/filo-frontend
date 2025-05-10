'use client';

import { useState } from 'react';
import axios, { AxiosError } from 'axios';

interface LoginResponse {
  access: string;
  refresh: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      const response = await axios.post<LoginResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/token/`,
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Login response:', response.data);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
      setError(null);
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           'Kullanıcı adı veya şifre hatalı!';
        setError(`Giriş başarısız: ${errorMessage}`);
        console.log('Error response:', error.response?.data);
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
      setSuccess(null);
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
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
} 
import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Kontrol Paneli
        </h1>
        <p className="text-gray-600 mt-2">
          Hoş geldin, {user?.name}! Hesabını buradan yönetebilirsin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">İlanlarım</h3>
          <p className="text-gray-600 text-sm">
            Aktif ilanlarını görüntüle ve yönet
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Profil</h3>
          <p className="text-gray-600 text-sm">
            Profil bilgilerini düzenle
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Ödemeler</h3>
          <p className="text-gray-600 text-sm">
            Ödeme geçmişini görüntüle
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Profile
            </h1>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                        <p className="mt-1 text-gray-900">{user?.name} {user?.surname}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-posta</label>
                        <p className="mt-1 text-gray-900">{user?.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefon</label>
                        <p className="mt-1 text-gray-900">{user?.phoneNumber || 'Telefon numarası belirtilmemiş'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cinsiyet</label>
                        <p className="mt-1 text-gray-900">
                            {user?.gender === 'MALE' && 'Erkek'}
                            {user?.gender === 'FEMALE' && 'Kadın'}
                            {!user?.gender && 'Belirtilmemiş'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
                        <p className="mt-1 text-gray-900">{user?.birthdate || 'Belirtilmemiş'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hesap Oluşturma Tarihi</label>
                        <p className="mt-1 text-gray-900">{user?.accountCreationDate || 'Bilinmiyor'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hesap Durumu</label>
                        <div className="mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user?.accountStatus === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : user?.accountStatus === 'SUSPENDED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {user?.accountStatus === 'ACTIVE' && 'Aktif'}
                                {user?.accountStatus === 'SUSPENDED' && 'Askıya Alınmış'}
                                {user?.accountStatus === 'PENDING_VERIFICATION' && 'Doğrulama Bekliyor'}
                                {!user?.accountStatus && 'Bilinmiyor'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hesap Doğrulaması</label>
                        <div className="mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user?.accountVerified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {user?.accountVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Satış Yetkisi</label>
                        <div className="mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user?.canSell 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {user?.canSell ? 'Satış Yapabilir' : 'Satış Yapamaz'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Profili Düzenle
                        </button>
                        <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                            Şifreyi Değiştir
                        </button>
                        {!user?.accountVerified && (
                            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                                Hesabı Doğrula
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
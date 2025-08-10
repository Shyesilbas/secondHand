import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Profil
            </h1>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ad</label>
                        <p className="mt-1 text-gray-900">{user?.name}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-posta</label>
                        <p className="mt-1 text-gray-900">{user?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
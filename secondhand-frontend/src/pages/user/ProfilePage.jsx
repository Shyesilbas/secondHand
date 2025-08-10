import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../features/users/services/userService';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handlePhoneUpdate = async () => {
        const cleanPhone = newPhoneNumber.replace(/\D/g, '');
        
        if (!newPhoneNumber.trim()) {
            alert('Lütfen telefon numaranızı girin');
            return;
        }

        if (cleanPhone.length !== 11) {
            alert('Telefon numarası 11 haneli olmalıdır');
            return;
        }

        setIsUpdating(true);
        try {
            await userService.updatePhone({ newPhoneNumber: cleanPhone });
            
            // Update user state and localStorage with new phone number
            updateUser({ phoneNumber: cleanPhone });
            
            // Close modal and reset form
            setShowPhoneModal(false);
            setNewPhoneNumber('');
            alert('Telefon numarası başarıyla güncellendi!');
        } catch (error) {
            alert(error.response?.data?.message || error.message || 'Telefon numarası güncellenirken bir hata oluştu');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Profile
            </h1>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-gray-900">{user?.name} {user?.surname}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-mail</label>
                        <p className="mt-1 text-gray-900">{user?.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="mt-1 flex items-center justify-between">
                            <p className="text-gray-900">{user?.phoneNumber || 'Telefon numarası belirtilmemiş'}</p>
                            <button
                                onClick={() => {
                                    setNewPhoneNumber(user?.phoneNumber || '');
                                    setShowPhoneModal(true);
                                }}
                                className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Update phone number"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <p className="mt-1 text-gray-900">
                            {user?.gender}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Birthdate</label>
                        <p className="mt-1 text-gray-900">{user?.birthdate}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Creation Date</label>
                        <p className="mt-1 text-gray-900">{user?.accountCreationDate}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Status</label>
                        <div className="mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user?.accountStatus === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : user?.accountStatus === 'SUSPENDED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>{user?.accountStatus ? 'ACTIVE' : 'SUSPENDED'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Verification</label>
                        <div className="mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user?.accountVerified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>{user?.accountVerified ? 'Verified' : 'Unverified'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Can Sell</label>
                        <div className="mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user?.canSell 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>{user?.canSell ? 'Yes' : 'No'}
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
                            Change Password
                        </button>
                        {!user?.accountVerified && (
                            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                                Verify Account
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Phone Update Modal */}
            {showPhoneModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Update Phone Number</h3>
                            <button
                                onClick={() => setShowPhoneModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Phone Number
                            </label>
                            <input
                                type="tel"
                                value={newPhoneNumber}
                                onChange={(e) => setNewPhoneNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="05321234567"
                                maxLength="11"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                11 haneli telefon numarası
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowPhoneModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePhoneUpdate}
                                disabled={isUpdating}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {isUpdating ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </div>
                                ) : (
                                    'Update'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../features/users/services/userService';
import { ROUTES } from '../../constants/routes';
import { UserDTO, UpdatePhoneRequestDTO } from '../../types/users';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { showSuccess, showError } = useToast();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneFormData, setPhoneFormData] = useState({
        ...UpdatePhoneRequestDTO
    });
    const [isUpdating, setIsUpdating] = useState(false);

    const handlePhoneUpdate = async () => {
        const cleanPhone = phoneFormData.newPhone.replace(/\D/g, '');
        
        if (!phoneFormData.newPhone.trim()) {
            showError('Please enter your phone number');
            return;
        }

        if (cleanPhone.length !== 11) {
            showError('Length must be 11');
            return;
        }

        setIsUpdating(true);
        try {
            await userService.updatePhone({
                newPhone: cleanPhone,
                password: phoneFormData.password
            });
            
            updateUser({ phoneNumber: cleanPhone });
            
            setShowPhoneModal(false);
            setPhoneFormData({ ...UpdatePhoneRequestDTO });
            showSuccess('Phone number updated successfully!');
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'An error occurred while updating phone number');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Profile
            </h1>

            {/* Verification Warning */}
            {!user?.accountVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Account Not Verified
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Your account is not verified yet. Please verify your email address to access all features.</p>
                            </div>
                            <div className="mt-4">
                                <div className="-mx-2 -my-1.5 flex">
                                    <button
                                        onClick={() => navigate(ROUTES.VERIFY_ACCOUNT)}
                                        className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                                    >
                                        Verify Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            <p className="text-gray-900">{user?.phoneNumber || 'Undefined'}</p>
                            <button
                                onClick={() => {
                                    setPhoneFormData({
                                        ...UpdatePhoneRequestDTO,
                                        newPhone: user?.phoneNumber || ''
                                    });
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
                        <div className="mt-1 flex items-center justify-between">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user?.accountVerified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>{user?.accountVerified ? 'Verified' : 'Unverified'}
                            </span>
                            {!user?.accountVerified && (
                                <button
                                    onClick={() => navigate(ROUTES.VERIFY_ACCOUNT)}
                                    className="ml-2 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                    title="Verify your account"
                                >
                                    Verify Now
                                </button>
                            )}
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

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phoneFormData.newPhone}
                                    onChange={(e) => setPhoneFormData(prev => ({
                                        ...prev,
                                        newPhone: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="05321234567"
                                    maxLength="11"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter your new phone number
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={phoneFormData.password}
                                    onChange={(e) => setPhoneFormData(prev => ({
                                        ...prev,
                                        password: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your password"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Confirm with your current password
                                </p>
                            </div>
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
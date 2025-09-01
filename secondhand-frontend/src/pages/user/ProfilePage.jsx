import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { userService } from '../../features/users/services/userService';
import { ROUTES } from '../../constants/routes';
import { UpdatePhoneRequestDTO } from '../../types/users';
import PhoneUpdateModal from '../../components/modals/PhoneUpdateModal.jsx';
import { formatDateTime } from '../../utils/formatters';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const notification = useNotification();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneFormData, setPhoneFormData] = useState({ ...UpdatePhoneRequestDTO });
    const [isUpdating, setIsUpdating] = useState(false);

    const handlePhoneUpdate = async () => {
        const cleanPhone = phoneFormData.newPhone.replace(/\D/g, '');

        if (!phoneFormData.newPhone.trim()) {
            notification.showError('Error', 'Please enter a phone number');
            return;
        }

        if (cleanPhone.length !== 11) {
            notification.showError('Error', 'Phone number must be 11 digits');
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
            notification.showSuccess('Success', 'Phone number updated successfully. Please refresh the page to see the changes.');
        } catch (error) {
            notification.showError('Error', error.response?.data?.message || error.message || 'An error occurred while updating phone number. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString) => formatDateTime(dateString);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

            {!user?.accountVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Account Not Verified</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Please verify your email to access all features.</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => navigate(ROUTES.VERIFY_ACCOUNT)}
                                    className="bg-yellow-50 px-2 py-1 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100"
                                >
                                    Verify Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-gray-900">{user?.name || 'Undefined'} {user?.surname || ''}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-mail</label>
                        <p className="mt-1 text-gray-900">{user?.email || 'Undefined'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="mt-1 flex items-center justify-between">
                            <p className="text-gray-900">{user?.phoneNumber || 'Undefined'}</p>
                            <button
                                onClick={() => {
                                    setPhoneFormData({ ...UpdatePhoneRequestDTO, newPhone: user?.phoneNumber || '' });
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
                        <p className="mt-1 text-gray-900">{user?.gender || 'Undefined'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Birthdate</label>
                        <p className="mt-1 text-gray-900">{user?.birthdate || 'Undefined'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Status</label>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user?.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                user?.accountStatus === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                        }`}>
                            {user?.accountStatus || 'Undefined'}
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Verified</label>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user?.accountVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {user?.accountVerified ? 'Verified' : 'Unverified'}
                        </span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Creation Date</label>
                        <p className="mt-1 text-gray-900">{formatDate(user?.accountCreationDate)}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                {!user?.accountVerified && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                            Verify Account
                        </button>
                    </div>
                )}
            </div>

                    <Link
                        to={ROUTES.AGREEMENTS_ALL}
                        className="flex items-center justify-between p-4 border rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Agreements</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>

            {/* Phone Update Modal */}
            {showPhoneModal && (
                <PhoneUpdateModal
                    isOpen={showPhoneModal}
                    formData={phoneFormData}
                    handleChange={(field, value) => setPhoneFormData(prev => ({ ...prev, [field]: value }))}
                    submit={handlePhoneUpdate}
                    closeModal={() => setShowPhoneModal(false)}
                    isUpdating={isUpdating}
                />
            )}
        </div>
    );
};

export default ProfilePage;

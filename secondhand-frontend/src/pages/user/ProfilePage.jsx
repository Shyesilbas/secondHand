import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUpdatePhone } from '../../features/users/hooks/useUpdatePhone.js';
import PhoneUpdateModal from '../../components/modals/PhoneUpdateModal.jsx';
import {  formatDateTime } from '../../utils/formatters';

const ProfilePage = () => {
    const { user } = useAuth();
    const { openModal, Modal: { isOpen, formData, handleChange, submit, closeModal, isUpdating } } = useUpdatePhone();
    const formatDate = (dateString) => formatDateTime(dateString);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-gray-900">{user?.name || 'Undefined'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Surname</label>
                        <p className="mt-1 text-gray-900">{user?.surname || 'Undefined'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-gray-900">{user?.email || 'Undefined'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <p className="mt-1 text-gray-900">{user?.gender || 'Undefined'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Status</label>
                        <p className="mt-1 text-gray-900">{user?.accountStatus || 'Undefined'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Creation Date</label>
                        <p className="mt-1 text-gray-900">{formatDate(user?.accountCreationDate)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Verified</label>
                        <p className="mt-1 text-gray-900">{user?.accountVerified}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="mt-1 flex items-center justify-between">
                            <p className="text-gray-900">{user?.phoneNumber || 'Undefined'}</p>
                            <button
                                onClick={() => openModal(user?.phoneNumber)}
                                className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Update phone number"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <PhoneUpdateModal
                isOpen={isOpen}
                formData={formData}
                handleChange={handleChange}
                submit={submit}
                closeModal={closeModal}
                isUpdating={isUpdating}
            />
        </div>
    );
};

export default ProfilePage;

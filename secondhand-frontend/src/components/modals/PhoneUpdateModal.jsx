import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { useUpdatePhone } from '../../features/users/hooks/useUpdatePhone.js';

const PhoneUpdateModal = ({ isOpen, formData, handleChange, submit, closeModal, isUpdating }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Update Phone Number</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Phone Number</label>
                        <input
                            type="tel"
                            value={formData.newPhone}
                            onChange={(e) => handleChange('newPhone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="05321234567"
                            maxLength="11"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your password"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium" disabled={isUpdating}>
                        Cancel
                    </button>
                    <button onClick={submit} disabled={isUpdating} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium">
                        {isUpdating ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhoneUpdateModal;

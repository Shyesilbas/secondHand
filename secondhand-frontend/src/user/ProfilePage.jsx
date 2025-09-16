import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { usePhoneUpdate } from './hooks/usePhoneUpdate.js';
import { ROUTES } from '../common/constants/routes.js';
import { UpdatePhoneRequestDTO } from './users.js';
import PhoneUpdateModal from '../common/components/modals/PhoneUpdateModal.jsx';
import AddressList from './components/AddressList.jsx';
import {  useUserReviewStats } from '../reviews/index.js';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneFormData, setPhoneFormData] = useState({ ...UpdatePhoneRequestDTO });
    const { updatePhone, isUpdating } = usePhoneUpdate();
    const { stats: reviewStats, loading: reviewStatsLoading } = useUserReviewStats(user?.id);

    const handlePhoneUpdate = async () => {
        const success = await updatePhone(phoneFormData);
        if (success) {
            setShowPhoneModal(false);
            setPhoneFormData({ ...UpdatePhoneRequestDTO });
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage your account information and preferences</p>
                    </div>
                </div>

                {/* Verification Alert */}
                {!user?.accountVerified && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-amber-800">Account verification required</h3>
                                <p className="text-sm text-amber-700 mt-1">Please verify your email address to access all features and improve account security.</p>
                                <button
                                    onClick={() => navigate(ROUTES.VERIFY_ACCOUNT)}
                                    className="mt-3 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium rounded-lg transition-colors"
                                >
                                    Verify Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Personal Information */}
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                        <p className="text-sm text-gray-600 mt-1">Your basic account details and contact information</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField label="Full Name" value={`${user?.name || 'Not provided'} ${user?.surname || ''}`.trim()} />
                            <InfoField label="Email Address" value={user?.email || 'Not provided'} />
                            <InfoField
                                label="Phone Number"
                                value={user?.phoneNumber || 'Not provided'}
                                action={
                                    <button
                                        onClick={() => {
                                            setPhoneFormData({ ...UpdatePhoneRequestDTO, newPhone: user?.phoneNumber || '' });
                                            setShowPhoneModal(true);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Update phone number"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                }
                            />
                            <InfoField label="Gender" value={user?.gender || 'Not specified'} />
                            <InfoField label="Birth Date" value={user?.birthdate} />
                            <InfoField label="Member Since" value={formatDate(user?.accountCreationDate)} />
                        </div>
                    </div>
                </div>

                {/* Account Status */}
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Account Status</h2>
                        <p className="text-sm text-gray-600 mt-1">Current status and verification information</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoBadge
                                label="Account Status"
                                value={user?.accountStatus || 'Unknown'}
                                type={user?.accountStatus}
                            />
                            <InfoBadge
                                label="Email Verification"
                                value={user?.accountVerified ? 'Verified' : 'Unverified'}
                                isVerified={user?.accountVerified}
                            />
                        </div>
                    </div>
                </div>

                {/* Addresses */}
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Addresses</h2>
                        <p className="text-sm text-gray-600 mt-1">Manage your saved delivery addresses</p>
                    </div>
                    <div className="p-6">
                        <AddressList />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                        <p className="text-sm text-gray-600 mt-1">Access frequently used features and settings</p>
                    </div>
                    <div className="p-6 space-y-2">
                        <ProfileLink
                            to={ROUTES.MY_ORDERS}
                            label="My Orders"
                            description="View and track your order history"
                            iconPath="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />

                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Reviews & Ratings</h3>
                                        <p className="text-sm text-gray-600">Manage your review activity</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Link
                                    to={ROUTES.REVIEWS_RECEIVED(user?.id)}
                                    className="flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <span>Reviews I Received</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <Link
                                    to={ROUTES.REVIEWS_GIVEN(user?.id)}
                                    className="flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <span>Reviews I Gave</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        <ProfileLink
                            to={ROUTES.AGREEMENTS_ALL}
                            label="Terms & Agreements"
                            description="View legal documents and agreements"
                            iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />

                        <ProfileLink
                            to={ROUTES.COMPLAINTS}
                            label="Support & Complaints"
                            description="Get help or file a complaint"
                            iconPath="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75c0-1.856-.513-3.596-1.406-5.1l-4.5 4.5a9.75 9.75 0 01-3.844-3.844l4.5-4.5c-1.504-.893-3.244-1.406-5.1-1.406z"
                        />

                        <ProfileLink
                            to={ROUTES.SECURITY}
                            label="Security Settings"
                            description="Manage password and security options"
                            iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                    </div>
                </div>
            </div>

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

const InfoField = ({ label, value, action }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center justify-between">
            <p className="text-gray-900">{value}</p>
            {action}
        </div>
    </div>
);

const InfoBadge = ({ label, value, type, isVerified }) => {
    let colorClasses;

    if (isVerified !== undefined) {
        colorClasses = isVerified
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200';
    } else {
        const colors = {
            'ACTIVE': 'bg-green-50 text-green-700 border border-green-200',
            'SUSPENDED': 'bg-red-50 text-red-700 border border-red-200',
            'PENDING': 'bg-amber-50 text-amber-700 border border-amber-200'
        };
        colorClasses = colors[type] || 'bg-gray-50 text-gray-700 border border-gray-200';
    }

    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
                    {value}
                </span>
            </div>
        </div>
    );
};

const ProfileLink = ({ to, label, description, iconPath }) => (
    <Link
        to={to}
        className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors group"
    >
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
            </svg>
        </div>
        <div className="flex-1">
            <h3 className="font-medium text-gray-900">{label}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </Link>
);

export default ProfilePage;
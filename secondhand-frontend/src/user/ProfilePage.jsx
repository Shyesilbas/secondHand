import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { usePhoneUpdate } from './hooks/usePhoneUpdate.js';
import { ROUTES } from '../common/constants/routes.js';
import { UpdatePhoneRequestDTO } from './users.js';
import PhoneUpdateModal from '../common/components/modals/PhoneUpdateModal.jsx';
import { formatDateTime } from '../common/formatters.js';
import AddressList from './components/AddressList.jsx';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneFormData, setPhoneFormData] = useState({ ...UpdatePhoneRequestDTO });
    const { updatePhone, isUpdating } = usePhoneUpdate();

    const handlePhoneUpdate = async () => {
        const success = await updatePhone(phoneFormData);
        if (success) {
            setShowPhoneModal(false);
            setPhoneFormData({ ...UpdatePhoneRequestDTO });
        }
    };

    const formatDate = (dateString) => formatDateTime(dateString);

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-text-primary mb-10">Profile</h1>

            {!user?.accountVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8 flex items-start">
                    <svg className="h-5 w-5 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Account Not Verified</h3>
                        <p className="mt-1 text-sm text-yellow-700">Please verify your email to access all features.</p>
                        <button
                            onClick={() => navigate(ROUTES.VERIFY_ACCOUNT)}
                            className="mt-3 bg-yellow-100 px-3 py-1 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-200"
                        >
                            Verify Account
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md border p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Name" value={`${user?.name || 'Undefined'} ${user?.surname || ''}`} />
                    <InfoField label="E-mail" value={user?.email || 'Undefined'} />
                    <InfoField
                        label="Phone Number"
                        value={user?.phoneNumber || 'Undefined'}
                        action={
                            <button
                                onClick={() => {
                                    setPhoneFormData({ ...UpdatePhoneRequestDTO, newPhone: user?.phoneNumber || '' });
                                    setShowPhoneModal(true);
                                }}
                                className="ml-2 p-1 text-text-muted hover:text-btn-primary transition-colors"
                                title="Update phone number"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        }
                    />
                    <InfoField label="Gender" value={user?.gender || 'Undefined'} />
                    <InfoField label="Birthdate" value={user?.birthdate || 'Undefined'} />
                    <InfoBadge
                        label="Account Status"
                        value={user?.accountStatus || 'Undefined'}
                        type={user?.accountStatus === 'ACTIVE' ? 'success' : user?.accountStatus === 'SUSPENDED' ? 'error' : 'warning'}
                    />
                    <InfoBadge
                        label="Account Verified"
                        value={user?.accountVerified ? 'Verified' : 'Unverified'}
                        type={user?.accountVerified ? 'success' : 'error'}
                    />
                    <InfoField label="Account Creation Date" value={user.accountCreationDate} />
                </div>
                <AddressList />
            </div>

            {/* Extra Links */}
            <div className="space-y-3">
                <ProfileLink to={ROUTES.AGREEMENTS_ALL} label="Agreements" iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                <ProfileLink to={ROUTES.COMPLAINTS} label="Complaints" iconPath="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                <ProfileLink to={ROUTES.SECURITY} label="Security" iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
    <div>
        <label className="block text-sm font-medium text-text-secondary">{label}</label>
        <div className="mt-1 flex items-center justify-between">
            <p className="text-text-primary">{value}</p>
            {action}
        </div>
    </div>
);

const InfoBadge = ({ label, value, type }) => {
    const colors =
        type === 'success'
            ? 'bg-green-100 text-green-800'
            : type === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800';
    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary">{label}</label>
            <span className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${colors}`}>
                {value}
            </span>
        </div>
    );
};
const ProfileLink = ({ to, label, iconPath }) => (
    <Link
        to={to}
        className="flex items-center justify-between p-4 border rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors"
    >
        <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-btn-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
            </svg>
            <span>{label}</span>
        </div>
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </Link>
);

export default ProfilePage;


import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { usePhoneUpdate } from './hooks/usePhoneUpdate.js';
import ProfileHeader from './components/ProfileHeader.jsx';
import ProfilePersonalInfo from './components/ProfilePersonalInfo.jsx';
import ProfileAccountStatus from './components/ProfileAccountStatus.jsx';
import ProfileQuickActions from './components/ProfileQuickActions.jsx';
import AddressList from './components/AddressList.jsx';

const TABS = [
    { key: 'personal', label: 'Personal Info' },
    { key: 'status', label: 'Account Status' },
    { key: 'addresses', label: 'Addresses' },
    { key: 'actions', label: 'Quick Actions' },
];

const ProfilePage = () => {
    const { user } = useAuth();
    const { updatePhone } = usePhoneUpdate();
    const [activeTab, setActiveTab] = useState('personal');

    const handlePhoneUpdate = async (phoneFormData) => {
        return await updatePhone(phoneFormData);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <ProfileHeader user={user} />

                {/* Tabs */}
                <div className="flex space-x-4 border-b border-gray-200 mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'personal' && (
                    <ProfilePersonalInfo user={user} onPhoneUpdate={handlePhoneUpdate} />
                )}

                {activeTab === 'status' && (
                    <ProfileAccountStatus user={user} />
                )}

                {activeTab === 'addresses' && (
                    <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Addresses</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage your saved delivery addresses
                            </p>
                        </div>
                        <div className="p-6">
                            <AddressList />
                        </div>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <ProfileQuickActions user={user} />
                )}
            </div>
        </div>
    );
};

export default ProfilePage;

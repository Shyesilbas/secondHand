import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { usePhoneUpdate } from './hooks/usePhoneUpdate.js';
import { UserIcon, ShieldCheckIcon, MapPinIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import ProfileHeader from './components/ProfileHeader.jsx';
import ProfilePersonalInfo from './components/ProfilePersonalInfo.jsx';
import ProfileAccountStatus from './components/ProfileAccountStatus.jsx';
import ProfileQuickActions from './components/ProfileQuickActions.jsx';
import AddressList from './components/AddressList.jsx';
import { useQueryClient } from '@tanstack/react-query';

const TABS = [
    { 
        key: 'personal', 
        label: 'Personal Info', 
        icon: UserIcon,
        description: 'Manage your personal information'
    },
    { 
        key: 'status', 
        label: 'Account Status', 
        icon: ShieldCheckIcon,
        description: 'View account verification status'
    },
    { 
        key: 'addresses', 
        label: 'Addresses', 
        icon: MapPinIcon,
        description: 'Manage delivery addresses'
    },
    { 
        key: 'actions', 
        label: 'Quick Actions', 
        icon: Cog6ToothIcon,
        description: 'Account management tools'
    },
];

const ProfilePage = () => {
    const { user } = useAuth();
    const { updatePhone } = usePhoneUpdate();
    const [activeTab, setActiveTab] = useState('personal');
    const queryClient = useQueryClient();

    const handlePhoneUpdate = async (phoneFormData) => {
        return await updatePhone(phoneFormData);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        // Invalidate or prefetch queries if needed when switching tabs
        if (key === 'addresses') {
            queryClient.invalidateQueries(['addresses']);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <ProfileHeader user={user} />
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-lg font-medium text-gray-900">Account Management</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage your account settings and information</p>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {TABS.map((tab) => {
                                    const IconComponent = tab.icon;
                                    const isActive = activeTab === tab.key;
                                    
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => handleTabChange(tab.key)}
                                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                                isActive
                                                    ? 'border-gray-900 bg-gray-900 text-white'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${
                                                    isActive 
                                                        ? 'bg-white bg-opacity-20' 
                                                        : 'bg-gray-100'
                                                }`}>
                                                    <IconComponent className={`w-5 h-5 ${
                                                        isActive ? 'text-white' : 'text-gray-600'
                                                    }`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`text-sm font-medium ${
                                                        isActive ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                        {tab.label}
                                                    </h3>
                                                    <p className={`text-xs mt-1 ${
                                                        isActive ? 'text-gray-200' : 'text-gray-500'
                                                    }`}>
                                                        {tab.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'personal' && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <UserIcon className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                                        <p className="text-sm text-gray-600">Update your personal details and contact information</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <ProfilePersonalInfo user={user} onPhoneUpdate={handlePhoneUpdate} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'status' && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <ShieldCheckIcon className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">Account Status</h2>
                                        <p className="text-sm text-gray-600">View your account verification and security status</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <ProfileAccountStatus user={user} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <MapPinIcon className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">Delivery Addresses</h2>
                                        <p className="text-sm text-gray-600">Manage your saved delivery addresses</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <AddressList isActive={activeTab === 'addresses'} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'actions' && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <Cog6ToothIcon className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                                        <p className="text-sm text-gray-600">Account management and security tools</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <ProfileQuickActions user={user} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

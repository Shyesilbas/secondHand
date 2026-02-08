import React, { useState } from 'react';
import { useAuthState } from '../auth/AuthContext.jsx';
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
    const { user } = useAuthState();
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
        <div className="min-h-screen bg-[#F8FAFC] tracking-tight">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <ProfileHeader user={user} />
                </div>

                <div className="mb-8">
                    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <div className="relative flex bg-slate-100 rounded-2xl p-1.5">
                                {TABS.map((tab) => {
                                    const IconComponent = tab.icon;
                                    const isActive = activeTab === tab.key;
                                    
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => handleTabChange(tab.key)}
                                            className={`relative flex-1 flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-300 tracking-tight ${
                                                isActive
                                                    ? 'text-indigo-600 bg-white shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 transition-all ${
                                                isActive 
                                                    ? 'bg-indigo-50 text-indigo-600' 
                                                    : 'bg-slate-200 text-slate-500'
                                            }`}>
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div key={activeTab} className="opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
                        {activeTab === 'personal' && (
                            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                                <div className="p-10">
                                    <div className="flex items-center space-x-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <UserIcon className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tighter">Personal Information</h2>
                                            <p className="text-sm text-slate-500 tracking-tight mt-1">Update your personal details and contact information</p>
                                        </div>
                                    </div>
                                    <ProfilePersonalInfo user={user} onPhoneUpdate={handlePhoneUpdate} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'status' && (
                            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                                <div className="p-10">
                                    <div className="flex items-center space-x-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tighter">Account Status</h2>
                                            <p className="text-sm text-slate-500 tracking-tight mt-1">View your account verification and security status</p>
                                        </div>
                                    </div>
                                    <ProfileAccountStatus user={user} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                                <div className="p-10">
                                    <div className="flex items-center space-x-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <MapPinIcon className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tighter">Delivery Addresses</h2>
                                            <p className="text-sm text-slate-500 tracking-tight mt-1">Manage your saved delivery addresses</p>
                                        </div>
                                    </div>
                                    <AddressList isActive={activeTab === 'addresses'} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'actions' && (
                            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                                <div className="p-10">
                                    <div className="flex items-center space-x-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <Cog6ToothIcon className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 tracking-tighter">Quick Actions</h2>
                                            <p className="text-sm text-slate-500 tracking-tight mt-1">Account management and security tools</p>
                                        </div>
                                    </div>
                                    <ProfileQuickActions user={user} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;

import React, {useState} from 'react';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {usePhoneUpdate} from '../hooks/usePhoneUpdate.js';
import {
    MapPin as MapPinIcon,
    Settings as Cog6ToothIcon,
    ShieldCheck as ShieldCheckIcon,
    User as UserIcon,
    ChevronRight,
} from 'lucide-react';
import ProfileHeader from '../components/ProfileHeader.jsx';
import ProfilePersonalInfo from '../components/ProfilePersonalInfo.jsx';
import ProfileAccountStatus from '../components/ProfileAccountStatus.jsx';
import ProfileQuickActions from '../components/ProfileQuickActions.jsx';
import AddressList from '../components/AddressList.jsx';
import {useQueryClient} from '@tanstack/react-query';

const TABS = [
    {
        key: 'personal',
        label: 'Personal Info',
        icon: UserIcon,
        description: 'Your name, email and phone',
    },
    {
        key: 'status',
        label: 'Account Status',
        icon: ShieldCheckIcon,
        description: 'Verification & security',
    },
    {
        key: 'addresses',
        label: 'Addresses',
        icon: MapPinIcon,
        description: 'Delivery & billing',
    },
    {
        key: 'actions',
        label: 'Quick Actions',
        icon: Cog6ToothIcon,
        description: 'Orders, reviews & more',
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
        if (key === 'addresses') {
            queryClient.invalidateQueries(['addresses']);
        }
    };

    const activeTabData = TABS.find(t => t.key === activeTab);
    const ActiveIcon = activeTabData?.icon || UserIcon;

    return (
        <div className="min-h-screen bg-gray-50/80">
            {/* ── Profile Hero ────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ProfileHeader user={user} />
                </div>
            </div>

            {/* ── Main Content: Sidebar + Panel ───────────────── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── Left Sidebar Nav ─────────────────────── */}
                    <div className="lg:w-72 shrink-0">
                        <nav className="bg-white rounded-2xl border border-gray-200 overflow-hidden lg:sticky lg:top-6">
                            <div className="p-2">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => handleTabChange(tab.key)}
                                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 group ${
                                                isActive
                                                    ? 'bg-gray-900 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                                                isActive
                                                    ? 'bg-white/15'
                                                    : 'bg-gray-100 group-hover:bg-gray-200'
                                            }`}>
                                                <Icon className="w-4.5 h-4.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                                    {tab.label}
                                                </div>
                                                <div className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                                                    {tab.description}
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                                                isActive ? 'text-white/40' : 'text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5'
                                            }`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>

                    {/* ── Right Content Panel ─────────────────── */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            {/* Panel Header */}
                            <div className="px-8 py-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                        <ActiveIcon className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                                            {activeTabData?.label}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {activeTabData?.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Panel Body */}
                            <div className="p-8">
                                <div key={activeTab} className="animate-fadeIn">
                                    {activeTab === 'personal' && (
                                        <ProfilePersonalInfo user={user} onPhoneUpdate={handlePhoneUpdate} />
                                    )}
                                    {activeTab === 'status' && (
                                        <ProfileAccountStatus user={user} />
                                    )}
                                    {activeTab === 'addresses' && (
                                        <AddressList isActive={activeTab === 'addresses'} />
                                    )}
                                    {activeTab === 'actions' && (
                                        <ProfileQuickActions user={user} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ProfilePage;

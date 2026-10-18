import PageContainer from '@/common/components/layout/PageContainer';
import { useState } from 'react';
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
 const { updatePhone, isUpdating: isUpdatingPhone } = usePhoneUpdate();
 const [activeTab, setActiveTab] = useState('personal');
 const queryClient = useQueryClient();

 const handleTabChange = (key) => {
 setActiveTab(key);
 if (key === 'addresses') {
 queryClient.invalidateQueries({ queryKey: ['addresses'] });
 }
 };

 const activeTabData = TABS.find(t => t.key === activeTab);
 const ActiveIcon = activeTabData?.icon || UserIcon;

 return (
 <div className="min-h-screen bg-background-secondary">
 {/* ── Profile Hero ────────────────────────────────── */}
 <div className="bg-background-primary border-b border-border-light/80">
 <PageContainer className="py-8">
 <ProfileHeader user={user} />
 </PageContainer>
 </div>

 {/* ── Main Content: Sidebar + Panel ───────────────── */}
 <PageContainer className="py-8">
 <div className="flex flex-col lg:flex-row gap-6">

 {/* ── Left Sidebar Nav ─────────────────────── */}
 <div className="lg:w-72 shrink-0">
 <nav className="bg-background-primary rounded-md border border-border-light overflow-hidden lg:sticky lg:top-6">
 <div className="p-2">
 {TABS.map((tab) => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.key;
 return (
 <button
 key={tab.key}
 onClick={() => handleTabChange(tab.key)}
 className={`w-full flex items-center gap-3 px-3.5 py-3 rounded text-left transition-all duration-200 group ${
 isActive
 ? 'bg-primary text-white'
 : 'text-text-secondary hover:bg-secondary-light hover:text-text-primary'
 }`}
 >
 <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 transition-colors duration-200 ${
 isActive
 ? 'bg-background-primary/15'
 : 'bg-secondary-light group-hover:bg-secondary-light'
 }`}>
 <Icon className="w-4.5 h-4.5" />
 </div>
 <div className="flex-1 min-w-0">
 <div className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-text-primary'}`}>
 {tab.label}
 </div>
 <div className={`text-xs truncate mt-0.5 ${isActive ? 'text-white/60' : 'text-text-muted'}`}>
 {tab.description}
 </div>
 </div>
 <ChevronRight className={`w-4 h-4 shrink-0 transition-all duration-200 ${
 isActive ? 'text-white/40' : 'text-secondary-300 group-hover:text-text-muted'
 }`} />
 </button>
 );
 })}
 </div>
 </nav>
 </div>

 {/* ── Right Content Panel ─────────────────── */}
 <div className="flex-1 min-w-0">
 <div className="bg-background-primary rounded-md border border-border-light overflow-hidden">
 {/* Panel Header */}
 <div className="px-8 py-6 border-b border-border-light">
 <div className="flex items-center gap-3">
 <ActiveIcon className="h-5 w-5 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden />
 <div>
 <h2 className="text-lg font-semibold text-text-primary tracking-tight">
 {activeTabData?.label}
 </h2>
 <p className="text-sm text-text-muted mt-0.5">
 {activeTabData?.description}
 </p>
 </div>
 </div>
 </div>

 {/* Panel Body */}
 <div className="p-8">
 <div key={activeTab} className="animate-fadeIn">
 {activeTab === 'personal' && (
 <ProfilePersonalInfo user={user} onPhoneUpdate={updatePhone} isUpdatingPhone={isUpdatingPhone} />
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
 </PageContainer>

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

import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Ban as BanIcon,
  MapPin as MapPinIcon,
  ShieldCheck as ShieldCheckIcon,
  User as UserIcon
} from 'lucide-react';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { usePhoneUpdate } from '../hooks/usePhoneUpdate.js';
import { Card, Tabs } from '../../common/components/ui/index.js';
import ProfileHeader from '../components/ProfileHeader.jsx';
import ProfilePersonalInfo from '../components/ProfilePersonalInfo.jsx';
import ProfileAccountStatus from '../components/ProfileAccountStatus.jsx';
import AddressList from '../components/AddressList.jsx';
import BlockedUsersList from '../components/BlockedUsersList.jsx';

// Unknown values, including the retired `actions` tab, fall back to the personal tab.
const VALID_TABS = new Set(['personal', 'addresses', 'security', 'blocked']);

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const { updatePhone, isUpdating: isUpdatingPhone } = usePhoneUpdate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.has(tabParam) ? tabParam : 'personal';

  const handleTabChange = (key) => {
    setSearchParams(key === 'personal' ? {} : { tab: key }, { replace: true });
    if (key === 'addresses') {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    }
  };

  const tabs = [
    {
      key: 'personal',
      label: t('personal_info', 'Kişisel Bilgiler'),
      icon: UserIcon
    },
    {
      key: 'addresses',
      label: t('addresses', 'Adreslerim'),
      icon: MapPinIcon
    },
    {
      key: 'security',
      label: t('account_and_security', 'Hesap & Güvenlik'),
      icon: ShieldCheckIcon
    },
    {
      key: 'blocked',
      label: t('blocked_users', 'Engellediğim Kullanıcılar'),
      icon: BanIcon
    }
  ];

  return (
    <div className="min-h-screen bg-background-secondary py-6 sm:py-8">
      <PageContainer className="max-w-4xl space-y-5">
        {/* 1. Profile Header Card */}
        <Card as="section" shadow={false} className="sm:p-6">
          <ProfileHeader user={user} />
        </Card>

        {/* 2. Tabbed Settings Surface */}
        <div className="rounded border border-border bg-background-primary overflow-hidden">
          <div className="border-b border-border-light bg-background-primary px-4 sm:px-6">
            <Tabs
              items={tabs.map((tab) => ({ ...tab, id: `profile-tab-${tab.key}` }))}
              activeKey={activeTab}
              onChange={handleTabChange}
              ariaLabel={t('profile_sections', 'Profil Bölümleri')}
              borderBottom={false}
            />
          </div>

          <main
            role="tabpanel"
            id={`profile-panel-${activeTab}`}
            aria-labelledby={`profile-tab-${activeTab}`}
            className="p-5 sm:p-6"
          >
            {activeTab === 'personal' && (
              <ProfilePersonalInfo
                user={user}
                onPhoneUpdate={updatePhone}
                isUpdatingPhone={isUpdatingPhone}
              />
            )}
            {activeTab === 'addresses' && (
              <AddressList isActive={activeTab === 'addresses'} />
            )}
            {activeTab === 'security' && (
              <ProfileAccountStatus user={user} />
            )}
            {activeTab === 'blocked' && (
              <BlockedUsersList isActive={activeTab === 'blocked'} />
            )}
          </main>
        </div>
      </PageContainer>
    </div>
  );
};

export default ProfilePage;

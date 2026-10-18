import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  MapPin as MapPinIcon,
  Settings as Cog6ToothIcon,
  ShieldCheck as ShieldCheckIcon,
  User as UserIcon
} from 'lucide-react';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { usePhoneUpdate } from '../hooks/usePhoneUpdate.js';
import ProfileHeader from '../components/ProfileHeader.jsx';
import ProfilePersonalInfo from '../components/ProfilePersonalInfo.jsx';
import ProfileAccountStatus from '../components/ProfileAccountStatus.jsx';
import ProfileQuickActions from '../components/ProfileQuickActions.jsx';
import AddressList from '../components/AddressList.jsx';

const VALID_TABS = new Set(['personal', 'addresses', 'security', 'actions']);

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
      icon: UserIcon,
      description: t('personal_info_desc', 'Ad, e-posta ve telefon bilgileri')
    },
    {
      key: 'addresses',
      label: t('addresses', 'Adreslerim'),
      icon: MapPinIcon,
      description: t('addresses_desc', 'Teslimat ve fatura adresleri')
    },
    {
      key: 'security',
      label: t('account_and_security', 'Hesap & Güvenlik'),
      icon: ShieldCheckIcon,
      description: t('account_security_desc', 'Doğrulama, şifre ve oturumlar')
    },
    {
      key: 'actions',
      label: t('quick_actions', 'Hızlı İşlemler'),
      icon: Cog6ToothIcon,
      description: t('quick_actions_desc', 'Siparişler, değerlendirmeler ve destek')
    }
  ];

  return (
    <div className="min-h-screen bg-background-secondary py-5 sm:py-7">
      <PageContainer className="max-w-4xl">
        <div className="bg-background-primary rounded border border-border">
          {/* ── 1. Compact Profile Header ───────────────────────── */}
          <div className="p-4 sm:p-5 border-b border-border-light">
            <ProfileHeader user={user} />
          </div>

          {/* ── 2. Horizontal Tab Bar (düz tablar) ──────────────── */}
          <div className="border-b border-border-light bg-background-primary px-4 sm:px-5">
            <nav
              role="tablist"
              aria-label={t('profile_sections', 'Profil Bölümleri')}
              className="flex items-center gap-1 sm:gap-3 overflow-x-auto no-scrollbar -mb-px"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    id={`profile-tab-${tab.key}`}
                    aria-controls={`profile-panel-${tab.key}`}
                    aria-selected={isActive}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`inline-flex items-center gap-2 py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'border-primary text-text-primary font-semibold'
                        : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-primary' : 'text-text-muted'
                      }`}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ── 3. Tab Content Panel ───────────────────────────── */}
          <main
            role="tabpanel"
            id={`profile-panel-${activeTab}`}
            aria-labelledby={`profile-tab-${activeTab}`}
            className="p-4 sm:p-6"
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
            {activeTab === 'actions' && (
              <ProfileQuickActions user={user} />
            )}
          </main>
        </div>
      </PageContainer>
    </div>
  );
};

export default ProfilePage;

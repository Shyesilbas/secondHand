import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown, Crown, LogOut, User } from 'lucide-react';
import { usePlan } from '@/common/hooks/usePlan';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
import { ROUTES } from '../../../constants/routes.js';
import { Button } from '../../ui/index.js';
import HeaderDropdownPanel from './HeaderDropdownPanel.jsx';
import HeaderMenuItem from './HeaderMenuItem.jsx';
import { getProfileMenuItems } from './headerMenuConfig.js';

const HeaderProfileMenu = ({
  user,
  isOpen,
  onToggle,
  onClose,
  onLogout
}) => {
  const { t } = useTranslation();
  const { isPremium } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isUnverified = Boolean(user && user.accountVerified === false);
  const fullName = `${user?.name || ''} ${user?.surname || ''}`.trim() || user?.name || t('user', 'Kullanıcı');

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label={t('account_menu', 'Hesap menüsü')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`group inline-flex h-9 items-center gap-1.5 rounded px-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
          isOpen ? 'bg-background-tertiary' : 'hover:bg-background-tertiary'
        }`}
      >
        <div className="relative">
          <div
            className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border bg-background-secondary transition-colors duration-150 ${
              isUnverified
                ? 'border-status-warning-border'
                : 'border-border-light group-hover:border-border'
            }`}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={fullName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />
            )}
          </div>

          {isUnverified ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background-primary bg-status-warning"
              aria-hidden
            />
          ) : isPremium ? (
            <span
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-status-warning-border bg-status-warning-bg text-status-warning-text"
              aria-hidden
            >
              <Crown className="h-2.5 w-2.5" strokeWidth={1.5} />
            </span>
          ) : null}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-text-tertiary transition-transform duration-150 group-hover:text-text-secondary ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      {isOpen && (
        <HeaderDropdownPanel className="w-64">
          <div className="border-b border-border-light px-3 py-2.5">
            <Link
              to={ROUTES.PROFILE}
              onClick={onClose}
              className="inline-flex max-w-full items-center gap-1.5 rounded-sm text-sm font-semibold text-text-primary transition-colors duration-150 hover:text-text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <span className="truncate">{fullName}</span>
              {isPremium && (
                <Crown
                  className="h-3.5 w-3.5 shrink-0 text-status-warning-icon"
                  aria-label={t('premium_member', 'Premium üye')}
                  strokeWidth={1.5}
                />
              )}
            </Link>
          </div>

          {isUnverified && (
            <Link
              to={ROUTES.VERIFY_ACCOUNT}
              onClick={onClose}
              className="my-1.5 flex items-start gap-2.5 rounded border border-status-warning-border bg-status-warning-bg p-2.5 transition-colors duration-150 hover:border-status-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning-icon" strokeWidth={1.5} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold leading-tight text-status-warning-text">
                  {t('verify_account', 'Hesabı doğrula')}
                </p>
                <p className="mt-0.5 truncate text-xs text-status-warning-text">
                  {t('verify_account_desc', 'Tüm özellikler için doğrulamayı tamamlayın')}
                </p>
              </div>
            </Link>
          )}

          <div className="mt-1 flex flex-col gap-0.5">
            {getProfileMenuItems(user?.id).map((item) => (
              <HeaderMenuItem
                key={item.key}
                to={item.to}
                onClick={onClose}
                icon={item.icon}
                labelKey={item.labelKey}
                label={item.label}
              />
            ))}
          </div>

          {!isPremium && (
            <div className="my-1.5 rounded bg-background-secondary p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Crown className="h-4 w-4 shrink-0 text-status-warning-icon" strokeWidth={1.5} aria-hidden />
                <span className="truncate text-sm font-semibold text-text-primary">
                  {t('premium_membership', 'Premium Üyelik')}
                </span>
              </div>
              <p className="mb-2.5 text-sm text-text-secondary">
                {t('upgrade_to_premium_get_shipping_fast', "Premium'a geçerek öncelikli kargo avantajından yararlanın.")}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  setShowUpgrade(true);
                }}
                className="w-full"
              >
                {t('upgrade_to_premium', "Premium'a Geç")}
              </Button>
            </div>
          )}

          <div className="my-1 border-t border-border-light" />

          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-status-error-text transition-colors duration-150 hover:bg-status-error-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
            <span>{t('sign_out', 'Çıkış Yap')}</span>
          </button>
        </HeaderDropdownPanel>
      )}

      <PremiumUpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />
    </>
  );
};

export default HeaderProfileMenu;

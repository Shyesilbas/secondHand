import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { Mail, Calendar, CheckCircle2 } from 'lucide-react';
import Alert from '../../common/components/ui/Alert.jsx';
import Button from '../../common/components/ui/Button.jsx';

const ProfileHeader = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const name = user?.name || '';
  const surname = user?.surname || '';
  const fullName = `${name} ${surname}`.trim();
  const userInitials = (name?.[0] || user?.email?.[0] || 'U').toUpperCase() + (surname?.[0] || '').toUpperCase();
  const isVerified = Boolean(user?.accountVerified);

  const parseCreationYear = (rawDate) => {
    if (!rawDate) return null;
    if (typeof rawDate === 'string') {
      const trimmed = rawDate.trim();
      if (trimmed.includes('/') || trimmed.includes('.')) {
        const parts = trimmed.split(/[/.]/);
        const y = parseInt(parts[2] || parts[0], 10);
        return Number.isFinite(y) && y >= 1900 && y <= 2100 ? y : null;
      }
      if (trimmed.includes('-')) {
        const y = parseInt(trimmed.split('-')[0], 10);
        return Number.isFinite(y) && y >= 1900 && y <= 2100 ? y : null;
      }
    }
    const d = new Date(rawDate);
    const y = d.getFullYear();
    return Number.isFinite(y) && !isNaN(y) && y >= 1900 && y <= 2100 ? y : null;
  };

  const creationYear = parseCreationYear(user?.accountCreationDate);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Avatar (rounded-full per DESIGN.md) */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white flex items-center justify-center select-none">
            <span className="text-base sm:text-lg font-semibold tracking-tight">
              {userInitials}
            </span>
          </div>
          {isVerified && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-background-primary border border-border flex items-center justify-center"
              title={t('account_verified', 'Doğrulanmış Hesap')}
            >
              <CheckCircle2 className="h-3 w-3 text-status-success" strokeWidth={1.5} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-semibold text-text-primary tracking-tight truncate">
              {fullName || t('profile_settings', 'Profil Ayarları')}
            </h1>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden="true" />
                <span>{t('verified', 'Doğrulanmış')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-status-warning" aria-hidden="true" />
                <span>{t('unverified', 'Doğrulanmamış')}</span>
              </span>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
            {user?.email && (
              <span className="inline-flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.5} />
                <span className="truncate">{user.email}</span>
              </span>
            )}
            {creationYear && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted shrink-0" strokeWidth={1.5} />
                <span>{t('member_since', 'Üyelik tarihi:')} {creationYear}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verification warning banner via standard Alert */}
      {!isVerified && (
        <Alert
          type="warning"
          message={t('verify_email_notice', 'Hesabınız henüz doğrulanmadı. Tüm pazar yeri özelliklerinden yararlanmak için e-posta adresinizi doğrulayın.')}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.VERIFY_ACCOUNT)}
            >
              {t('verify_now', 'Şimdi Doğrula')}
            </Button>
          }
        />
      )}
    </div>
  );
};

export default ProfileHeader;
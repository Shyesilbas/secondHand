import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, KeyRound, Shield, XCircle } from 'lucide-react';
import { USER_ACCOUNT_STATUSES } from '../userConstants.js';
import { ROUTES } from '../../common/constants/routes.js';
import Button from '../../common/components/ui/Button.jsx';

const ProfileAccountStatus = ({ user }) => {
  const { t } = useTranslation();
  const accountStatus = user?.accountStatus || 'ACTIVE';
  const isVerified = Boolean(user?.accountVerified);

  const getStatusDetails = () => {
    switch (accountStatus) {
      case USER_ACCOUNT_STATUSES.ACTIVE:
        return {
          label: t('account_status_active', 'Aktif'),
          dotClass: 'bg-status-success',
          description: t('account_active_desc', 'Hesabınız aktif ve güvenli durumda.'),
          icon: CheckCircle2
        };
      case USER_ACCOUNT_STATUSES.SUSPENDED:
        return {
          label: t('account_status_suspended', 'Askıya Alındı'),
          dotClass: 'bg-status-error',
          description: t('account_suspended_desc', 'Hesabınız askıya alınmıştır. Destek ekibiyle iletişime geçin.'),
          icon: XCircle
        };
      case USER_ACCOUNT_STATUSES.PENDING:
        return {
          label: t('account_status_pending', 'İncelemede'),
          dotClass: 'bg-status-warning',
          description: t('account_pending_desc', 'Hesabınız onay incelemesindedir.'),
          icon: Clock
        };
      default:
        return {
          label: t('account_status_unknown', 'Bilinmiyor'),
          dotClass: 'bg-text-tertiary',
          description: t('account_unknown_desc', 'Hesap durumu bilgisi bulunamadı.'),
          icon: Clock
        };
    }
  };

  const status = getStatusDetails();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-4">
      {/* 1. Account Status Card */}
      <div className="flex items-start justify-between gap-4 rounded border border-border bg-background-primary p-4">
        <div className="flex items-start gap-3 min-w-0">
          <StatusIcon className="h-5 w-5 shrink-0 text-text-secondary mt-0.5" strokeWidth={1.5} aria-hidden="true" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">
                {t('account_status', 'Hesap Durumu')}
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
                <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} aria-hidden="true" />
                <span>{status.label}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {status.description}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Email Verification Card */}
      <div className="flex items-start justify-between gap-4 rounded border border-border bg-background-primary p-4">
        <div className="flex items-start gap-3 min-w-0">
          {isVerified ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-status-success mt-0.5" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-status-error mt-0.5" strokeWidth={1.5} aria-hidden="true" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">
                {t('email_verification', 'E-posta Doğrulaması')}
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
                <span className={`h-1.5 w-1.5 rounded-full ${isVerified ? 'bg-status-success' : 'bg-status-error'}`} aria-hidden="true" />
                <span>{isVerified ? t('verified', 'Doğrulandı') : t('unverified', 'Doğrulanmadı')}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {isVerified
                ? t('email_verified_desc', 'E-posta adresiniz başarıyla doğrulanmıştır.')
                : t('email_unverified_desc', 'Tüm özellikleri güvenle kullanabilmek için lütfen e-postanızı doğrulayın.')}
            </p>
          </div>
        </div>

        {!isVerified && (
          <Link to={ROUTES.VERIFY_ACCOUNT} className="shrink-0">
            <Button variant="secondary" size="sm">
              {t('verify', 'Doğrula')}
            </Button>
          </Link>
        )}
      </div>

      {/* 3. Security Quick Links Card */}
      <div className="rounded border border-border bg-background-primary p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {t('security_actions', 'Güvenlik İşlemleri')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Link
            to={ROUTES.CHANGE_PASSWORD}
            className="flex items-center gap-2.5 rounded border border-border-light bg-background-secondary/50 p-3 text-xs sm:text-sm font-medium text-text-primary hover:border-card-border-hover hover:bg-background-secondary transition-colors"
          >
            <KeyRound className="h-4 w-4 shrink-0 text-text-secondary" strokeWidth={1.5} />
            <div className="min-w-0">
              <div className="truncate font-semibold">{t('change_password', 'Şifre Değiştir')}</div>
              <div className="text-xs text-text-muted truncate">{t('update_your_password', 'Hesap şifrenizi güncelleyin')}</div>
            </div>
          </Link>

          <Link
            to={ROUTES.SECURITY}
            className="flex items-center gap-2.5 rounded border border-border-light bg-background-secondary/50 p-3 text-xs sm:text-sm font-medium text-text-primary hover:border-card-border-hover hover:bg-background-secondary transition-colors"
          >
            <Shield className="h-4 w-4 shrink-0 text-text-secondary" strokeWidth={1.5} />
            <div className="min-w-0">
              <div className="truncate font-semibold">{t('security_hub', 'Güvenlik Merkezi')}</div>
              <div className="text-xs text-text-muted truncate">{t('manage_sessions', 'Aktif oturumları ve güvenlik ayarlarını yönetin')}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccountStatus;

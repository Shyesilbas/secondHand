import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight, KeyRound, MessageSquare, MailCheck, Shield, UserCheck } from 'lucide-react';
import { USER_ACCOUNT_STATUSES } from '../userConstants.js';
import { ROUTES } from '../../common/constants/routes.js';
import Button from '../../common/components/ui/Button.jsx';
import { useUserSettings, useUpdateUserSettings } from '../hooks/useBlocking.js';

const ProfileAccountStatus = ({ user }) => {
  const { t } = useTranslation();
  const accountStatus = user?.accountStatus || 'ACTIVE';
  const isVerified = Boolean(user?.accountVerified);
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  const messagingOn = settings?.canSendMessage ?? user?.canSendMessage ?? true;

  const getStatusDetails = () => {
    switch (accountStatus) {
      case USER_ACCOUNT_STATUSES.ACTIVE:
        return {
          label: t('account_status_active', 'Aktif'),
          dotClass: 'bg-status-success',
          description: t('account_active_desc', 'Hesabınız aktif ve kullanıma açık durumda.')
        };
      case USER_ACCOUNT_STATUSES.SUSPENDED:
        return {
          label: t('account_status_suspended', 'Askıya Alındı'),
          dotClass: 'bg-status-error',
          description: t(
            'account_suspended_desc',
            'Hesabınız askıya alınmıştır. Destek ekibiyle iletişime geçin.'
          )
        };
      case USER_ACCOUNT_STATUSES.PENDING:
        return {
          label: t('account_status_pending', 'İncelemede'),
          dotClass: 'bg-status-warning',
          description: t('account_pending_desc', 'Hesabınız onay incelemesindedir.')
        };
      default:
        return {
          label: t('account_status_unknown', 'Bilinmiyor'),
          dotClass: 'bg-text-tertiary',
          description: t('account_unknown_desc', 'Hesap durumu bilgisi bulunamadı.')
        };
    }
  };

  const status = getStatusDetails();

  return (
    <div className="divide-y divide-border-light">
      {/* 1. Account Status Row */}
      <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
        <div className="flex items-start gap-3 min-w-0">
          <UserCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-text-primary">
              {t('account_status', 'Hesap Durumu')}
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">{status.description}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-border-light bg-background-secondary px-2.5 py-1 text-xs font-medium text-text-primary">
          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} aria-hidden="true" />
          <span>{status.label}</span>
        </span>
      </div>

      {/* 2. Email Verification Row */}
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-start gap-3 min-w-0">
          <MailCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-text-primary">
              {t('email_verification', 'E-posta Doğrulaması')}
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              {isVerified
                ? t('email_verified_desc', 'E-posta adresiniz doğrulanmıştır.')
                : t(
                    'email_unverified_desc',
                    'Tüm özellikleri kullanabilmek için e-postanızı doğrulayın.'
                  )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border-light bg-background-secondary px-2.5 py-1 text-xs font-medium text-text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden="true" />
              <span>{t('verified', 'Doğrulandı')}</span>
            </span>
          ) : (
            <Link to={ROUTES.VERIFY_ACCOUNT}>
              <Button variant="secondary" size="sm">
                {t('verify', 'Doğrula')}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Messaging preference (global default for new listings and direct chats) */}
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-start gap-3 min-w-0">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-text-primary">
              {t('messaging_preference', 'Mesajlaşma Tercihi (Global)')}
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              {t('messaging_preference_desc', 'Kapalıyken yeni ilanlarınızda mesajlaşma varsayılan olarak kapalı gelir ve doğrudan mesaj alamazsınız.')}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={messagingOn}
          disabled={updateSettings.isPending}
          onClick={() => updateSettings.mutate({ canSendMessage: !messagingOn })}
          aria-label={t('messaging_preference', 'Mesajlaşma Tercihi (Global)')}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            messagingOn ? 'bg-status-success' : 'bg-border'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
              messagingOn ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 3. Change Password Row */}
      <Link
        to={ROUTES.CHANGE_PASSWORD}
        className="group -mx-2 flex items-center justify-between gap-4 rounded px-2 py-4 transition-colors hover:bg-background-secondary/60"
      >
        <div className="flex items-start gap-3 min-w-0">
          <KeyRound
            className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-text-primary">
              {t('change_password', 'Şifre Değiştir')}
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              {t('update_your_password', 'Hesap şifrenizi güvenli şekilde güncelleyin')}
            </p>
          </div>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-text-primary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </Link>

      {/* 4. Security & Audit Logs Row */}
      <Link
        to={ROUTES.SECURITY}
        className="group -mx-2 flex items-center justify-between gap-4 rounded px-2 py-4 last:pb-1 transition-colors hover:bg-background-secondary/60"
      >
        <div className="flex items-start gap-3 min-w-0">
          <Shield
            className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-text-primary">
              {t('security_hub', 'Güvenlik ve Denetim Kayıtları')}
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              {t('manage_sessions', 'Giriş hareketlerini, IP kayıtlarını ve güvenlik olaylarını inceleyin')}
            </p>
          </div>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-text-primary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </Link>
    </div>
  );
};

export default ProfileAccountStatus;

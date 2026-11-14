import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { ExternalLink, LayoutDashboard, Mail } from 'lucide-react';
import { buttonClasses } from '../../common/components/ui/Button.jsx';

const ProfileHeader = ({ user }) => {
  const { t } = useTranslation();

  const name = user?.name || '';
  const surname = user?.surname || '';
  const fullName = `${name} ${surname}`.trim();
  const userInitials =
    (name?.[0] || user?.email?.[0] || 'U').toUpperCase() +
    (surname?.[0] || '').toUpperCase();
  const isVerified = Boolean(user?.accountVerified);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 select-none items-center justify-center rounded-full border border-border-light bg-background-tertiary text-base sm:text-lg font-semibold tracking-tight text-text-primary">
            {userInitials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg sm:text-xl font-semibold tracking-tight text-text-primary">
                {fullName || t('profile_settings', 'Profil Ayarları')}
              </h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${
                isVerified
                  ? 'border-status-success-border bg-status-success-bg text-status-success-text'
                  : 'border-status-warning-border bg-status-warning-bg text-status-warning-text'
              }`}>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isVerified ? 'bg-status-success' : 'bg-status-warning'
                  }`}
                  aria-hidden="true"
                />
                <span>
                  {isVerified
                    ? t('verified', 'Doğrulanmış')
                    : t('unverified', 'Doğrulanmamış')}
                </span>
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
              {user?.email && (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden="true" />
                  <span className="truncate">{user.email}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap shrink-0 items-center gap-2">
          <Link
            to={ROUTES.DASHBOARD}
            className={buttonClasses('secondary', 'sm')}
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-text-secondary" strokeWidth={1.5} aria-hidden="true" />
            <span>{t('account_hub', 'Account Hub')}</span>
          </Link>

          {user?.id && (
            <Link
              to={ROUTES.USER_PROFILE(user.id)}
              className={buttonClasses('secondary', 'sm')}
            >
              <span>{t('view_public_profile', 'Herkese Açık Profilim')}</span>
              <ExternalLink className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProfileHeader;

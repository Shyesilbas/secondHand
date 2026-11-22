import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { BadgeCheck, ExternalLink, ShieldAlert } from 'lucide-react';
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
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 select-none items-center justify-center rounded-full bg-background-tertiary text-base sm:text-lg font-semibold tracking-tight text-text-primary">
            {userInitials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold text-text-primary sm:text-2xl">
                {fullName || t('profile_settings', 'Profil Ayarları')}
              </h1>
              {isVerified ? (
                <BadgeCheck
                  className="h-5 w-5 shrink-0 text-accent-teal"
                  strokeWidth={1.5}
                  aria-label={t('verified', 'Doğrulanmış')}
                  role="img"
                />
              ) : (
                <ShieldAlert
                  className="h-5 w-5 shrink-0 text-status-warning"
                  strokeWidth={1.5}
                  aria-label={t('unverified', 'Doğrulanmamış')}
                  role="img"
                />
              )}
            </div>

            {user?.email && <p className="mt-1 truncate text-sm text-text-tertiary">{user.email}</p>}
          </div>
        </div>

        <div className="flex flex-wrap shrink-0 items-center gap-2">
          <Link
            to={ROUTES.DASHBOARD}
            className={buttonClasses('secondary', 'sm')}
          >
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

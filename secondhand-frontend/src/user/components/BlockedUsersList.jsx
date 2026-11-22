import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Ban } from 'lucide-react';
import { useBlockedUsers, useUnblockUser } from '../hooks/useBlocking.js';
import { ROUTES } from '../../common/constants/routes.js';
import Button from '../../common/components/ui/Button.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import ErrorState from '../../common/components/ui/ErrorState.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { formatDate } from '../../common/formatters.js';

const BlockedUsersList = ({ isActive = true }) => {
  const { t } = useTranslation();
  const { data: blocked = [], isLoading, isError, refetch } = useBlockedUsers({ enabled: isActive });
  const unblock = useUnblockUser();

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }
  if (isError) {
    return (
      <ErrorState size="compact" title={t('failed_to_load_blocked_users', 'Engellenen kullanıcılar yüklenemedi')} onRetry={refetch} />
    );
  }
  if (blocked.length === 0) {
    return (
      <EmptyState
        icon={Ban}
        title={t('no_blocked_users', 'Engellediğiniz kullanıcı yok')}
        description={t('no_blocked_users_desc', 'Bir kullanıcıyı engellediğinizde burada listelenir.')}
      />
    );
  }

  return (
    <ul className="divide-y divide-border-light">
      {blocked.map((u) => (
        <li key={u.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <Link to={ROUTES.USER_PROFILE(u.id)} className="truncate text-sm font-medium text-text-primary transition-colors duration-150 hover:text-text-link">
              {u.name} {u.surname}
            </Link>
            <p className="text-sm text-text-tertiary">{formatDate(u.blockedAt)}</p>
          </div>
          <Button variant="secondary" size="sm" disabled={unblock.isPending} onClick={() => unblock.mutate(u.id)}>
            {t('unblock', 'Engeli Kaldır')}
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default BlockedUsersList;

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck } from 'lucide-react';
import { useInAppNotificationsContext } from '../InAppNotificationContext.jsx';
import { useNotificationFeed } from '../hooks/useNotificationFeed.js';
import NotificationRow from './NotificationRow.jsx';
import Button from '../../common/components/ui/Button.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { NOTIFICATION_VIEWS, groupNotificationsByTimeline } from '../notificationConstants.js';

const VIEWS = [
  { key: NOTIFICATION_VIEWS.ALL, labelKey: 'all', defaultLabel: 'Tümü' },
  { key: NOTIFICATION_VIEWS.UNREAD, labelKey: 'unread', defaultLabel: 'Okunmamış' }
];
const SKELETON_ROWS = ['a', 'b', 'c', 'd', 'e', 'f'];

const FeedSkeleton = () => (
  <ul className="divide-y divide-border-light" aria-hidden>
    {SKELETON_ROWS.map((k) => (
      <li key={k} className="flex items-start gap-3 px-4 py-3">
        <Skeleton className="h-8 w-8 shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-3 w-8" />
      </li>
    ))}
  </ul>
);

const InboxNotificationsPanel = () => {
  const { t } = useTranslation();
  const [view, setView] = useState(NOTIFICATION_VIEWS.ALL);
  const { unreadCount = 0, markAsRead, markAllAsRead } = useInAppNotificationsContext();
  const {
    notifications,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useNotificationFeed(view);

  const groups = useMemo(() => groupNotificationsByTimeline(notifications), [notifications]);
  const showUnread = view === NOTIFICATION_VIEWS.UNREAD;

  let content;
  if (isLoading) {
    content = <FeedSkeleton />;
  } else if (isError) {
    content = (
      <div className="p-4">
        <Alert
          type="error"
          message={t('notifications_load_failed', 'Bildirimler yüklenemedi.')}
          action={<Button variant="secondary" size="sm" onClick={() => refetch()}>{t('try_again', 'Tekrar dene')}</Button>}
        />
      </div>
    );
  } else if (notifications.length === 0) {
    content = (
      <EmptyState
        icon={Bell}
        title={showUnread
          ? t('no_unread_notifications', 'Okunmamış bildirim yok')
          : t('no_notifications_yet', 'Henüz bildirim yok')}
        description={showUnread
          ? t('all_notifications_read', 'Tüm bildirimlerini okudun.')
          : t('notifications_empty_help', 'Siparişlerin, tekliflerin ve mesajlarınla ilgili güncellemeler burada görünür.')}
        primaryAction={showUnread ? { label: t('show_all', 'Tümünü göster'), onClick: () => setView(NOTIFICATION_VIEWS.ALL) } : null}
      />
    );
  } else {
    content = (
      <>
        {groups.map((group) => (
          <section key={group.key} aria-labelledby={`notif-group-${group.key}`}>
            <h2
              id={`notif-group-${group.key}`}
              className="border-b border-border-light bg-background-secondary px-4 py-1.5 text-xs font-medium text-text-tertiary"
            >
              {t(group.labelKey, group.defaultLabel)}
            </h2>
            <ul className="divide-y divide-border-light">
              {group.items.map((notification) => (
                <NotificationRow key={notification.id} notification={notification} onMarkAsRead={markAsRead} />
              ))}
            </ul>
          </section>
        ))}
        {hasNextPage && (
          <div className="flex justify-center border-t border-border-light p-4">
            <Button variant="secondary" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? t('loading', 'Yükleniyor…') : t('show_more', 'Daha fazla göster')}
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded border border-border bg-background-primary">
      <header className="shrink-0 border-b border-border">
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-text-primary">{t('notifications', 'Bildirimler')}</h1>
            <p className="text-sm text-text-tertiary">
              {unreadCount > 0
                ? t('unread_notifications_count', { defaultValue: '{{count}} okunmamış', count: unreadCount })
                : t('all_caught_up', 'Hepsini okudun')}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>{t('mark_all_read_btn', 'Tümünü okundu yap')}</span>
            </Button>
          )}
        </div>
        <div className="mt-2 flex px-2" role="tablist" aria-label={t('notification_views', 'Bildirim görünümü')}>
          {VIEWS.map((item) => {
            const active = view === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(item.key)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors duration-150 ${
                  active ? 'border-primary font-medium text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {t(item.labelKey, item.defaultLabel)}
              </button>
            );
          })}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto" aria-busy={isLoading}>
        {content}
      </div>
    </div>
  );
};

export default InboxNotificationsPanel;

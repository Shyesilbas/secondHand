import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Calendar,
  CheckCheck,
  Filter,
  Inbox,
  RefreshCw,
  Search as MagnifyingGlassIcon,
  X
} from 'lucide-react';
import { useInAppNotificationsContext } from '../InAppNotificationContext.jsx';
import NotificationCard from './NotificationCard.jsx';
import { Button, EmptyState } from '../../common/components/ui/index.js';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import {
  NOTIFICATION_FILTERS,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_MAP,
  getNotificationConfig,
  groupNotificationsByTimeline
} from '../notificationConstants.js';

const InboxNotificationsSkeleton = ({ t }) => (
  <div
    className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-border bg-background-primary"
    aria-busy="true"
    aria-label={t('loading_notifications', 'Bildirimler yükleniyor')}
  >
    {/* Header Skeleton */}
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3 sm:px-4">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-36 sm:w-52" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>

    {/* Filter Row Skeleton */}
    <div className="flex items-center gap-1.5 border-b border-border-light bg-background-secondary/40 px-3 sm:px-4 py-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-6 w-18 rounded" />
      ))}
    </div>

    {/* Feed Skeleton */}
    <div className="min-h-0 flex-1 space-y-3 p-2.5 sm:p-3.5 overflow-y-auto bg-background-secondary/20">
      <div className="w-full max-w-4xl mx-auto space-y-3">
        <Skeleton className="h-3.5 w-20" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded border border-border bg-background-primary p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Dedicated Notification Hub & Activity Feed
 * Compact, restrained timeline feed with category pills, unread toggle, instant search, and inline actions.
 */
const InboxNotificationsPanel = () => {
  const { t } = useTranslation();
  const {
    notifications = [],
    isLoading,
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
    refetch
  } = useInAppNotificationsContext();

  const [filterCategory, setFilterCategory] = useState(NOTIFICATION_FILTERS.ALL);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Category notification counts for pill badges
  const categoryCounts = useMemo(() => {
    const counts = { [NOTIFICATION_FILTERS.ALL]: notifications.length };
    notifications.forEach((n) => {
      const cat = NOTIFICATION_CATEGORY_MAP[n.type] || NOTIFICATION_FILTERS.SYSTEM;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let list = [...notifications];

    // 1. Category Filter
    if (filterCategory !== NOTIFICATION_FILTERS.ALL) {
      list = list.filter(
        (n) => (NOTIFICATION_CATEGORY_MAP[n.type] || NOTIFICATION_FILTERS.SYSTEM) === filterCategory
      );
    }

    // 2. Unread Filter
    if (onlyUnread) {
      list = list.filter((n) => !n.isRead);
    }

    // 3. Search Query
    if (searchTerm && searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((n) => {
        const titleMatch = n.title?.toLowerCase().includes(q);
        const msgMatch = n.message?.toLowerCase().includes(q);
        const config = getNotificationConfig(n.type);
        const badgeMatch = config?.badge?.toLowerCase().includes(q);
        const catMatch = config?.categoryLabel?.toLowerCase().includes(q);
        let metaMatch = false;
        if (n.metadata) {
          const metaStr = typeof n.metadata === 'string' ? n.metadata : JSON.stringify(n.metadata);
          metaMatch = metaStr.toLowerCase().includes(q);
        }
        return titleMatch || msgMatch || badgeMatch || catMatch || metaMatch;
      });
    }

    return list;
  }, [notifications, filterCategory, onlyUnread, searchTerm]);

  // Group notifications into timeline sections (Bugün, Dün, Bu Hafta, Daha Önce)
  const timelineGroups = useMemo(() => {
    return groupNotificationsByTimeline(filteredNotifications);
  }, [filteredNotifications]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch?.();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  if (isLoading && notifications.length === 0) {
    return <InboxNotificationsSkeleton t={t} />;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-border bg-background-primary">
      {/* 1. Header Control Bar (Compact h-12) */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-2.5 border-b border-border bg-background-primary px-3 sm:px-4">
        {/* Title & Status Summary */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Bell className="h-4.5 w-4.5 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden="true" />

          <div className="min-w-0 flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight">
              {t('notifications', 'Bildirimler')}
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-sm bg-primary px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white">
                {unreadCount > 99 ? '99+' : unreadCount} {t('new_lower', 'yeni')}
              </span>
            )}
            <span className="hidden sm:inline text-xs text-text-muted">
              ({notifications.length})
            </span>
          </div>
        </div>

        {/* Action Controls & Search */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search Input with Clear Button */}
          <div className="relative w-36 sm:w-56">
            <input
              id="notification-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_notifications', 'Bildirimlerde ara...')}
              className="h-8 w-full rounded border border-border bg-background-secondary pl-8 pr-7 text-xs text-text-primary placeholder:text-text-muted focus:border-border-focus focus:bg-background-primary focus:outline-none focus:ring-2 focus:ring-border-focus/20 transition-colors"
            />
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
              strokeWidth={1.5}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                title={t('clear_search', 'Aramayı temizle')}
                aria-label={t('clear_search', 'Aramayı temizle')}
              >
                <X className="h-3 w-3" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-8 w-8 items-center justify-center rounded border border-border bg-background-primary text-text-secondary transition-colors hover:border-card-border-hover hover:bg-background-secondary hover:text-text-primary disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            title={t('refresh', 'Yenile')}
            aria-label={t('refresh', 'Yenile')}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-text-primary' : ''}`}
              strokeWidth={1.5}
            />
          </button>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllAsRead}
              className="!h-8 !px-2.5 text-xs"
              title={t('mark_all_read', 'Tümünü okundu olarak işaretle')}
            >
              <CheckCheck className="h-3.5 w-3.5 text-status-success" strokeWidth={1.5} />
              <span className="hidden sm:inline">{t('mark_all_read_btn', 'Tümünü okundu yap')}</span>
            </Button>
          )}
        </div>
      </header>

      {/* 2. Category Filter Pills & Toggle Row (Compact py-1.5) */}
      <div className="flex items-center justify-between gap-2 border-b border-border-light bg-background-secondary/40 px-3 sm:px-4 py-1.5 shrink-0 overflow-x-auto no-scrollbar">
        {/* Category Pills */}
        <div className="flex items-center gap-1 shrink-0">
          {NOTIFICATION_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = filterCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                  active
                    ? 'bg-primary font-semibold text-white'
                    : 'border border-border bg-background-primary text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                }`}
              >
                <Icon className={`h-3 w-3 ${active ? 'text-white' : 'text-text-muted'}`} strokeWidth={1.5} />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                      active ? 'bg-white/20 text-white' : 'bg-background-tertiary text-text-tertiary'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Unread Only Toggle */}
        <button
          type="button"
          onClick={() => setOnlyUnread((prev) => !prev)}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
            onlyUnread
              ? 'bg-primary font-semibold text-white'
              : 'border border-border bg-background-primary text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
          }`}
        >
          <Filter className="h-3 w-3" strokeWidth={1.5} />
          <span>{t('unread_only', 'Sadece okunmamışlar')}</span>
          {unreadCount > 0 && !onlyUnread && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* 3. Activity Feed Content (Compact p-2.5 sm:p-3.5) */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-background-secondary/20 p-2.5 sm:p-3.5">
        <div className="w-full max-w-4xl mx-auto space-y-3.5">
          {timelineGroups.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={
                searchTerm
                  ? t('no_matching_notifications', 'Arama kriterlerine uygun bildirim bulunamadı')
                  : onlyUnread
                  ? t('no_unread_notifications', 'Okunmamış bildirim bulunmuyor')
                  : t('no_notifications_yet', 'Henüz bildirim bulunmuyor')
              }
              description={
                searchTerm
                  ? t('try_different_search', 'Farklı bir arama terimi deneyebilir veya filtreleri temizleyebilirsiniz.')
                  : onlyUnread
                  ? t('all_notifications_read', 'Tüm bildirimlerinizi okudunuz. Yeni bir hareket olduğunda burada listelenecektir.')
                  : t('notifications_empty_help', 'Siparişleriniz, teklifleriniz ve mesajlarınızla ilgili tüm güncellemeler burada yer alır.')
              }
              primaryAction={
                searchTerm || onlyUnread || filterCategory !== NOTIFICATION_FILTERS.ALL
                  ? {
                      label: t('clear_filters', 'Filtreleri temizle'),
                      onClick: () => {
                        setSearchTerm('');
                        setOnlyUnread(false);
                        setFilterCategory(NOTIFICATION_FILTERS.ALL);
                      }
                    }
                  : undefined
              }
            />
          ) : (
            timelineGroups.map((group) => (
              <div key={group.key} className="space-y-2">
                {/* Timeline Header */}
                <div className="flex items-center gap-2.5 px-0.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {group.title}
                  </span>
                  <div className="h-px flex-1 bg-border-light" />
                  <span className="text-xs font-medium text-text-muted tabular-nums">
                    {group.items.length} {t('notifications_count_lower', 'bildirim')}
                  </span>
                </div>

                {/* Cards List (Tight spacing) */}
                <div className="space-y-1.5">
                  {group.items.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxNotificationsPanel;
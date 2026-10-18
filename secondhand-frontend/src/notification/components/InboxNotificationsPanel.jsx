import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Filter, RefreshCw, Search as MagnifyingGlassIcon, X, Inbox, Calendar } from 'lucide-react';
import { useInAppNotificationsContext } from '../InAppNotificationContext.jsx';
import NotificationCard from './NotificationCard.jsx';
import {
  NOTIFICATION_FILTERS,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_MAP,
  getNotificationConfig,
  groupNotificationsByTimeline
} from '../notificationConstants.js';

/**
 * Dedicated Notification Hub & Activity Feed
 * Clean, interactive timeline feed with category pills, unread toggle, search, and direct in-card actions.
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
        return titleMatch || msgMatch || badgeMatch || catMatch;
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
    return (
      <div className="h-full w-full rounded border border-border bg-background-primary p-4" aria-busy="true" aria-label={t('loading_notifications', 'Bildirimler yükleniyor...')}>
        <SkeletonList />
      </div>
    );
  }

  return (
    <div className="min-h-0 h-full w-full bg-white border border-border/90 rounded-md flex flex-col overflow-hidden">
      {/* 1. Header Control Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-border/80 bg-white px-5 sm:px-7 py-3.5 sm:py-4 shrink-0">
        {/* Title & Status Summary */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Bell className="shrink-0 h-5 w-5 text-text-primary" strokeWidth={1.5} aria-hidden />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-text-primary tracking-tight">
                {t('notifications', 'Bildirimler')}
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-sm bg-primary text-white text-xs font-semibold tabular-nums">
                  {unreadCount > 99 ? '99+' : unreadCount} yeni
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted font-medium truncate mt-0.5">
              {notifications.length} {t('total_notifications_count', 'toplam bildirim • Sipariş, teklif ve mesaj güncellemeleri')}
            </p>
          </div>
        </div>

        {/* Action Controls & Search */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Input with Clear Button */}
          <div className="relative w-full sm:w-60">
            <input
              id="notification-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_notifications', 'Bildirimlerde ara...')}
              className="h-9.5 w-full rounded border border-border bg-background-secondary/70 pl-8.5 pr-8 text-xs text-text-primary placeholder:text-text-muted focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
            />
            <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-text-muted hover:text-text-secondary hover:bg-secondary-200/60 transition-colors"
                title={t('clear_search', 'Aramayı Temizle')}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded p-2.5 text-text-muted hover:bg-background-tertiary hover:text-text-primary transition-colors border border-border/70 cursor-pointer"
            title={t('refresh', 'Yenile')}
            aria-label={t('refresh', 'Yenile')}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-text-primary' : ''}`} />
          </button>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3"
              title={t('mark_all_read', 'Tümünü okundu olarak işaretle')}
            >
              <CheckCheck className="h-4 w-4 text-status-success-text" />
              <span className="hidden md:inline">{t('mark_all_read_btn', 'Tümünü Okundu Yap')}</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Category Filter Pills & Toggle Row */}
      <div className="flex items-center justify-between gap-3 border-b border-border-light bg-background-secondary/60 px-5 sm:px-7 py-2.5 shrink-0 overflow-x-auto no-scrollbar">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {NOTIFICATION_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = filterCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border/90 text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-text-muted'}`} />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-md text-xs tabular-nums font-semibold ${
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
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
            onlyUnread
              ? 'bg-primary text-white'
              : 'bg-white border border-border/90 text-text-secondary hover:bg-background-tertiary'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>{t('unread_only', 'Sadece Okunmamışlar')}</span>
          {unreadCount > 0 && !onlyUnread && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      </div>

      {/* 3. Activity Feed Content */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-background-secondary/40 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {timelineGroups.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-md border border-border/80 my-6">
              <Inbox className="mb-4 h-5 w-5 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
              <h3 className="text-base font-semibold text-text-primary mb-1.5">
                {searchTerm
                  ? 'Arama Kriterlerine Uygun Bildirim Yok'
                  : onlyUnread
                  ? 'Harika! Okunmamış Bildiriminiz Yok'
                  : 'Henüz Bildiriminiz Bulunmuyor'}
              </h3>
              <p className="text-xs text-text-tertiary max-w-sm leading-relaxed font-medium">
                {searchTerm
                  ? 'Farklı bir anahtar kelime deneyebilir veya filtreleri sıfırlayabilirsiniz.'
                  : onlyUnread
                  ? 'Tüm bildirimlerinizi okudunuz. Yeni bir hareket olduğunda burada görünecektir.'
                  : 'Siparişleriniz, teklifleriniz ve mesajlarınızla ilgili tüm güncellemeler burada listelenecektir.'}
              </p>

              {(searchTerm || onlyUnread || filterCategory !== NOTIFICATION_FILTERS.ALL) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setOnlyUnread(false);
                    setFilterCategory(NOTIFICATION_FILTERS.ALL);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3 mt-5"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          ) : (
            /* Grouped Timeline Cards */
            timelineGroups.map((group) => (
              <div key={group.key} className="space-y-3">
                {/* Timeline Header */}
                <div className="flex items-center gap-3 px-1">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                    <Calendar className="h-3.5 w-3.5" />
                    {group.title}
                  </span>
                  <div className="h-px flex-1 bg-secondary-200/80" />
                  <span className="text-xs font-semibold text-text-muted tabular-nums">
                    {group.items.length} bildirim
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5">
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
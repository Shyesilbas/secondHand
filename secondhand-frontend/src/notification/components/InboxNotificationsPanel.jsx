import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CheckCheck,
  Filter,
  Loader2,
  RefreshCw,
  Search as MagnifyingGlassIcon,
  Inbox,
  Calendar
} from 'lucide-react';
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
      <div className="min-h-0 h-full w-full bg-white border border-slate-200/90 rounded-3xl flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <span className="text-xs font-semibold">{t('loading_notifications', 'Bildirimler yükleniyor...')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-0 h-full w-full bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-xs">
      {/* 1. Header Control Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 bg-white px-5 sm:px-7 py-3.5 sm:py-4 shrink-0">
        {/* Title & Status Summary */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs">
            <Bell className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                {t('notifications', 'Bildirimler')}
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold tabular-nums shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount} yeni
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
              {notifications.length} toplam bildirim • Sipariş, teklif ve mesaj güncellemeleri
            </p>
          </div>
        </div>

        {/* Action Controls & Search */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <input
              id="notification-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_notifications', 'Bildirimlerde ara...')}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
            title={t('refresh', 'Yenile')}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-[0.98] transition-all"
              title={t('mark_all_read', 'Tümünü okundu olarak işaretle')}
            >
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              <span className="hidden md:inline">{t('mark_all_read_btn', 'Tümünü Okundu Yap')}</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Category Filter Pills & Toggle Row */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 sm:px-7 py-2.5 shrink-0 overflow-x-auto no-scrollbar">
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
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-md text-[10px] tabular-nums font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
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
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            onlyUnread
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>{t('unread_only', 'Sadece Okunmamışlar')}</span>
        </button>
      </div>

      {/* 3. Activity Feed Content */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {timelineGroups.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs my-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-500 mb-4 shadow-2xs">
                <Inbox className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                {searchTerm
                  ? 'Arama Kriterlerine Uygun Bildirim Yok'
                  : onlyUnread
                  ? 'Harika! Okunmamış Bildiriminiz Yok'
                  : 'Henüz Bildiriminiz Bulunmuyor'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
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
                  className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
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
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {group.title}
                  </span>
                  <div className="h-px flex-1 bg-slate-200/80" />
                  <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
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
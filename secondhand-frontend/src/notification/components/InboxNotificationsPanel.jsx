import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { useInAppNotificationsContext } from '../InAppNotificationContext.jsx';
import NotificationItem from './NotificationItem.jsx';

const MS_BORDER = '#edebe9';
const MS_HEADER = '#f3f2f1';

/** Tam sayfa bildirim listesi — Mailbox ile aynı kabuk ve üst şerit. */
const InboxNotificationsPanel = () => {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead, refetch } =
    useInAppNotificationsContext();

  if (isLoading) {
    return (
      <div
        className="flex h-[clamp(480px,min(88vh,920px))] flex-col overflow-hidden rounded-2xl border bg-white"
        style={{ borderColor: MS_BORDER }}
      >
        <div
          className="flex h-14 shrink-0 items-center border-b px-4"
          style={{ borderColor: MS_BORDER, backgroundColor: MS_HEADER }}
        />
        <div className="flex flex-1 items-center justify-center px-6 text-sm text-[#605e5c]">
          Loading notifications…
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-[clamp(480px,min(88vh,920px))] flex-col overflow-hidden rounded-2xl border bg-white"
      style={{ borderColor: MS_BORDER }}
    >
      {/* Üst şerit — Mailbox ile hizalı */}
      <header
        className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-5"
        style={{ borderColor: MS_BORDER, backgroundColor: MS_HEADER }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0078d4]/10 text-[#0078d4]">
            <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-[#323130] sm:text-base">Notifications</h1>
            <p className="truncate text-xs text-[#605e5c]">
              {notifications?.length
                ? `${notifications.length} item${notifications.length === 1 ? '' : 's'}`
                : 'Your alerts and updates'}
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="hidden shrink-0 rounded-full bg-[#0078d4] px-2.5 py-0.5 text-xs font-bold text-white sm:inline">
              {unreadCount > 99 ? '99+' : unreadCount} new
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md p-2 text-[#605e5c] transition-colors hover:bg-black/[0.05] hover:text-[#323130]"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#edebe9] bg-white px-3 py-2 text-xs font-semibold text-[#323130] shadow-sm transition hover:bg-[#faf9f8]"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5 text-[#0078d4]" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>
      </header>

      {notifications.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f2f1] text-[#8a8886]">
            <Bell className="h-7 w-7" strokeWidth={1.25} />
          </div>
          <p className="text-base font-semibold text-[#323130]">You&apos;re all caught up</p>
          <p className="max-w-sm text-sm text-[#605e5c]">No notifications yet. We&apos;ll show offers, orders, and messages here.</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onMarkAsRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InboxNotificationsPanel;

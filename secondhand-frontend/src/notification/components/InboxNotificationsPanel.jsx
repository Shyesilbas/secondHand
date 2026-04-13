import { CheckCheck } from 'lucide-react';
import { useInAppNotificationsContext } from '../InAppNotificationContext.jsx';
import NotificationItem from './NotificationItem.jsx';

/** Tam sayfa bildirim listesi (Inbox sekmesi). */
const InboxNotificationsPanel = () => {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useInAppNotificationsContext();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-sm">
        Loading notifications…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-950/5">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            title="Mark all as read"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-slate-500">No notifications yet.</div>
      ) : (
        <div className="max-h-[min(70vh,560px)] divide-y divide-slate-100 overflow-y-auto">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onMarkAsRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InboxNotificationsPanel;

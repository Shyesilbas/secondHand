import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import {
  describeNotification,
  formatRelativeTime,
  getNotificationIcon,
  getNotificationTargetRoute
} from '../notificationConstants.js';

const NotificationRow = ({ notification, onMarkAsRead }) => {
  const { t } = useTranslation();
  const isUnread = !notification.isRead;
  const Icon = getNotificationIcon(notification.type);
  const target = getNotificationTargetRoute(notification);
  const { title, message } = describeNotification(notification, t);
  const time = formatRelativeTime(notification.createdAt);

  const markRead = () => {
    if (isUnread) onMarkAsRead?.(notification.id);
  };

  const body = (
    <>
      <p className={`truncate text-sm ${isUnread ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>{title}</p>
      {message && <p className="mt-0.5 line-clamp-2 text-sm text-text-tertiary">{message}</p>}
    </>
  );

  return (
    <li className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-background-secondary">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-background-tertiary text-text-secondary">
        <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </span>

      {target ? (
        <Link
          to={target}
          onClick={markRead}
          className="min-w-0 flex-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          {body}
        </Link>
      ) : (
        <div className="min-w-0 flex-1">{body}</div>
      )}

      <div className="flex shrink-0 items-center gap-1 pt-0.5">
        <time dateTime={notification.createdAt} className="text-xs tabular-nums text-text-tertiary">{time}</time>
        {isUnread ? (
          <button
            type="button"
            onClick={markRead}
            className="group/mark flex h-6 w-6 items-center justify-center rounded text-text-secondary hover:bg-background-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            aria-label={t('mark_as_read', 'Okundu olarak işaretle')}
            title={t('mark_as_read', 'Okundu olarak işaretle')}
          >
            <span className="h-2 w-2 rounded-full bg-primary group-hover/mark:hidden group-focus-visible/mark:hidden" aria-hidden />
            <Check className="hidden h-3.5 w-3.5 group-hover/mark:block group-focus-visible/mark:block" strokeWidth={1.5} aria-hidden />
          </button>
        ) : (
          <span className="h-6 w-6" aria-hidden />
        )}
      </div>
    </li>
  );
};

export default NotificationRow;

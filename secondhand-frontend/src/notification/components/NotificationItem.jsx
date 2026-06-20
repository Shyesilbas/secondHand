import {
  Award,
  CheckCircle,
  ChevronRight,
  DollarSign,
  MessageCircle,
  Package,
  RefreshCw,
  ShoppingCart,
  Star,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';

const MS_BORDER = '#edebe9';
const MS_ACCENT = '#0078d4';

/** Bildirim tipine göre ikon + rota (Fluent liste satırı). */
const getNotificationIcon = (type) => {
  const map = {
    OFFER_RECEIVED: MessageCircle,
    OFFER_ACCEPTED: CheckCircle,
    OFFER_REJECTED: XCircle,
    OFFER_COUNTERED: MessageCircle,
    OFFER_EXPIRED: XCircle,
    ORDER_CREATED: ShoppingCart,
    ORDER_STATUS_CHANGED: Package,
    ORDER_CANCELLED: XCircle,
    ORDER_RECEIVED: Package,
    ORDER_COMPLETED: CheckCircle,
    ORDER_REFUNDED: RefreshCw,
    CHAT_MESSAGE_RECEIVED: MessageCircle,
    LISTING_PRICE_DROPPED: DollarSign,
    LISTING_NEW_FROM_FOLLOWED: Package,
    LISTING_SOLD: Package,
    LISTING_FAVORITED: Star,
    REVIEW_RECEIVED: Star,
    PAYMENT_SUCCESS: CheckCircle,
    PAYMENT_FAILED: XCircle,
    AGREEMENT_UPDATED: Package,
    GREAT_SELLER_ACHIEVED: Award,
  };
  return map[type] || MessageCircle;
};

const getNotificationRoute = (notification) => {
  const { type, relatedEntityId, metadata } = notification;
  switch (type) {
    case 'OFFER_RECEIVED':
    case 'OFFER_ACCEPTED':
    case 'OFFER_REJECTED':
    case 'OFFER_COUNTERED':
    case 'OFFER_EXPIRED':
      return ROUTES.OFFERS;
    case 'ORDER_CREATED':
    case 'ORDER_STATUS_CHANGED':
    case 'ORDER_CANCELLED':
    case 'ORDER_RECEIVED':
    case 'ORDER_COMPLETED':
    case 'ORDER_REFUNDED':
      return relatedEntityId
        ? `${ROUTES.MY_ORDERS}?orderId=${encodeURIComponent(relatedEntityId)}`
        : ROUTES.MY_ORDERS;
    case 'CHAT_MESSAGE_RECEIVED': {
      const cid = metadata?.conversationId;
      return cid
        ? `${ROUTES.INBOX}?tab=chat&room=${encodeURIComponent(cid)}`
        : `${ROUTES.INBOX}?tab=chat`;
    }
    case 'LISTING_PRICE_DROPPED':
    case 'LISTING_NEW_FROM_FOLLOWED':
    case 'LISTING_SOLD':
    case 'LISTING_FAVORITED':
      return relatedEntityId ? ROUTES.LISTING_DETAIL(relatedEntityId) : ROUTES.LISTINGS;
    case 'REVIEW_RECEIVED':
      return ROUTES.PROFILE;
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
      return ROUTES.EWALLET;
    case 'AGREEMENT_UPDATED':
      return ROUTES.MY_ORDERS;
    case 'GREAT_SELLER_ACHIEVED':
      return ROUTES.PROFILE;
    default:
      return ROUTES.HOME;
  }
};

const formatRelativeTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Premium Notification Item — Elegant design matching the brand new list systems:
 * uses dynamic indicator dots, custom rounded boxes, and scale hovers.
 */
const NotificationItem = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  const Icon = getNotificationIcon(notification.type);
  const unread = !notification.isRead;
  const route = getNotificationRoute(notification);

  const handleClick = () => {
    if (unread) onMarkAsRead(notification.id);
    navigate(route);
  };

  const preview =
    notification.message ||
    (notification.metadata && typeof notification.metadata.preview === 'string'
      ? notification.metadata.preview
      : null);

  // Dynamic style category color for the icon background
  const getIconTheme = () => {
    const type = notification.type;
    if (type?.startsWith('OFFER_')) {
      return unread
        ? 'bg-amber-50 border-amber-100 text-amber-600 shadow-amber-100/30'
        : 'bg-slate-50 border-slate-100 text-amber-500/80';
    }
    if (type?.startsWith('ORDER_') || type === 'PAYMENT_SUCCESS') {
      return unread
        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-100/30'
        : 'bg-slate-50 border-slate-100 text-emerald-500/80';
    }
    if (type === 'PAYMENT_FAILED' || type === 'ORDER_CANCELLED') {
      return unread
        ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-rose-100/30'
        : 'bg-slate-50 border-slate-100 text-rose-500/80';
    }
    return unread
      ? 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-indigo-100/30'
      : 'bg-slate-50 border-slate-100 text-indigo-500/80';
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group relative flex w-full items-start gap-4 p-4 text-left transition-all duration-300 border-b border-slate-100/80 focus:outline-none focus-visible:bg-slate-50 ${
        unread 
          ? 'bg-gradient-to-r from-indigo-50/[0.15] to-transparent hover:from-indigo-50/[0.25]' 
          : 'bg-white hover:bg-slate-50/50'
      }`}
    >
      {/* Unread Indicator dot */}
      {unread && (
        <span
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.7)] animate-pulse"
          aria-hidden
        />
      )}

      {/* Styled Icon wrapper */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 shadow-sm ${getIconTheme()} group-hover:scale-105`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
      </div>

      <div className="min-w-0 flex-1 pt-0.5 pl-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={`min-w-0 truncate text-sm sm:text-sm leading-snug tracking-tight ${unread ? 'font-bold text-slate-800' : 'font-semibold text-slate-500'}`}
            title={notification.title}
          >
            {notification.title}
          </p>
          <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-400 tabular-nums">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        {preview && (
          <p className="mt-1 line-clamp-2 text-body sm:text-sm leading-relaxed text-slate-400 font-medium">{preview}</p>
        )}
      </div>

      <ChevronRight
        className="mt-2 h-4.5 w-4.5 shrink-0 text-slate-300 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5"
        aria-hidden
      />
    </button>
  );
};

export default NotificationItem;

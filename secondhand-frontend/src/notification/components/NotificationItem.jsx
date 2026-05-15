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
 * Tek bildirim — Mailbox satırıyla uyumlu: sol accent, ikon, başlık + özet, sağ zaman.
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

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex w-full items-start gap-3 border-b px-3 py-3 text-left transition sm:gap-4 sm:px-4 sm:py-3.5"
      style={{
        borderColor: MS_BORDER,
        backgroundColor: unread ? '#f5f9fc' : '#ffffff',
      }}
    >
      {/* Okunmamış sol accent */}
      <span
        className="absolute left-0 top-0 h-full w-1 rounded-none"
        style={{ backgroundColor: unread ? MS_ACCENT : 'transparent' }}
        aria-hidden
      />

      <div
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11"
        style={{
          backgroundColor: unread ? `${MS_ACCENT}14` : '#f3f2f1',
          color: unread ? MS_ACCENT : '#605e5c',
        }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p
            className={`min-w-0 truncate text-sm ${unread ? 'font-semibold text-[#323130]' : 'font-medium text-[#605e5c]'}`}
            title={notification.title}
          >
            {notification.title}
          </p>
          <span className="ml-auto shrink-0 whitespace-nowrap text-xs text-[#605e5c]">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        {preview && (
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-[#605e5c]">{preview}</p>
        )}
      </div>

      <ChevronRight
        className="mt-1.5 h-4 w-4 shrink-0 text-[#c7c7c7] opacity-0 transition group-hover:opacity-100 sm:opacity-70"
        aria-hidden
      />
    </button>
  );
};

export default NotificationItem;

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight
} from 'lucide-react';
import {
  getNotificationConfig,
  getNotificationTargetRoute,
  formatRelativeTime
} from '../notificationConstants.js';

/* ── Status dot and label mapping ────────────────────────── */
const STATUS_LABELS = {
  DELIVERED: { label: 'Teslim Edildi', dotClass: 'bg-status-success' },
  SHIPPED: { label: 'Kargoya Verildi', dotClass: 'bg-primary' },
  PREPARING: { label: 'Hazırlanıyor', dotClass: 'bg-status-warning' },
  CONFIRMED: { label: 'Onaylandı', dotClass: 'bg-primary' },
  CANCELLED: { label: 'İptal Edildi', dotClass: 'bg-status-error' },
  REFUNDED: { label: 'İade Edildi', dotClass: 'bg-text-tertiary' },
  ACCEPTED: { label: 'Kabul Edildi', dotClass: 'bg-status-success' },
  REJECTED: { label: 'Reddedildi', dotClass: 'bg-status-error' },
  EXPIRED: { label: 'Süresi Doldu', dotClass: 'bg-text-tertiary' },
  COUNTERED: { label: 'Karşı Teklif', dotClass: 'bg-status-warning' }
};

// Internal keys handled by first-class metadata or suppressed from display
const SUPPRESSED_KEYS = new Set([
  'orderId',
  'orderItemId',
  'listingId',
  'userId',
  'sellerId',
  'buyerId',
  'actorUserId',
  'reviewId',
  'conversationId',
  'chatRoomId',
  'senderId',
  'messageId',
  'offerId',
  'paymentId',
  'id',
  'type',
  'status',
  'oldStatus',
  'newStatus',
  'orderNumber',
  'listingTitle',
  'amount',
  'amountText',
  'currency',
  'offerAmount',
  'price',
  'counterAmount',
  'oldPrice',
  'newPrice',
  'rating',
  'carrier',
  'trackingNumber',
  'transactionType',
  'agreementType',
  'version'
]);

const formatNotificationPrice = (rawAmount, currency = 'TRY') => {
  if (rawAmount == null || rawAmount === '') return null;
  const num = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(',', '.'));
  if (isNaN(num)) return null;

  const cur = (currency || 'TRY').toUpperCase();
  const symbol = cur === 'TRY' || cur === 'TL' ? '₺' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : `${cur} `;
  const hasDecimals = num % 1 !== 0;

  return `${symbol}${num.toLocaleString('tr-TR', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  })}`;
};

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  const isUnread = !notification?.isRead;
  const config = getNotificationConfig(notification?.type);
  const Icon = config.icon;
  const targetRoute = getNotificationTargetRoute(notification);

  const parsedMetadata = useMemo(() => {
    if (!notification?.metadata) return null;
    if (typeof notification.metadata === 'object') return notification.metadata;
    try {
      return JSON.parse(notification.metadata);
    } catch {
      return null;
    }
  }, [notification?.metadata]);

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    if (isUnread) {
      onMarkAsRead?.(notification.id);
    }
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  const handleQuickMarkRead = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  // Smart metadata extraction
  const orderNumber = parsedMetadata?.orderNumber;
  const newStatus = parsedMetadata?.newStatus;
  const statusInfo = newStatus ? STATUS_LABELS[newStatus] : null;
  const listingTitle = parsedMetadata?.listingTitle;
  const rawAmount =
    parsedMetadata?.amountText ??
    parsedMetadata?.offerAmount ??
    parsedMetadata?.counterAmount ??
    parsedMetadata?.amount ??
    parsedMetadata?.price;
  const currency = parsedMetadata?.currency || 'TRY';
  const formattedAmount = formatNotificationPrice(rawAmount, currency);
  const transactionType = parsedMetadata?.transactionType;
  const oldPrice = parsedMetadata?.oldPrice;
  const newPrice = parsedMetadata?.newPrice;
  const rating = parsedMetadata?.rating;
  const version = parsedMetadata?.version;
  const carrier = parsedMetadata?.carrier;
  const trackingNumber = parsedMetadata?.trackingNumber;

  const remainingAttributes = useMemo(() => {
    if (!parsedMetadata) return [];
    return Object.entries(parsedMetadata).filter(([key, value]) => {
      if (SUPPRESSED_KEYS.has(key)) return false;
      if (typeof value === 'object' || value === null || value === undefined) return false;
      if (/Id$/i.test(key)) return false;
      return true;
    });
  }, [parsedMetadata]);

  // Flat bullet-separated metadata items (no boxes)
  const metaItems = useMemo(() => {
    const items = [];

    if (listingTitle) {
      items.push({
        key: 'listing',
        content: listingTitle,
        className: 'font-medium text-text-primary'
      });
    }

    if (formattedAmount) {
      items.push({
        key: 'amount',
        content: formattedAmount,
        className: 'font-semibold text-text-primary tabular-nums'
      });
    }

    if (oldPrice && newPrice) {
      items.push({
        key: 'priceChange',
        content: `₺${Number(oldPrice).toLocaleString('tr-TR')} → ₺${Number(newPrice).toLocaleString('tr-TR')}`,
        className: 'font-semibold text-text-primary tabular-nums'
      });
    }

    if (transactionType) {
      items.push({
        key: 'transactionType',
        content: transactionType,
        className: 'text-text-secondary'
      });
    }

    if (orderNumber) {
      items.push({
        key: 'order',
        content: `#${orderNumber}`,
        className: 'font-mono text-text-muted'
      });
    }

    if (trackingNumber) {
      items.push({
        key: 'tracking',
        content: `${carrier ? carrier + ': ' : ''}${trackingNumber}`
      });
    }

    if (rating) {
      items.push({
        key: 'rating',
        content: `★ ${rating}/5`
      });
    }

    if (version) {
      items.push({
        key: 'version',
        content: `v${version}`
      });
    }

    remainingAttributes.forEach(([key, value]) => {
      items.push({
        key,
        content: String(value)
      });
    });

    return items;
  }, [
    listingTitle,
    formattedAmount,
    oldPrice,
    newPrice,
    transactionType,
    orderNumber,
    trackingNumber,
    carrier,
    rating,
    version,
    remainingAttributes
  ]);

  return (
    <article
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`${notification.title || config.badge} - ${formatRelativeTime(notification.createdAt)}`}
      className={`group relative flex items-start gap-3 rounded border p-3 sm:p-3.5 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
        isUnread
          ? 'border-border bg-background-secondary/40 hover:border-card-border-hover'
          : 'border-border bg-background-primary hover:border-card-border-hover'
      }`}
    >
      {/* Icon Column */}
      <div className="mt-0.5 shrink-0">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-text-secondary" strokeWidth={1.5} aria-hidden="true" />
      </div>

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Top Line: Title + Status + Timestamp + Action */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h3
              className={`text-sm tracking-tight truncate ${
                isUnread ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'
              }`}
              title={notification.title}
            >
              {notification.title}
            </h3>

            {isUnread && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-background-secondary px-1.5 py-0.5 text-xs font-medium text-text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                <span>Yeni</span>
              </span>
            )}

            {statusInfo && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-background-secondary px-1.5 py-0.5 text-xs font-medium text-text-secondary">
                <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotClass}`} aria-hidden="true" />
                <span>{statusInfo.label}</span>
              </span>
            )}
          </div>

          {/* Right: Time, Quick Action, Chevron */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <span className="text-xs font-normal text-text-muted tabular-nums whitespace-nowrap">
              {formatRelativeTime(notification.createdAt)}
            </span>

            {isUnread && (
              <button
                type="button"
                onClick={handleQuickMarkRead}
                className="relative z-10 flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-background-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                title="Okundu olarak işaretle"
                aria-label="Okundu olarak işaretle"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}

            <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors shrink-0" strokeWidth={1.5} />
          </div>
        </div>

        {/* Message Body */}
        {notification.message && (
          <p className="text-xs sm:text-sm text-text-secondary leading-snug line-clamp-2 font-normal">
            {notification.message}
          </p>
        )}

        {/* Flat bullet-separated metadata line (no boxes) */}
        {metaItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-secondary pt-0.5">
            {metaItems.map((item, idx) => (
              <span key={item.key || idx} className="inline-flex items-center gap-1.5">
                {idx > 0 && <span className="text-text-muted select-none" aria-hidden="true">•</span>}
                <span className={item.className || ''}>{item.content}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default NotificationCard;

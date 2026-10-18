import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Package,
  ShoppingBag,
  Truck,
  Tag
} from 'lucide-react';
import {
  getNotificationConfig,
  getNotificationTargetRoute,
  formatRelativeTime
} from '../notificationConstants.js';

/* ── Smart Metadata Formatter Helpers ────────────────────────── */

const STATUS_LABELS = {
  DELIVERED: { label: 'Teslim Edildi', color: 'bg-background-secondary text-status-success-text border-border' },
  SHIPPED: { label: 'Kargoya Verildi', color: 'bg-background-secondary text-text-primary border-border' },
  PREPARING: { label: 'Hazırlanıyor', color: 'bg-background-secondary text-status-warning-text border-border' },
  CONFIRMED: { label: 'Onaylandı', color: 'bg-background-secondary text-text-primary border-border' },
  CANCELLED: { label: 'İptal Edildi', color: 'bg-background-secondary text-status-error-text border-border' },
  REFUNDED: { label: 'İade Edildi', color: 'bg-background-secondary text-text-primary border-border' },
  ACCEPTED: { label: 'Kabul Edildi', color: 'bg-background-secondary text-status-success-text border-border' },
  REJECTED: { label: 'Reddedildi', color: 'bg-background-secondary text-status-error-text border-border' },
  EXPIRED: { label: 'Süresi Doldu', color: 'bg-background-tertiary text-text-secondary border-border' },
  COUNTERED: { label: 'Karşı Teklif', color: 'bg-background-secondary text-status-warning-text border-border' }
};

// Internal keys to suppress from user view
const SUPPRESSED_KEYS = new Set([
  'orderId',
  'listingId',
  'userId',
  'sellerId',
  'buyerId',
  'conversationId',
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
  'offerAmount',
  'price',
  'counterAmount',
  'carrier',
  'trackingNumber'
]);

const NotificationCard = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  const isUnread = !notification.isRead;
  const config = getNotificationConfig(notification.type);
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

  const handleCardClick = () => {
    if (isUnread) {
      onMarkAsRead?.(notification.id);
    }
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const handleQuickMarkRead = (e) => {
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  // Extract smart fields
  const orderNumber = parsedMetadata?.orderNumber;
  const newStatus = parsedMetadata?.newStatus;
  const statusInfo = newStatus ? STATUS_LABELS[newStatus] : null;
  const listingTitle = parsedMetadata?.listingTitle;
  const amount = parsedMetadata?.offerAmount ?? parsedMetadata?.counterAmount ?? parsedMetadata?.amount ?? parsedMetadata?.price;
  const carrier = parsedMetadata?.carrier;
  const trackingNumber = parsedMetadata?.trackingNumber;

  // Additional custom attributes (excluding internal IDs)
  const remainingAttributes = useMemo(() => {
    if (!parsedMetadata) return [];
    return Object.entries(parsedMetadata).filter(([key, value]) => {
      if (SUPPRESSED_KEYS.has(key)) return false;
      if (typeof value === 'object' || value === null || value === undefined) return false;
      return true;
    });
  }, [parsedMetadata]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`group relative flex flex-col gap-3.5 rounded-md p-4 sm:p-5 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isUnread
          ? 'bg-background-secondary/40 border border-border/90 hover:border-card-border-hover'
          : 'bg-white border border-border/80 hover:bg-background-secondary/40 hover:border-card-border-hover'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <Icon className={`h-5 w-5 shrink-0 ${config.iconClass}`} strokeWidth={1.5} aria-hidden />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center text-xs font-medium ${config.badgeClass}`}
              >
                {config.badge}
              </span>

              {isUnread && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary bg-background-secondary px-2 py-0.5 rounded-sm border border-border-light/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Yeni
                </span>
              )}

              {/* Status Transition Badge (if present) */}
              {statusInfo && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              )}
            </div>

            <h3
              className={`text-sm sm:text-base mt-1 truncate tracking-tight ${
                isUnread ? 'font-semibold text-text-primary' : 'font-semibold text-text-secondary'
              }`}
              title={notification.title}
            >
              {notification.title}
            </h3>
          </div>
        </div>

        {/* Right Info & Quick Mark as Read Action */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-text-muted tabular-nums whitespace-nowrap">
            {formatRelativeTime(notification.createdAt)}
          </span>

          {isUnread && (
            <button
              type="button"
              onClick={handleQuickMarkRead}
              className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-background-secondary hover:text-status-success-text transition-all border border-transparent hover:border-border"
              title="Okundu olarak işaretle"
              aria-label="Okundu olarak işaretle"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Body */}
      {notification.message && (
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium pl-0 sm:pl-13.5">
          {notification.message}
        </p>
      )}

      {/* Smart Contextual Badges (Order #, Product, Amount, Carrier) */}
      {(orderNumber || listingTitle || amount != null || trackingNumber || remainingAttributes.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 pl-0 sm:pl-13.5 pt-0.5">
          {/* Clean Order Number Badge */}
          {orderNumber && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-tertiary text-text-secondary text-xs font-mono font-semibold border border-border/80">
              <Package className="w-3 h-3 text-text-muted" />
              <span>#{orderNumber}</span>
            </span>
          )}

          {/* Product Pill */}
          {listingTitle && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-secondary text-text-secondary text-xs font-semibold border border-border/80 max-w-64 truncate"
              title={listingTitle}
            >
              <ShoppingBag className="w-3 h-3 text-text-muted shrink-0" />
              <span className="truncate">{listingTitle}</span>
            </span>
          )}

          {/* Offer/Price Amount */}
          {amount != null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-background-secondary text-status-success-text text-xs font-semibold border border-border">
              <Tag className="w-3 h-3 text-status-success-text" />
              <span>₺{Number(amount).toLocaleString('tr-TR')}</span>
            </span>
          )}

          {/* Tracking Number */}
          {trackingNumber && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-secondary text-text-primary text-xs font-semibold border border-border">
              <Truck className="w-3 h-3 text-text-primary" />
              <span>{carrier ? `${carrier}: ` : ''}{trackingNumber}</span>
            </span>
          )}

          {/* Any other human-friendly custom attributes */}
          {remainingAttributes.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-secondary border border-border/80 text-xs font-medium text-text-secondary"
            >
              <span className="text-text-muted font-semibold">{key}:</span>
              <span className="text-text-primary font-semibold truncate max-w-44">
                {String(value)}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Bottom Action Strip */}
      <div className="flex items-center justify-between pt-2.5 border-t border-border-light mt-0.5 pl-0 sm:pl-13.5">
        <span className="text-xs font-semibold text-text-muted">
          {config.categoryLabel}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary hover:text-text-primary transition-all cursor-pointer"
        >
          <span>{config.actionLabel}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;

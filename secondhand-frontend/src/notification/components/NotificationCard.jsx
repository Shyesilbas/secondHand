import React, { useMemo } from 'react';
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
  DELIVERED: { label: 'Teslim Edildi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SHIPPED: { label: 'Kargoya Verildi', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  PREPARING: { label: 'Hazırlanıyor', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Onaylandı', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  CANCELLED: { label: 'İptal Edildi', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  REFUNDED: { label: 'İade Edildi', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  ACCEPTED: { label: 'Kabul Edildi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Reddedildi', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  EXPIRED: { label: 'Süresi Doldu', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  COUNTERED: { label: 'Karşı Teklif', color: 'bg-amber-50 text-amber-700 border-amber-200' }
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
      className={`group relative flex flex-col gap-3.5 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isUnread
          ? 'bg-gradient-to-r from-indigo-50/40 via-white to-white border border-indigo-200/90 shadow-xs hover:shadow-md hover:border-indigo-300'
          : 'bg-white border border-slate-200/80 hover:bg-slate-50/40 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Icon Badge */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 shadow-2xs ${
              config.iconBgClass
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border shadow-2xs ${config.badgeClass}`}
              >
                {config.badge}
              </span>

              {isUnread && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/90 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  Yeni
                </span>
              )}

              {/* Status Transition Badge (if present) */}
              {statusInfo && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              )}
            </div>

            <h3
              className={`text-sm sm:text-[15px] mt-1 truncate tracking-tight ${
                isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'
              }`}
              title={notification.title}
            >
              {notification.title}
            </h3>
          </div>
        </div>

        {/* Right Info & Quick Mark as Read Action */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 tabular-nums whitespace-nowrap">
            {formatRelativeTime(notification.createdAt)}
          </span>

          {isUnread && (
            <button
              type="button"
              onClick={handleQuickMarkRead}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-200"
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
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium pl-0 sm:pl-13.5">
          {notification.message}
        </p>
      )}

      {/* Smart Contextual Badges (Order #, Product, Amount, Carrier) */}
      {(orderNumber || listingTitle || amount != null || trackingNumber || remainingAttributes.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 pl-0 sm:pl-13.5 pt-0.5">
          {/* Clean Order Number Badge */}
          {orderNumber && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-mono font-bold border border-slate-200/80 shadow-2xs">
              <Package className="w-3 h-3 text-slate-400" />
              <span>#{orderNumber}</span>
            </span>
          )}

          {/* Product Pill */}
          {listingTitle && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 text-[11px] font-semibold border border-slate-200/80 shadow-2xs max-w-[260px] truncate"
              title={listingTitle}
            >
              <ShoppingBag className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{listingTitle}</span>
            </span>
          )}

          {/* Offer/Price Amount */}
          {amount != null && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-2xs">
              <Tag className="w-3 h-3 text-emerald-600" />
              <span>₺{Number(amount).toLocaleString('tr-TR')}</span>
            </span>
          )}

          {/* Tracking Number */}
          {trackingNumber && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200 shadow-2xs">
              <Truck className="w-3 h-3 text-blue-500" />
              <span>{carrier ? `${carrier}: ` : ''}{trackingNumber}</span>
            </span>
          )}

          {/* Any other human-friendly custom attributes */}
          {remainingAttributes.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600"
            >
              <span className="text-slate-400 font-semibold">{key}:</span>
              <span className="text-slate-800 font-bold truncate max-w-[180px]">
                {String(value)}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Bottom Action Strip */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-0.5 pl-0 sm:pl-13.5">
        <span className="text-[11px] font-semibold text-slate-400">
          {config.categoryLabel}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-all cursor-pointer"
        >
          <span>{config.actionLabel}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;

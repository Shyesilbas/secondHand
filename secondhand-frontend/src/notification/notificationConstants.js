import {
  Award,
  Bell,
  CheckCircle,
  CreditCard,
  FileText,
  Heart,
  MessageSquare,
  Package,
  RefreshCw,
  ShoppingBag,
  Star,
  Tag,
  TrendingDown,
  XCircle
} from 'lucide-react';
import { ROUTES } from '../common/constants/routes.js';

export const NOTIFICATION_PAGE_SIZE = 20;

export const NOTIFICATION_VIEWS = Object.freeze({
  ALL: 'all',
  UNREAD: 'unread'
});

const ICONS = {
  ORDER_CREATED: ShoppingBag,
  ORDER_RECEIVED: ShoppingBag,
  ORDER_STATUS_CHANGED: Package,
  ORDER_COMPLETED: CheckCircle,
  ORDER_CANCELLED: XCircle,
  ORDER_REFUNDED: RefreshCw,
  LISTING_SOLD: CheckCircle,
  OFFER_RECEIVED: Tag,
  OFFER_COUNTERED: Tag,
  OFFER_ACCEPTED: CheckCircle,
  OFFER_REJECTED: XCircle,
  OFFER_EXPIRED: XCircle,
  LISTING_PRICE_DROPPED: TrendingDown,
  LISTING_NEW_FROM_FOLLOWED: Tag,
  LISTING_FAVORITED: Heart,
  REVIEW_RECEIVED: Star,
  CHAT_MESSAGE_RECEIVED: MessageSquare,
  PAYMENT_SUCCESS: CreditCard,
  PAYMENT_FAILED: CreditCard,
  AGREEMENT_UPDATED: FileText,
  GREAT_SELLER_ACHIEVED: Award
};

export const getNotificationIcon = (type) => ICONS[type] || Bell;

const ORDER_STATUS_LABELS = {
  PENDING: ['order_status_pending', 'Beklemede'],
  CONFIRMED: ['order_status_confirmed', 'Onaylandı'],
  PROCESSING: ['order_status_processing', 'Hazırlanıyor'],
  SHIPPED: ['order_status_shipped', 'Kargoya verildi'],
  DELIVERED: ['order_status_delivered', 'Teslim edildi'],
  COMPLETED: ['order_status_completed', 'Tamamlandı'],
  CANCELLED: ['order_status_cancelled', 'İptal edildi'],
  REFUNDED: ['order_status_refunded', 'İade edildi'],
  MEETUP_PENDING: ['order_status_meetup_pending', 'Buluşma bekleniyor'],
  HANDOVER_CONFIRMED: ['order_status_handover_confirmed', 'Elden teslim onaylandı'],
  VERIFICATION_LOCKED: ['order_status_verification_locked', 'Doğrulama kilitlendi']
};

export const parseNotificationMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata;
  try {
    const parsed = JSON.parse(metadata);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const formatAmount = (raw, currency = 'TRY') => {
  if (raw == null || raw === '') return null;
  const num = typeof raw === 'number' ? raw : Number.parseFloat(String(raw).replace(',', '.'));
  if (Number.isNaN(num)) return null;
  const cur = (currency || 'TRY').toUpperCase();
  try {
    return num.toLocaleString('tr-TR', { style: 'currency', currency: cur === 'TL' ? 'TRY' : cur, maximumFractionDigits: 2 });
  } catch {
    return `${num.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ${cur}`;
  }
};

// Backend fallbacks for chat previews that carry no user content.
const GENERIC_CHAT_MESSAGE = /^(You received a new message\.|New message from .+\.)$/;

const formatListingSubject = (meta, tr) => {
  if (!meta?.listingTitle) return null;
  const base = `“${meta.listingTitle}”`;
  const extraCount = Number(meta.itemCount) - 1;
  if (extraCount > 0) {
    return tr
      ? tr('and_plus_more_items', '{{base}} ve +{{count}} ürün', { base, count: extraCount })
      : `${base} ve +${extraCount} ürün`;
  }
  return base;
};

const formatOrderSubject = (meta, tr) => {
  const listingSubject = formatListingSubject(meta, tr);
  const orderNo = meta?.orderNumber ? `#${meta.orderNumber}` : null;
  if (listingSubject && orderNo) return `${listingSubject} (${orderNo})`;
  if (listingSubject) return listingSubject;
  if (orderNo) return tr ? tr('order_numbered', '{{orderNo}} numaralı', { orderNo }) : `${orderNo} numaralı`;
  return null;
};

const describePaymentSuccess = (notification, meta, listing, tr) => {
  const amount = formatAmount(meta.amountText, meta.currency);
  const txCode = meta.transactionTypeCode || '';
  const txLabel = meta.transactionType || '';

  if (
    txCode === 'MEMBERSHIP_PAYMENT' ||
    txLabel === 'Premium Üyelik' ||
    notification?.actionUrl === '/profile'
  ) {
    return {
      title: tr('notif_payment_membership_title', 'Premium üyeliğin aktif edildi'),
      message: amount
        ? tr('notif_payment_membership_body_amount', '{{amount}} ödemen tamamlandı, Premium ayrıcalıkların hesabına tanımlandı.', { amount })
        : tr('notif_payment_membership_body', 'Premium üyeliğin başarıyla aktif edildi.')
    };
  }

  if (txCode === 'ITEM_PURCHASE' || txLabel === 'Ürün Satın Alma') {
    const parts = [listing, amount].filter(Boolean).join(' · ');
    return {
      title: tr('notif_payment_purchase_title', 'Ürün ödemesi tamamlandı'),
      message: parts
        ? tr('notif_payment_purchase_body', '{{details}} tutar güvenli ödeme havuzunda korunuyor.', { details: parts })
        : tr('notif_payment_purchase_body_generic', 'Sipariş ödemen güvenli ödeme havuzuna alındı.')
    };
  }

  if (
    txCode === 'ITEM_SALE' ||
    txCode === 'EWALLET_PAYMENT_RECEIVED' ||
    txLabel === 'Ürün Satışı' ||
    txLabel === 'Ödeme Alma'
  ) {
    return {
      title: tr('notif_payment_sale_title', 'Satış geliri cüzdanına aktarıldı'),
      message: listing && amount
        ? tr('notif_payment_sale_body', '{{listing}} satışından {{amount}} cüzdan bakiyene eklendi.', { listing, amount })
        : [listing, amount].filter(Boolean).join(' · ')
    };
  }

  if (txCode === 'REFUND' || txLabel === 'İade') {
    return {
      title: tr('notif_payment_refund_title', 'Ödeme iadesi cüzdanına yatırıldı'),
      message: listing && amount
        ? tr('notif_payment_refund_body', '{{listing}} için {{amount}} iade tutarı cüzdanına aktarıldı.', { listing, amount })
        : [listing, amount].filter(Boolean).join(' · ')
    };
  }

  if (txCode === 'EWALLET_DEPOSIT' || txLabel === 'Cüzdana Para Yükleme') {
    return {
      title: tr('notif_payment_deposit_title', 'Cüzdanına para yüklendi'),
      message: amount
        ? tr('notif_payment_deposit_body', 'Cüzdan bakiyene {{amount}} eklendi.', { amount })
        : tr('notif_payment_deposit_body_generic', 'Cüzdanına bakiye yükleme işlemi tamamlandı.')
    };
  }

  if (txCode === 'EWALLET_WITHDRAWAL' || txLabel === 'Cüzdandan Para Çekme') {
    return {
      title: tr('notif_payment_withdrawal_title', 'Cüzdandan para çekildi'),
      message: amount
        ? tr('notif_payment_withdrawal_body', 'Cüzdanından {{amount}} çekim işlemi tamamlandı.', { amount })
        : tr('notif_payment_withdrawal_body_generic', 'Cüzdanından para çekme işlemi tamamlandı.')
    };
  }

  if (txCode === 'LISTING_CREATION' || txLabel === 'İlan Oluşturma') {
    return {
      title: tr('notif_payment_listing_fee_title', 'İlan yayınlama ücreti ödendi'),
      message: [listing, amount].filter(Boolean).join(' · ')
    };
  }

  if (txCode === 'SHOWCASE_PAYMENT' || txLabel === 'İlan Öne Çıkarma') {
    return {
      title: tr('notif_payment_showcase_title', 'Vitrin ödemesi tamamlandı'),
      message: [listing, amount].filter(Boolean).join(' · ')
    };
  }

  return {
    title: tr('notif_payment_success_title', 'Ödemen tamamlandı'),
    message: [listing, amount].filter(Boolean).join(' · ')
  };
};

/**
 * Turkish title and body for a notification, built from its type and metadata so stored English
 * texts never reach the UI. Unknown types fall back to the stored texts.
 */
export const describeNotification = (notification, t) => {
  const meta = parseNotificationMetadata(notification?.metadata);
  const tr = (key, defaultValue, values = {}) => t(key, { defaultValue, ...values });
  const listing = formatListingSubject(meta, tr);
  const orderSubject = formatOrderSubject(meta, tr);
  const orderAmount = formatAmount(meta.totalAmount, meta.currency);
  const fallbackMessage = notification?.message || '';

  switch (notification?.type) {
    case 'ORDER_CREATED': {
      const details = [orderSubject, orderAmount].filter(Boolean).join(' · ');
      return {
        title: tr('notif_order_created_title', 'Siparişin oluşturuldu'),
        message: details
          ? tr('notif_order_created_body_detailed', '{{details}} siparişin alındı. Süreci Aldıklarım sayfasından takip edebilirsin.', { details })
          : tr('notif_order_created_body', 'Siparişini Aldıklarım sayfasından takip edebilirsin.')
      };
    }
    case 'ORDER_RECEIVED': {
      const details = [orderSubject, orderAmount].filter(Boolean).join(' · ');
      return {
        title: tr('notif_order_received_title', 'Yeni sipariş aldın'),
        message: details
          ? tr('notif_order_received_body', '{{listing}} için yeni sipariş geldi. Kargo hazırlığına başlayabilirsin.', { listing: details })
          : tr('notif_order_received_body_generic', 'İlanlarından biri için sipariş geldi.')
      };
    }
    case 'ORDER_CANCELLED': {
      const prefix = orderSubject ? `${orderSubject} ` : '';
      const isSellerSide = meta.recipientRole === 'SELLER' || (!meta.recipientRole && !/refunded/i.test(fallbackMessage));
      const isCounterparty = meta.reason === 'COUNTERPARTY_CANCELLED' || /other party/i.test(fallbackMessage);
      return {
        title: tr('notif_order_cancelled_title', 'Sipariş iptal edildi'),
        message: meta.reason === 'SHIP_DEADLINE_MISSED'
          ? (!isSellerSide
            ? tr('notif_order_ship_deadline_buyer', '{{prefix}}siparişi satıcı 72 saat içinde kargoya vermediği için iptal edildi; ödemen iade edildi.', { prefix })
            : tr('notif_order_ship_deadline_seller', '{{prefix}}siparişi 72 saat içinde kargoya verilmediği için otomatik olarak iptal edildi.', { prefix }))
          : isCounterparty
            ? tr('notif_order_cancelled_by_other', '{{prefix}}siparişi karşı taraf tarafından iptal edildi.', { prefix })
            : tr('notif_order_cancelled_body', '{{prefix}}siparişi iptal edildi.', { prefix })
      };
    }
    case 'ORDER_STATUS_CHANGED': {
      const label = ORDER_STATUS_LABELS[meta.newStatus];
      const prefix = orderSubject ? `${orderSubject} ` : '';
      if (meta.newStatus === 'PROCESSING') {
        return {
          title: tr('notif_order_processing_title', 'Siparişin hazırlanıyor'),
          message: tr('notif_order_processing_body', '{{prefix}}siparişin satıcı tarafından kargoya hazırlanıyor.', { prefix })
        };
      }
      if (meta.newStatus === 'SHIPPED') {
        return {
          title: tr('notif_order_shipped_title', 'Siparişin kargoya verildi'),
          message: tr('notif_order_shipped_body', '{{prefix}}siparişin kargoya teslim edildi. Kargo takibini sipariş detayından görebilirsin.', { prefix })
        };
      }
      if (meta.newStatus === 'DELIVERED') {
        return {
          title: tr('notif_order_delivered_title', 'Siparişin teslim edildi'),
          message: tr('notif_order_delivered_body', '{{prefix}}siparişin teslim edildi. Ürünü kontrol edip siparişi onaylayabilirsin.', { prefix })
        };
      }
      if (meta.newStatus === 'HANDOVER_CONFIRMED') {
        return {
          title: tr('notif_order_handover_title', 'Elden teslim doğrulandı'),
          message: tr('notif_order_handover_body', '{{prefix}}siparişi için teslimat kodu doğrulandı.', { prefix })
        };
      }
      return {
        title: tr('notif_order_status_title', 'Sipariş durumu güncellendi'),
        message: label
          ? tr('notif_order_status_body', '{{prefix}}yeni durum: {{status}}', { prefix, status: t(label[0], label[1]) })
          : orderSubject || ''
      };
    }
    case 'ORDER_COMPLETED': {
      const prefix = orderSubject ? `${orderSubject} ` : '';
      return {
        title: tr('notif_order_completed_title', 'Sipariş tamamlandı'),
        message: orderSubject
          ? tr('notif_order_completed_body_detailed', '{{prefix}}siparişin tamamlandı ve ödeme satıcıya aktarıldı. Alışverişin için teşekkürler.', { prefix })
          : tr('notif_order_completed_body', 'Alışverişin için teşekkürler.')
      };
    }
    case 'ORDER_REFUNDED': {
      const details = [orderSubject, orderAmount].filter(Boolean).join(' · ');
      return {
        title: tr('notif_order_refunded_title', 'Sipariş iade edildi'),
        message: details
          ? tr('notif_order_refunded_body_detailed', '{{details}} siparişinin ödemesi cüzdanına iade edildi.', { details })
          : tr('notif_order_refunded_body', 'Ödemenin iadesi yapıldı.')
      };
    }
    case 'LISTING_SOLD':
      return {
        title: tr('notif_listing_sold_title', 'İlanın satıldı'),
        message: listing ? tr('notif_listing_sold_body', '{{listing}} satıldı.', { listing }) : ''
      };
    case 'OFFER_RECEIVED': {
      const offerAmount = formatAmount(meta.offerAmount, meta.currency);
      const subject = [listing, offerAmount].filter(Boolean).join(' · ');
      return {
        title: tr('notif_offer_received_title', 'Yeni teklif aldın'),
        message: subject
          ? tr('notif_offer_received_body', '{{listing}} için yeni teklif geldi.', { listing: subject })
          : ''
      };
    }
    case 'OFFER_COUNTERED': {
      const offerAmount = formatAmount(meta.offerAmount, meta.currency);
      const subject = [listing, offerAmount].filter(Boolean).join(' · ');
      return {
        title: tr('notif_offer_countered_title', 'Karşı teklif geldi'),
        message: subject
          ? tr('notif_offer_countered_body', '{{listing}} için karşı teklif geldi.', { listing: subject })
          : ''
      };
    }
    case 'OFFER_ACCEPTED': {
      const offerAmount = formatAmount(meta.offerAmount, meta.currency);
      const subject = [listing, offerAmount].filter(Boolean).join(' · ');
      return {
        title: tr('notif_offer_accepted_title', 'Teklifin kabul edildi'),
        message: subject
          ? tr('notif_offer_accepted_body', '{{listing}} için teklifin kabul edildi. Ödemeyi tamamlayarak satın alabilirsin.', { listing: subject })
          : ''
      };
    }
    case 'OFFER_REJECTED': {
      const offerAmount = formatAmount(meta.offerAmount, meta.currency);
      const subject = [listing, offerAmount].filter(Boolean).join(' · ');
      return {
        title: tr('notif_offer_rejected_title', 'Teklifin reddedildi'),
        message: subject
          ? tr('notif_offer_rejected_body', '{{listing}} için verdiğin teklif reddedildi.', { listing: subject })
          : ''
      };
    }
    case 'OFFER_EXPIRED': {
      const offerAmount = formatAmount(meta.offerAmount, meta.currency);
      const subject = [listing, offerAmount].filter(Boolean).join(' · ');
      return {
        title: tr('notif_offer_expired_title', 'Teklifin süresi doldu'),
        message: subject
          ? tr('notif_offer_expired_body', '{{listing}} için verilen teklifin süresi doldu.', { listing: subject })
          : ''
      };
    }
    case 'LISTING_PRICE_DROPPED': {
      const oldPrice = formatAmount(meta.oldPrice);
      const newPrice = formatAmount(meta.newPrice);
      const prices = oldPrice && newPrice ? `${oldPrice} → ${newPrice}` : newPrice;
      return {
        title: tr('notif_price_dropped_title', 'Favori ilanında fiyat düştü'),
        message: [listing, prices].filter(Boolean).join(' · ')
      };
    }
    case 'LISTING_NEW_FROM_FOLLOWED': {
      const price = formatAmount(meta.amountText, meta.currency);
      const seller = meta.sellerName || null;
      const detailedParts = [seller, listing, price].filter(Boolean);
      return {
        title: tr('notif_followed_listing_title', 'Takip ettiğin satıcıdan yeni ilan'),
        message: detailedParts.length > 1
          ? detailedParts.join(' · ')
          : listing
            ? tr('notif_followed_listing_body', '{{listing}} ilanı yayına alındı.', { listing })
            : ''
      };
    }
    case 'LISTING_FAVORITED': {
      const actor = meta.actorName || null;
      return {
        title: tr('notif_listing_favorited_title', 'İlanın favorilere eklendi'),
        message: actor && listing
          ? tr('notif_listing_favorited_by_actor', '{{actor}}, {{listing}} ilanını favorilerine ekledi.', { actor, listing })
          : listing
            ? tr('notif_listing_favorited_body', '{{listing}} bir kullanıcının favorilerinde.', { listing })
            : ''
      };
    }
    case 'REVIEW_RECEIVED': {
      const rating = Number(meta.rating);
      const ratingText = rating > 0 ? tr('notif_review_rating', '{{rating}}/5 puan', { rating }) : null;
      return {
        title: tr('notif_review_received_title', 'Yeni değerlendirme aldın'),
        message: [listing, ratingText].filter(Boolean).join(' · ')
      };
    }
    case 'CHAT_MESSAGE_RECEIVED':
      return {
        title: tr('notif_chat_title', 'Yeni mesaj'),
        message: GENERIC_CHAT_MESSAGE.test(fallbackMessage) ? '' : fallbackMessage
      };
    case 'PAYMENT_SUCCESS':
      return describePaymentSuccess(notification, meta, listing, tr);
    case 'PAYMENT_FAILED':
      return {
        title: tr('notif_payment_failed_title', 'Ödemen tamamlanamadı'),
        message: listing
          ? tr('notif_payment_failed_body_listing', '{{listing}} için ödeme alınamadı. Ödeme yöntemini kontrol edip tekrar deneyebilirsin.', { listing })
          : tr('notif_payment_failed_body', 'Ödeme yöntemini kontrol edip tekrar deneyebilirsin.')
      };
    case 'AGREEMENT_UPDATED': {
      const version = meta.version ? `v${meta.version}` : null;
      return {
        title: tr('notif_agreement_title', 'Sözleşme güncellendi'),
        message: version
          ? tr('notif_agreement_body_version', 'Yeni sözleşme sürümünü ({{version}}) inceleyip onaylaman gerekiyor.', { version })
          : tr('notif_agreement_body', 'Yeni sürümü inceleyip onaylaman gerekiyor.')
      };
    }
    case 'GREAT_SELLER_ACHIEVED':
      return {
        title: tr('notif_great_seller_title', 'Harika satıcı rozetini kazandın'),
        message: tr('notif_great_seller_body', 'Rozetin artık profilinde görünüyor.')
      };
    default:
      return { title: notification?.title || tr('notification', 'Bildirim'), message: fallbackMessage };
  }
};

// Links stored by older backend versions that no longer exist in the app.
const LEGACY_ACTION_URLS = {
  '/profile/wallet': ROUTES.EWALLET
};

const withOrderId = (base, orderId) => (orderId ? `${base}?orderId=${encodeURIComponent(orderId)}` : base);

export const getNotificationTargetRoute = (notification) => {
  if (!notification) return ROUTES.HOME;
  const meta = parseNotificationMetadata(notification.metadata);

  switch (notification.type) {
    // Buyer-side order updates: open the purchases list with the order highlighted.
    case 'ORDER_CREATED':
    case 'ORDER_STATUS_CHANGED':
    case 'ORDER_COMPLETED':
    case 'ORDER_REFUNDED':
      return withOrderId(ROUTES.MY_ORDERS, meta.orderId);
    case 'ORDER_RECEIVED':
    case 'LISTING_SOLD':
      return ROUTES.I_SOLD;
    case 'PAYMENT_SUCCESS': {
      const txCode = meta.transactionTypeCode || '';
      const txLabel = meta.transactionType || '';
      if (txCode === 'MEMBERSHIP_PAYMENT' || txLabel === 'Premium Üyelik' || notification.actionUrl === '/profile') {
        return ROUTES.PROFILE;
      }
      if ((txCode === 'LISTING_CREATION' || txCode === 'SHOWCASE_PAYMENT') && meta.listingId) {
        return ROUTES.LISTING_DETAIL(meta.listingId);
      }
      return ROUTES.EWALLET;
    }
    case 'PAYMENT_FAILED':
      return ROUTES.EWALLET;
    default:
      break;
  }

  if (notification.actionUrl) {
    return LEGACY_ACTION_URLS[notification.actionUrl] || notification.actionUrl;
  }
  if (notification.type === 'AGREEMENT_UPDATED') return ROUTES.AGREEMENTS;
  if (meta.listingId) return ROUTES.LISTING_DETAIL(meta.listingId);
  return null;
};

export const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dk`;
  if (diffHours < 24) return `${diffHours} sa`;
  if (diffDays < 7) return `${diffDays} g`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const DAY_MS = 86400000;

export const groupNotificationsByTimeline = (notifications = []) => {
  const groups = { today: [], yesterday: [], thisWeek: [], earlier: [] };
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  notifications.forEach((item) => {
    const time = item?.createdAt ? new Date(item.createdAt).getTime() : Number.NaN;
    if (Number.isNaN(time)) groups.earlier.push(item);
    else if (time >= todayStart) groups.today.push(item);
    else if (time >= todayStart - DAY_MS) groups.yesterday.push(item);
    else if (time >= todayStart - DAY_MS * 7) groups.thisWeek.push(item);
    else groups.earlier.push(item);
  });

  return [
    { key: 'today', labelKey: 'today', defaultLabel: 'Bugün', items: groups.today },
    { key: 'yesterday', labelKey: 'yesterday', defaultLabel: 'Dün', items: groups.yesterday },
    { key: 'thisWeek', labelKey: 'this_week', defaultLabel: 'Bu hafta', items: groups.thisWeek },
    { key: 'earlier', labelKey: 'earlier', defaultLabel: 'Daha önce', items: groups.earlier }
  ].filter((g) => g.items.length > 0);
};

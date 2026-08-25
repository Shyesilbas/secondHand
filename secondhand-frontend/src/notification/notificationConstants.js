import {
  Inbox,
  ShoppingBag,
  Tag,
  MessageSquare,
  Star,
  CreditCard,
  Award,
  Bell,
  CheckCircle,
  XCircle,
  Package,
  DollarSign,
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { ROUTES } from '../common/constants/routes.js';

export const NOTIFICATION_FILTERS = Object.freeze({
  ALL: 'ALL',
  ORDERS: 'ORDERS',
  OFFERS: 'OFFERS',
  CHAT: 'CHAT',
  LISTINGS: 'LISTINGS',
  PAYMENTS: 'PAYMENTS',
  SYSTEM: 'SYSTEM'
});

export const NOTIFICATION_CATEGORIES = [
  { id: NOTIFICATION_FILTERS.ALL, label: 'Tümü', icon: Bell },
  { id: NOTIFICATION_FILTERS.OFFERS, label: 'Teklifler', icon: Tag },
  { id: NOTIFICATION_FILTERS.ORDERS, label: 'Siparişler', icon: ShoppingBag },
  { id: NOTIFICATION_FILTERS.CHAT, label: 'Mesajlar', icon: MessageSquare },
  { id: NOTIFICATION_FILTERS.LISTINGS, label: 'İlan & Favori', icon: Star },
  { id: NOTIFICATION_FILTERS.PAYMENTS, label: 'Ödemeler', icon: CreditCard },
  { id: NOTIFICATION_FILTERS.SYSTEM, label: 'Sistem', icon: Award }
];

export const NOTIFICATION_CATEGORY_MAP = {
  // Orders
  ORDER_CREATED: NOTIFICATION_FILTERS.ORDERS,
  ORDER_STATUS_CHANGED: NOTIFICATION_FILTERS.ORDERS,
  ORDER_CANCELLED: NOTIFICATION_FILTERS.ORDERS,
  ORDER_RECEIVED: NOTIFICATION_FILTERS.ORDERS,
  ORDER_COMPLETED: NOTIFICATION_FILTERS.ORDERS,
  ORDER_REFUNDED: NOTIFICATION_FILTERS.ORDERS,

  // Offers
  OFFER_RECEIVED: NOTIFICATION_FILTERS.OFFERS,
  OFFER_ACCEPTED: NOTIFICATION_FILTERS.OFFERS,
  OFFER_REJECTED: NOTIFICATION_FILTERS.OFFERS,
  OFFER_COUNTERED: NOTIFICATION_FILTERS.OFFERS,
  OFFER_EXPIRED: NOTIFICATION_FILTERS.OFFERS,

  // Chat
  CHAT_MESSAGE_RECEIVED: NOTIFICATION_FILTERS.CHAT,

  // Listings
  LISTING_PRICE_DROPPED: NOTIFICATION_FILTERS.LISTINGS,
  LISTING_NEW_FROM_FOLLOWED: NOTIFICATION_FILTERS.LISTINGS,
  LISTING_SOLD: NOTIFICATION_FILTERS.LISTINGS,
  LISTING_FAVORITED: NOTIFICATION_FILTERS.LISTINGS,

  // Payments
  PAYMENT_SUCCESS: NOTIFICATION_FILTERS.PAYMENTS,
  PAYMENT_FAILED: NOTIFICATION_FILTERS.PAYMENTS,

  // System & Achievements
  REVIEW_RECEIVED: NOTIFICATION_FILTERS.SYSTEM,
  GREAT_SELLER_ACHIEVED: NOTIFICATION_FILTERS.SYSTEM,
  AGREEMENT_UPDATED: NOTIFICATION_FILTERS.SYSTEM
};

export const getNotificationCategory = (type) => {
  return NOTIFICATION_CATEGORY_MAP[type] || NOTIFICATION_FILTERS.SYSTEM;
};

export const getNotificationConfig = (type) => {
  switch (type) {
    case 'OFFER_RECEIVED':
    case 'OFFER_COUNTERED':
      return {
        icon: Tag,
        badge: 'Yeni Teklif',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        iconBgClass: 'bg-amber-500/10 text-amber-600 border-amber-200/60',
        actionLabel: 'Teklifi İncele',
        categoryLabel: 'Pazarlık & Teklif'
      };
    case 'OFFER_ACCEPTED':
      return {
        icon: CheckCircle,
        badge: 'Teklif Kabul Edildi',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconBgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
        actionLabel: 'Siparişe Git',
        categoryLabel: 'Pazarlık & Teklif'
      };
    case 'OFFER_REJECTED':
    case 'OFFER_EXPIRED':
      return {
        icon: XCircle,
        badge: type === 'OFFER_EXPIRED' ? 'Süresi Doldu' : 'Teklif Reddedildi',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        iconBgClass: 'bg-slate-500/10 text-slate-600 border-slate-200/60',
        actionLabel: 'Teklifleri Gör',
        categoryLabel: 'Pazarlık & Teklif'
      };
    case 'ORDER_CREATED':
    case 'ORDER_RECEIVED':
      return {
        icon: ShoppingBag,
        badge: 'Yeni Sipariş',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        iconBgClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/60',
        actionLabel: 'Siparişi Görüntüle',
        categoryLabel: 'Sipariş'
      };
    case 'ORDER_STATUS_CHANGED':
      return {
        icon: Package,
        badge: 'Kargo Güncellemesi',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        iconBgClass: 'bg-blue-500/10 text-blue-600 border-blue-200/60',
        actionLabel: 'Kargo Takibi',
        categoryLabel: 'Sipariş'
      };
    case 'ORDER_COMPLETED':
      return {
        icon: CheckCircle,
        badge: 'Sipariş Tamamlandı',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconBgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
        actionLabel: 'Sipariş Detayı',
        categoryLabel: 'Sipariş'
      };
    case 'ORDER_CANCELLED':
      return {
        icon: XCircle,
        badge: 'Sipariş İptal Edildi',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        iconBgClass: 'bg-rose-500/10 text-rose-600 border-rose-200/60',
        actionLabel: 'Detayları İncele',
        categoryLabel: 'Sipariş'
      };
    case 'ORDER_REFUNDED':
      return {
        icon: RefreshCw,
        badge: 'İade Yapıldı',
        badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
        iconBgClass: 'bg-teal-500/10 text-teal-600 border-teal-200/60',
        actionLabel: 'İadeyi İncele',
        categoryLabel: 'Sipariş'
      };
    case 'CHAT_MESSAGE_RECEIVED':
      return {
        icon: MessageSquare,
        badge: 'Yeni Mesaj',
        badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
        iconBgClass: 'bg-violet-500/10 text-violet-600 border-violet-200/60',
        actionLabel: 'Sohbete Git',
        categoryLabel: 'Mesajlaşma'
      };
    case 'LISTING_PRICE_DROPPED':
      return {
        icon: DollarSign,
        badge: 'Fiyat Düştü',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconBgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
        actionLabel: 'İlanı İncele',
        categoryLabel: 'İlan & Favori'
      };
    case 'LISTING_NEW_FROM_FOLLOWED':
      return {
        icon: Star,
        badge: 'Yeni İlan',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        iconBgClass: 'bg-purple-500/10 text-purple-600 border-purple-200/60',
        actionLabel: 'İlana Git',
        categoryLabel: 'Takip Ettiklerin'
      };
    case 'LISTING_SOLD':
      return {
        icon: Package,
        badge: 'İlan Satıldı',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconBgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
        actionLabel: 'Satış Detayı',
        categoryLabel: 'İlan'
      };
    case 'LISTING_FAVORITED':
      return {
        icon: Star,
        badge: 'Favoriye Eklendi',
        badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
        iconBgClass: 'bg-pink-500/10 text-pink-600 border-pink-200/60',
        actionLabel: 'İlanı Gör',
        categoryLabel: 'İlan & Favori'
      };
    case 'REVIEW_RECEIVED':
      return {
        icon: Star,
        badge: 'Yeni Değerlendirme',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        iconBgClass: 'bg-amber-500/10 text-amber-600 border-amber-200/60',
        actionLabel: 'Değerlendirmeleri Gör',
        categoryLabel: 'Değerlendirme'
      };
    case 'PAYMENT_SUCCESS':
      return {
        icon: CheckCircle,
        badge: 'Ödeme Başarılı',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconBgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
        actionLabel: 'Cüzdanımı Gör',
        categoryLabel: 'Ödeme'
      };
    case 'PAYMENT_FAILED':
      return {
        icon: XCircle,
        badge: 'Ödeme Başarısız',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        iconBgClass: 'bg-rose-500/10 text-rose-600 border-rose-200/60',
        actionLabel: 'Ödemeyi Tekrar Dene',
        categoryLabel: 'Ödeme'
      };
    case 'AGREEMENT_UPDATED':
      return {
        icon: ShieldCheck,
        badge: 'Sözleşme Güncellemesi',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        iconBgClass: 'bg-slate-500/10 text-slate-600 border-slate-200/60',
        actionLabel: 'Sözleşmeyi İncele',
        categoryLabel: 'Sözleşmeler'
      };
    case 'GREAT_SELLER_ACHIEVED':
      return {
        icon: Award,
        badge: 'Başarılı Satıcı Rozeti',
        badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-300',
        iconBgClass: 'bg-yellow-500/15 text-yellow-600 border-yellow-200',
        actionLabel: 'Profili Görüntüle',
        categoryLabel: 'Başarılar'
      };
    default:
      return {
        icon: Bell,
        badge: 'Bildirim',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        iconBgClass: 'bg-slate-500/10 text-slate-600 border-slate-200/60',
        actionLabel: 'Detayı Gör',
        categoryLabel: 'Genel'
      };
  }
};

export const getNotificationTargetRoute = (notification) => {
  if (!notification) return ROUTES.HOME;
  if (notification.actionUrl) {
    return notification.actionUrl;
  }

  const { type, relatedEntityId, metadata } = notification;
  let meta = metadata;
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta);
    } catch {
      meta = {};
    }
  }

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
      const cid = meta?.conversationId;
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
    case 'GREAT_SELLER_ACHIEVED':
      return ROUTES.PROFILE;
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
      return ROUTES.EWALLET;
    case 'AGREEMENT_UPDATED':
      return ROUTES.AGREEMENTS;
    default:
      return ROUTES.HOME;
  }
};

export const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 45) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} sa önce`;
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short'
  });
};

export const groupNotificationsByTimeline = (notifications = []) => {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: []
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const oneWeekAgo = todayStart - 86400000 * 7;

  notifications.forEach((item) => {
    if (!item.createdAt) {
      groups.earlier.push(item);
      return;
    }
    const itemTime = new Date(item.createdAt).getTime();
    if (itemTime >= todayStart) {
      groups.today.push(item);
    } else if (itemTime >= yesterdayStart) {
      groups.yesterday.push(item);
    } else if (itemTime >= oneWeekAgo) {
      groups.thisWeek.push(item);
    } else {
      groups.earlier.push(item);
    }
  });

  return [
    { key: 'today', title: 'Bugün', items: groups.today },
    { key: 'yesterday', title: 'Dün', items: groups.yesterday },
    { key: 'thisWeek', title: 'Bu Hafta', items: groups.thisWeek },
    { key: 'earlier', title: 'Daha Önce', items: groups.earlier }
  ].filter((g) => g.items.length > 0);
};

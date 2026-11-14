import { ROUTES } from './routes.js';

/**
 * Pages that users reach only through nested menus. The header search bar matches these by label and
 * keywords, so a page is findable even when the account hub sidebar is not. Labels reuse the locale keys
 * the account hub already uses.
 */
export const APP_PAGES = Object.freeze([
  { key: 'campaigns', labelKey: 'campaigns', to: ROUTES.SELLER_CAMPAIGNS, keywords: ['kampanya', 'indirim', 'campaign', 'discount'] },
  { key: 'coupons', labelKey: 'platform_coupons', to: ROUTES.PLATFORM_COUPONS, keywords: ['kupon', 'coupon', 'promosyon', 'indirim kodu'] },
  { key: 'complaints', labelKey: 'complaints', to: ROUTES.COMPLAINTS, keywords: ['şikayet', 'complaint', 'bildirim', 'destek', 'support', 'report'] },
  { key: 'account_hub', labelKey: 'account_hub', to: ROUTES.DASHBOARD, keywords: ['hesap', 'panel', 'dashboard', 'hub', 'yönetim'] },
  { key: 'orders', labelKey: 'my_orders', to: ROUTES.MY_ORDERS, keywords: ['sipariş', 'order', 'kargo', 'teslimat'] },
  { key: 'sold', labelKey: 'i_sold', to: ROUTES.I_SOLD, keywords: ['satış', 'sold', 'sattıklarım'] },
  { key: 'listings', labelKey: 'my_listings', to: ROUTES.MY_LISTINGS, keywords: ['ilan', 'listing'] },
  { key: 'showcases', labelKey: 'showcases', to: ROUTES.MY_SHOWCASES, keywords: ['vitrin', 'showcase'] },
  { key: 'pay_listing_fee', labelKey: 'pay_listing_fee', to: ROUTES.PAY_LISTING_FEE, keywords: ['ilan ücreti', 'listing fee', 'ücret'] },
  { key: 'offers', labelKey: 'offers', to: ROUTES.OFFERS, keywords: ['teklif', 'offer', 'pazarlık'] },
  { key: 'cart', labelKey: 'shopping_cart', to: ROUTES.SHOPPING_CART, keywords: ['sepet', 'cart'] },
  { key: 'favorites', labelKey: 'favorites', to: ROUTES.FAVORITES, keywords: ['favori', 'beğeni'] },
  { key: 'lists', labelKey: 'my_lists', to: ROUTES.MY_LISTS, keywords: ['liste', 'list'] },
  { key: 'payments', labelKey: 'payment_history', to: ROUTES.PAYMENTS, keywords: ['ödeme', 'payment', 'fatura'] },
  { key: 'payment_methods', labelKey: 'payment_methods', to: ROUTES.PAYMENT_METHODS, keywords: ['kart', 'card'] },
  { key: 'ewallet', labelKey: 'ewallet', to: ROUTES.EWALLET, keywords: ['cüzdan', 'wallet', 'bakiye'] },
  { key: 'profile', labelKey: 'profile_page', to: ROUTES.PROFILE, keywords: ['profil', 'profile', 'adres', 'address', 'kişisel', 'telefon'] },
  { key: 'security', labelKey: 'security_activity', to: ROUTES.SECURITY, keywords: ['güvenlik', 'security', 'giriş', 'oturum'] },
  { key: 'password', labelKey: 'change_password', to: ROUTES.CHANGE_PASSWORD, keywords: ['şifre', 'password'] },
  { key: 'verify', labelKey: 'verify_account', to: ROUTES.VERIFY_ACCOUNT, keywords: ['doğrula', 'verify', 'e-posta', 'email'] },
  { key: 'agreements', labelKey: 'agreements', to: ROUTES.AGREEMENTS, keywords: ['sözleşme', 'agreement', 'koşul', 'kvkk'] },
  { key: 'inbox', labelKey: 'inbox', to: ROUTES.INBOX, keywords: ['mesaj', 'message', 'sohbet', 'chat'] },
  { key: 'aura', labelKey: 'aura_assistant', to: ROUTES.AURA_CHAT, keywords: ['aura', 'asistan', 'assistant', 'yardım'] },
]);

/** Client-side match on label and keywords, case- and Turkish-aware. Returns at most {@code limit} pages. */
export const matchAppPages = (query, limit = 5) => {
  const needle = (query || '').trim().toLocaleLowerCase('tr');
  if (needle.length < 2) return [];
  // Either side may contain the other, so "kampanyalar" finds the "kampanya" keyword.
  const matches = (keyword) => {
    const normalized = keyword.toLocaleLowerCase('tr');
    return normalized.includes(needle) || needle.includes(normalized);
  };
  return APP_PAGES
    .filter((page) => page.keywords.some(matches))
    .slice(0, limit);
};

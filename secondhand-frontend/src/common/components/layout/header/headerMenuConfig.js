import { CreditCard, LayoutDashboard, LifeBuoy, Megaphone, Package, Receipt, Sparkles, Ticket, TrendingUp } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';

export const getPaymentsMenuItems = () => [
  { to: ROUTES.PAYMENTS, icon: Receipt, labelKey: 'payment_history' },
  { to: ROUTES.PAYMENT_METHODS, icon: CreditCard, labelKey: 'payment_methods' },
];

export const getListingsMenuItems = () => [
  { to: ROUTES.MY_ORDERS, icon: Receipt, labelKey: 'my_orders', key: 'orders' },
  { to: ROUTES.I_SOLD, icon: TrendingUp, labelKey: 'i_sold', key: 'sold' },
  { to: ROUTES.MY_LISTINGS, icon: Package, labelKey: 'my_listings', key: 'listings' },
];

/** Profile dropdown: the pages that were only reachable through the account hub sidebar. */
export const getProfileMenuItems = () => [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, labelKey: 'account_hub', key: 'accountHub' },
  { to: ROUTES.MY_LISTINGS, icon: Package, labelKey: 'my_listings', key: 'myListings' },
  { to: ROUTES.SELLER_CAMPAIGNS, icon: Megaphone, labelKey: 'campaigns', key: 'campaigns' },
  { to: ROUTES.PLATFORM_COUPONS, icon: Ticket, labelKey: 'platform_coupons', key: 'coupons' },
  { to: ROUTES.COMPLAINTS, icon: LifeBuoy, labelKey: 'complaints', key: 'complaints' },
  { to: ROUTES.AURA_CHAT, icon: Sparkles, labelKey: 'aura_assistant', key: 'aura' },
];

import { CreditCard, Package, Receipt, Sparkles, TrendingUp } from 'lucide-react';
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

export const getProfileMenuItems = () => [
  { to: ROUTES.AURA_CHAT, icon: Sparkles, labelKey: 'aura_assistant', key: 'aura' },
  { to: ROUTES.MY_LISTINGS, icon: Package, labelKey: 'my_listings', key: 'myListings' },
];

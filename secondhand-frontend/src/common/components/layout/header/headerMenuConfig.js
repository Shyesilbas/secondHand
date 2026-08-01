import { CreditCard, Package, Receipt, Settings, Sparkles, TrendingUp, User } from 'lucide-react';
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

export const getProfileMenuItems = (userId) => [
    { to: ROUTES.DASHBOARD, icon: Settings, labelKey: 'account_hub', key: 'dashboard' },
    { to: ROUTES.AURA_CHAT, icon: Sparkles, labelKey: 'aura_assistant', key: 'aura' },
    { to: ROUTES.MY_LISTINGS, icon: Package, labelKey: 'my_listings', key: 'myListings' },
    { to: userId ? ROUTES.USER_PROFILE(userId) : ROUTES.DASHBOARD, icon: User, labelKey: 'profile_page', key: 'profile' },
];

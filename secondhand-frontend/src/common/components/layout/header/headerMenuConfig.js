import { CreditCard, Package, Receipt, Settings, Sparkles, TrendingUp, User } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';

export const getPaymentsMenuItems = () => [
    { to: ROUTES.PAYMENTS, icon: Receipt, label: 'Payments' },
    { to: ROUTES.PAYMENT_METHODS, icon: CreditCard, label: 'Payment Methods' },
];

export const getListingsMenuItems = () => [
    { to: ROUTES.MY_ORDERS, icon: Receipt, label: 'My Orders', key: 'orders' },
    { to: ROUTES.I_SOLD, icon: TrendingUp, label: 'I Sold', key: 'sold' },
    { to: ROUTES.MY_LISTINGS, icon: Package, label: 'My Listings', key: 'listings' },
];

export const getProfileMenuItems = (userId) => [
    { to: ROUTES.DASHBOARD, icon: Settings, label: 'Account Hub', key: 'dashboard' },
    { to: ROUTES.AURA_CHAT, icon: Sparkles, label: 'Aura Assistant', key: 'aura' },
    { to: ROUTES.MY_LISTINGS, icon: Package, label: 'My Listings', key: 'myListings' },
    { to: userId ? ROUTES.USER_PROFILE(userId) : ROUTES.DASHBOARD, icon: User, label: 'Profile Page', key: 'profile' },
];

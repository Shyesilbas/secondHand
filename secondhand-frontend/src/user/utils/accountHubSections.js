import {
 AlertTriangle,
 BarChart3,
 CreditCard,
 FileText,
 HandCoins,
 Heart,
 LayoutDashboard,
 Package,
 LineChart,
 List,
 Mail,
 Banknote,
 Megaphone,
 Receipt,
 Settings,
 Shield,
 ShoppingBag,
 ShoppingCart,
 Sparkles,
 Star,
 Tag,
 Ticket,
 TrendingUp,
 User,
 Wallet,
} from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';

/** Sidebar groups — condensed; selling uses Campaigns, buying uses Coupons. */
export const getAccountHubNavGroups = (userId, { isAdmin = false } = {}) => {
 const buyingItems = [
 { name: 'Orders', nameKey: 'my_orders', route: ROUTES.MY_ORDERS, icon: ShoppingBag },
 { name: 'Cart', nameKey: 'shopping_cart', route: ROUTES.SHOPPING_CART, icon: ShoppingCart },
 { name: 'Coupons', nameKey: 'platform_coupons', route: ROUTES.PLATFORM_COUPONS, icon: Ticket },
 { name: 'Offers', nameKey: 'offers', route: ROUTES.OFFERS, icon: HandCoins },
 { name: 'Favorites', nameKey: 'favorites', route: ROUTES.FAVORITES, icon: Heart },
 { name: 'Lists', nameKey: 'my_lists', route: ROUTES.MY_LISTS, icon: List },
 { name: 'Buyer analytics', nameKey: 'buyer_analytics', route: ROUTES.BUYER_DASHBOARD, icon: LineChart },
 ];

 if (userId) {
 buyingItems.push(
 { name: 'Reviews received', nameKey: 'reviews_received', route: ROUTES.REVIEWS_RECEIVED(userId), icon: Star },
 { name: 'Reviews given', nameKey: 'reviews_given', route: ROUTES.REVIEWS_GIVEN(userId), icon: Star },
 );
 }

 const groups = [
 {
 id: 'overview',
 label: 'Overview',
 labelKey: 'nav_overview',
 icon: LayoutDashboard,
 items: [{ name: 'Dashboard', nameKey: 'account_hub', route: ROUTES.DASHBOARD, icon: LayoutDashboard }],
 },
 {
 id: 'account',
 label: 'Account',
 labelKey: 'nav_account',
 icon: User,
 items: [
 { name: 'Profile', nameKey: 'profile_page', route: ROUTES.PROFILE, icon: User },
 { name: 'Verify', nameKey: 'verify_account', route: ROUTES.VERIFY_ACCOUNT, icon: Shield },
 ],
 },
 {
 id: 'selling',
 label: 'Selling',
 labelKey: 'nav_selling',
 icon: Megaphone,
 items: [
 { name: 'Listings', nameKey: 'my_listings', route: ROUTES.MY_LISTINGS, icon: Package },
 { name: 'New listing', nameKey: 'new_listing', route: ROUTES.CREATE_LISTING, icon: TrendingUp },
 { name: 'Sold', nameKey: 'i_sold', route: ROUTES.I_SOLD, icon: Package },
 { name: 'Showcases', nameKey: 'showcases', route: ROUTES.MY_SHOWCASES, icon: Star },
 { name: 'Campaigns', nameKey: 'campaigns', route: ROUTES.SELLER_CAMPAIGNS, icon: Megaphone },
 { name: 'Seller analytics', nameKey: 'seller_analytics', route: ROUTES.SELLER_DASHBOARD, icon: BarChart3 },
 ],
 },
 {
 id: 'buying',
 label: 'Buying',
 labelKey: 'nav_buying',
 icon: ShoppingBag,
 items: buyingItems,
 },
 {
 id: 'payments',
 label: 'Payments',
 labelKey: 'nav_payments',
 icon: CreditCard,
 items: [
 { name: 'History', nameKey: 'payment_history', route: ROUTES.PAYMENTS, icon: Receipt },
 { name: 'Methods', nameKey: 'payment_methods', route: ROUTES.PAYMENT_METHODS, icon: CreditCard },
 { name: 'E-wallet', nameKey: 'ewallet', route: ROUTES.EWALLET, icon: Wallet },
 { name: 'Listing fee', nameKey: 'pay_listing_fee', route: ROUTES.PAY_LISTING_FEE, icon: Banknote },
 ],
 },
 {
 id: 'inbox',
 label: 'Inbox & help',
 labelKey: 'nav_inbox',
 icon: Mail,
 items: [
 { name: 'Inbox', nameKey: 'inbox', route: ROUTES.INBOX, icon: Mail },
 { name: 'Aura', nameKey: 'aura_assistant', route: ROUTES.AURA_CHAT, icon: Sparkles },
 { name: 'Complaints', nameKey: 'complaints', route: ROUTES.COMPLAINTS, icon: AlertTriangle },
 { name: 'Agreements', nameKey: 'agreements', route: ROUTES.AGREEMENTS, icon: FileText },
 ],
 },
 {
 id: 'security',
 label: 'Security',
 labelKey: 'nav_security',
 icon: Shield,
 items: [
 { name: 'Activity', nameKey: 'security_activity', route: ROUTES.SECURITY, icon: Shield },
 { name: 'Password', nameKey: 'change_password', route: ROUTES.CHANGE_PASSWORD, icon: Settings },
 ],
 },
 ];

 if (isAdmin) {
 groups.push({
 id: 'admin',
 label: 'Admin',
 labelKey: 'nav_admin',
 icon: Shield,
 items: [{ name: 'Coupons (admin)', nameKey: 'coupons_admin', route: ROUTES.ADMIN_COUPONS, icon: Tag }],
 });
 }

 return groups;
};

/** Legacy flat sections */
export const getAccountHubSections = ({ userId }) => [
 {
 title: 'Profile',
 items: [{ title: 'Profile', route: ROUTES.PROFILE, icon: User }],
 },
 {
 title: 'Sales',
 items: [
 { title: 'Listings', route: ROUTES.MY_LISTINGS, icon: ShoppingBag },
 { title: 'Create', route: ROUTES.CREATE_LISTING, icon: TrendingUp },
 { title: 'Campaigns', route: ROUTES.SELLER_CAMPAIGNS, icon: Megaphone },
 ],
 },
 {
 title: 'Purchases',
 items: [
 { title: 'Orders', route: ROUTES.MY_ORDERS, icon: ShoppingBag },
 { title: 'Coupons', route: ROUTES.PLATFORM_COUPONS, icon: Ticket },
 { title: 'Offers', route: ROUTES.OFFERS, icon: HandCoins },
 { title: 'Favorites', route: ROUTES.FAVORITES, icon: Heart },
 ],
 },
 {
 title: 'Finance',
 items: [
 { title: 'Payments', route: ROUTES.PAYMENTS, icon: Receipt },
 { title: 'Methods', route: ROUTES.PAYMENT_METHODS, icon: CreditCard },
 { title: 'Listing fee', route: ROUTES.PAY_LISTING_FEE, icon: CreditCard },
 ],
 },
 {
 title: 'Performance',
 items: [
 { title: 'Seller analytics', route: ROUTES.SELLER_DASHBOARD, icon: BarChart3 },
 { title: 'Buyer analytics', route: ROUTES.BUYER_DASHBOARD, icon: LineChart },
 { title: 'Reviews in', route: ROUTES.REVIEWS_RECEIVED(userId), icon: Star },
 { title: 'Complaints', route: ROUTES.COMPLAINTS, icon: AlertTriangle },
 ],
 },
 {
 title: 'Security',
 items: [
 { title: 'Audit', route: ROUTES.SECURITY, icon: Shield },
 { title: 'Password', route: ROUTES.CHANGE_PASSWORD, icon: Settings },
 ],
 },
];

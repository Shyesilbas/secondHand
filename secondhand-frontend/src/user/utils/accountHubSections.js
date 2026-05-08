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
    { name: 'Orders', route: ROUTES.MY_ORDERS, icon: ShoppingBag },
    { name: 'Cart', route: ROUTES.SHOPPING_CART, icon: ShoppingCart },
    { name: 'Coupons', route: ROUTES.PLATFORM_COUPONS, icon: Ticket },
    { name: 'Offers', route: ROUTES.OFFERS, icon: HandCoins },
    { name: 'Favorites', route: ROUTES.FAVORITES, icon: Heart },
    { name: 'Lists', route: ROUTES.MY_LISTS, icon: List },
    { name: 'Buyer analytics', route: ROUTES.BUYER_DASHBOARD, icon: LineChart },
  ];

  if (userId) {
    buyingItems.push(
      { name: 'Reviews received', route: ROUTES.REVIEWS_RECEIVED(userId), icon: Star },
      { name: 'Reviews given', route: ROUTES.REVIEWS_GIVEN(userId), icon: Star },
    );
  }

  const groups = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      items: [{ name: 'Dashboard', route: ROUTES.DASHBOARD, icon: LayoutDashboard }],
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      items: [
        { name: 'Profile', route: ROUTES.PROFILE, icon: User },
        { name: 'Verify', route: ROUTES.VERIFY_ACCOUNT, icon: Shield },
      ],
    },
    {
      id: 'selling',
      label: 'Selling',
      icon: Megaphone,
      items: [
        { name: 'Listings', route: ROUTES.MY_LISTINGS, icon: Package },
        { name: 'New listing', route: ROUTES.CREATE_LISTING, icon: TrendingUp },
        { name: 'Sold', route: ROUTES.I_SOLD, icon: Package },
        { name: 'Showcases', route: ROUTES.MY_SHOWCASES, icon: Star },
        { name: 'Campaigns', route: ROUTES.SELLER_CAMPAIGNS, icon: Megaphone },
        { name: 'Seller analytics', route: ROUTES.SELLER_DASHBOARD, icon: BarChart3 },
      ],
    },
    {
      id: 'buying',
      label: 'Buying',
      icon: ShoppingBag,
      items: buyingItems,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      items: [
        { name: 'History', route: ROUTES.PAYMENTS, icon: Receipt },
        { name: 'Methods', route: ROUTES.PAYMENT_METHODS, icon: CreditCard },
        { name: 'E-wallet', route: ROUTES.EWALLET, icon: Wallet },
        { name: 'Listing fee', route: ROUTES.PAY_LISTING_FEE, icon: Banknote },
      ],
    },
    {
      id: 'inbox',
      label: 'Inbox & help',
      icon: Mail,
      items: [
        { name: 'Inbox', route: ROUTES.INBOX, icon: Mail },
        { name: 'Aura', route: ROUTES.AURA_CHAT, icon: Sparkles },
        { name: 'Complaints', route: ROUTES.COMPLAINTS, icon: AlertTriangle },
        { name: 'Agreements', route: ROUTES.AGREEMENTS, icon: FileText },
      ],
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      items: [
        { name: 'Activity', route: ROUTES.SECURITY, icon: Shield },
        { name: 'Password', route: ROUTES.CHANGE_PASSWORD, icon: Settings },
      ],
    },
  ];

  if (isAdmin) {
    groups.push({
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      items: [{ name: 'Coupons (admin)', route: ROUTES.ADMIN_COUPONS, icon: Tag }],
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

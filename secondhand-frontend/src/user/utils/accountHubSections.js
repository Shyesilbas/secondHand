import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  FileText,
  HandCoins,
  Heart,
  LayoutDashboard,
  LineChart,
  List,
  Mail,
  Banknote,
  Package,
  Receipt,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';

/** Collapsible sidebar groups for Account Hub — single source of truth for nav. */
export const getAccountHubNavGroups = (userId) => [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    items: [
      { name: 'Dashboard', description: 'Account home', route: ROUTES.DASHBOARD, icon: LayoutDashboard },
    ],
  },
  {
    id: 'profile',
    label: 'Profile & account',
    icon: User,
    items: [
      { name: 'Profile', description: 'Personal info & addresses', route: ROUTES.PROFILE, icon: User },
      { name: 'Verify account', description: 'Email & verification', route: ROUTES.VERIFY_ACCOUNT, icon: Shield },
    ],
  },
  {
    id: 'selling',
    label: 'Selling',
    icon: Package,
    items: [
      { name: 'My listings', description: 'Manage your items', route: ROUTES.MY_LISTINGS, icon: Package },
      { name: 'Create listing', description: 'List something new', route: ROUTES.CREATE_LISTING, icon: TrendingUp },
      { name: 'I sold', description: 'Sales as seller', route: ROUTES.I_SOLD, icon: ShoppingBag },
      { name: 'My showcases', description: 'Featured listings', route: ROUTES.MY_SHOWCASES, icon: Star },
      { name: 'My coupons', description: 'Campaigns & discounts', route: ROUTES.MY_COUPONS, icon: Tag },
      { name: 'Seller analytics', description: 'Sales performance', route: ROUTES.SELLER_DASHBOARD, icon: BarChart3 },
    ],
  },
  {
    id: 'buying',
    label: 'Buying & orders',
    icon: ShoppingBag,
    items: [
      { name: 'My orders', description: 'Track purchases', route: ROUTES.MY_ORDERS, icon: ShoppingBag },
      { name: 'Shopping cart', description: 'Cart & checkout', route: ROUTES.SHOPPING_CART, icon: ShoppingCart },
      { name: 'Offers', description: 'Negotiations', route: ROUTES.OFFERS, icon: HandCoins },
      { name: 'Favorites', description: 'Saved listings', route: ROUTES.FAVORITES, icon: Heart },
      { name: 'My lists', description: 'Curated lists', route: ROUTES.MY_LISTS, icon: List },
      { name: 'Buyer analytics', description: 'Spending insights', route: ROUTES.BUYER_DASHBOARD, icon: LineChart },
    ],
  },
  {
    id: 'finance',
    label: 'Payments & wallet',
    icon: CreditCard,
    items: [
      { name: 'Payment history', description: 'Transactions', route: ROUTES.PAYMENTS, icon: Receipt },
      { name: 'Payment methods', description: 'Cards & bank', route: ROUTES.PAYMENT_METHODS, icon: CreditCard },
      { name: 'E-wallet', description: 'Balance & top-ups', route: ROUTES.EWALLET, icon: Wallet },
      { name: 'Listing fee', description: 'Pay listing fees', route: ROUTES.PAY_LISTING_FEE, icon: Banknote },
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: Star,
    items: [
      { name: 'Reviews received', description: 'Feedback about you', route: ROUTES.REVIEWS_RECEIVED(userId), icon: Star },
      { name: 'Reviews given', description: 'Your ratings', route: ROUTES.REVIEWS_GIVEN(userId), icon: Star },
    ],
  },
  {
    id: 'communication',
    label: 'Messages & notifications',
    icon: Mail,
    items: [
      { name: 'Inbox', description: 'Mail, notifications & chat', route: ROUTES.INBOX, icon: Mail },
      { name: 'Aura assistant', description: 'AI help', route: ROUTES.AURA_CHAT, icon: Sparkles },
    ],
  },
  {
    id: 'support',
    label: 'Support & legal',
    icon: FileText,
    items: [
      { name: 'Complaints', description: 'Disputes & support', route: ROUTES.COMPLAINTS, icon: AlertTriangle },
      { name: 'Agreements', description: 'Terms & policies', route: ROUTES.AGREEMENTS, icon: FileText },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    items: [
      { name: 'Audit logs', description: 'Account activity', route: ROUTES.SECURITY, icon: Shield },
      { name: 'Change password', description: 'Credentials', route: ROUTES.CHANGE_PASSWORD, icon: Settings },
    ],
  },
];

/** Legacy flat sections (optional reuse in other UIs). */
export const getAccountHubSections = ({ userId }) => [
  {
    title: 'Profile',
    items: [
      { title: 'Profile', desc: 'Manage your account', route: ROUTES.PROFILE, icon: User },
    ],
  },
  {
    title: 'Sales & Listings',
    items: [
      { title: 'My Listings', desc: 'Manage active items', route: ROUTES.MY_LISTINGS, icon: Package },
      { title: 'Create Listing', desc: 'List a new product', route: ROUTES.CREATE_LISTING, icon: TrendingUp },
      { title: 'My Coupons', desc: 'Campaign management', route: ROUTES.MY_COUPONS, icon: Tag },
    ],
  },
  {
    title: 'Purchases & Activity',
    items: [
      { title: 'My Orders', desc: 'Track shipments', route: ROUTES.MY_ORDERS, icon: ShoppingBag },
      { title: 'Offers', desc: 'Active negotiations', route: ROUTES.OFFERS, icon: HandCoins },
      { title: 'Favorites', desc: 'Saved for later', route: ROUTES.FAVORITES, icon: Heart },
    ],
  },
  {
    title: 'Finance',
    items: [
      { title: 'Payment History', desc: 'Transactions', route: ROUTES.PAYMENTS, icon: Receipt },
      { title: 'Payment Methods', desc: 'Cards & wallets', route: ROUTES.PAYMENT_METHODS, icon: CreditCard },
      { title: 'Listing Fees', desc: 'Due payments', route: ROUTES.PAY_LISTING_FEE, icon: CreditCard },
    ],
  },
  {
    title: 'Performance & Support',
    items: [
      { title: 'Seller Analytics', desc: 'Sales performance', route: ROUTES.SELLER_DASHBOARD, icon: BarChart3 },
      { title: 'Buyer Analytics', desc: 'Purchase insights', route: ROUTES.BUYER_DASHBOARD, icon: LineChart },
      { title: 'Received Reviews', desc: 'Feedback for you', route: ROUTES.REVIEWS_RECEIVED(userId), icon: Star },
      { title: 'Complaints', desc: 'Resolution center', route: ROUTES.COMPLAINTS, icon: AlertTriangle },
    ],
  },
  {
    title: 'Security',
    items: [
      { title: 'Audit Logs', desc: 'Account activity history', route: ROUTES.SECURITY, icon: Shield },
      { title: 'Change Password', desc: 'Update your password', route: ROUTES.CHANGE_PASSWORD, icon: Settings },
    ],
  },
];

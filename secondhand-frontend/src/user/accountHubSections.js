import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  HandCoins,
  Heart,
  LineChart,
  Package,
  Receipt,
  ShoppingBag,
  Settings,
  Shield,
  Star,
  Tag,
  TrendingUp,
  User
} from 'lucide-react';
import { ROUTES } from '../common/constants/routes.js';

export const getAccountHubSections = ({ userId }) => [
  {
    title: 'Profile',
    items: [
      { title: 'Profile', desc: 'Manage your account', route: ROUTES.PROFILE, icon: User }
    ]
  },
  {
    title: 'Sales & Listings',
    items: [
      { title: 'My Listings', desc: 'Manage active items', route: ROUTES.MY_LISTINGS, icon: Package },
      { title: 'Create Listing', desc: 'List a new product', route: ROUTES.CREATE_LISTING, icon: TrendingUp },
      { title: 'My Coupons', desc: 'Campaign management', route: ROUTES.MY_COUPONS, icon: Tag }
    ]
  },
  {
    title: 'Purchases & Activity',
    items: [
      { title: 'My Orders', desc: 'Track shipments', route: ROUTES.MY_ORDERS, icon: ShoppingBag },
      { title: 'Offers', desc: 'Active negotiations', route: ROUTES.OFFERS, icon: HandCoins },
      { title: 'Favorites', desc: 'Saved for later', route: ROUTES.FAVORITES, icon: Heart }
    ]
  },
  {
    title: 'Finance',
    items: [
      { title: 'Payment History', desc: 'Transactions', route: ROUTES.PAYMENTS, icon: Receipt },
      { title: 'Payment Methods', desc: 'Cards & wallets', route: ROUTES.PAYMENT_METHODS, icon: CreditCard },
      { title: 'Listing Fees', desc: 'Due payments', route: ROUTES.PAY_LISTING_FEE, icon: CreditCard }
    ]
  },
  {
    title: 'Performance & Support',
    items: [
      { title: 'Seller Analytics', desc: 'Sales performance', route: ROUTES.SELLER_DASHBOARD, icon: BarChart3 },
      { title: 'Buyer Analytics', desc: 'Purchase insights', route: ROUTES.BUYER_DASHBOARD, icon: LineChart },
      { title: 'Received Reviews', desc: 'Feedback for you', route: ROUTES.REVIEWS_RECEIVED(userId), icon: Star },
      { title: 'Complaints', desc: 'Resolution center', route: ROUTES.COMPLAINTS, icon: AlertTriangle }
    ]
  },
  {
    title: 'Security',
    items: [
      { title: 'Audit Logs', desc: 'Account activity history', route: ROUTES.SECURITY, icon: Shield },
      { title: 'Change Password', desc: 'Update your password', route: ROUTES.CHANGE_PASSWORD, icon: Settings }
    ]
  }
];

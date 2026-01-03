import React, {useMemo} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext.jsx';
import {ROUTES} from '../common/constants/routes.js';
import {
  AlertTriangle,
  BarChart3,
  ChevronRight,
  CreditCard,
  HandCoins,
  Heart,
  LineChart,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Shield,
  Star,
  Tag,
  TrendingUp
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const sections = useMemo(() => [
    {
      title: 'Sales & Listings',
      items: [
        { title: "My Listings", desc: "Manage active items", route: ROUTES.MY_LISTINGS, icon: Package },
        { title: "Create Listing", desc: "List a new product", route: ROUTES.CREATE_LISTING, icon: TrendingUp },
        { title: "My Coupons", desc: "Campaign management", route: ROUTES.MY_COUPONS, icon: Tag }
      ]
    },
    {
      title: 'Purchases & Activity',
      items: [
        { title: "My Orders", desc: "Track shipments", route: ROUTES.MY_ORDERS, icon: ShoppingBag },
        { title: "Offers", desc: "Active negotiations", route: ROUTES.OFFERS, icon: HandCoins },
        { title: "Favorites", desc: "Saved for later", route: ROUTES.FAVORITES, icon: Heart }
      ]
    },
    {
      title: 'Finance',
      items: [
        { title: "Payment History", desc: "Transactions", route: ROUTES.PAYMENTS, icon: Receipt },
        { title: "Payment Methods", desc: "Cards & wallets", route: ROUTES.PAYMENT_METHODS, icon: CreditCard },
        { title: "Listing Fees", desc: "Due payments", route: ROUTES.PAY_LISTING_FEE, icon: CreditCard }
      ]
    },
    {
      title: 'Performance & Support',
      items: [
        { title: "Seller Analytics", desc: "Sales performance", route: ROUTES.SELLER_DASHBOARD, icon: BarChart3 },
        { title: "Buyer Analytics", desc: "Purchase insights", route: ROUTES.BUYER_DASHBOARD, icon: LineChart },
        { title: "Received Reviews", desc: "Feedback for you", route: ROUTES.REVIEWS_RECEIVED(user?.id), icon: Star },
        { title: "Complaints", desc: "Resolution center", route: ROUTES.COMPLAINTS, icon: AlertTriangle }
      ]
    },
    {
      title: 'Security',
      items: [
        { title: "Audit Logs", desc: "Account activity history", route: ROUTES.SECURITY, icon: Shield },
        { title: "Change Password", desc: "Update your password", route: ROUTES.CHANGE_PASSWORD, icon: Settings }
      ]
    }
  ], [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="pt-12 pb-24">
          <div className="mb-16">
            <p className="text-xl text-gray-600 font-light">
              Welcome back, <span className="font-medium text-black">{user?.name}</span>
            </p>
          </div>

          <div className="space-y-20">
            {sections.map((section, idx) => (
              <section key={idx} className="opacity-0 animate-fade-in" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' }}>
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-[0.3em] mb-8">
                  {section.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={i}
                        to={item.route}
                        className="group relative block p-8 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                      >
                        <div className="mb-6">
                          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-50 group-hover:bg-black transition-all duration-500">
                            <Icon size={28} className="text-gray-400 group-hover:text-white transition-colors duration-500" />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-black mb-2 tracking-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-light leading-relaxed">
                          {item.desc}
                        </p>
                        <div className="mt-6 flex items-center text-gray-400 group-hover:text-black transition-colors duration-500">
                          <span className="text-sm font-medium">Learn more</span>
                          <ChevronRight size={16} className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
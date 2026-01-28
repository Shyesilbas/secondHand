import React, {useMemo, useState, useCallback} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext.jsx';
import {ROUTES} from '../common/constants/routes.js';
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  HandCoins,
  Heart,
  LineChart,
  Package,
  Receipt,
  Search,
  Settings,
  ShoppingBag,
  Shield,
  Star,
  Tag,
  TrendingUp,
  User
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const allSections = useMemo(() => [
    {
      title: 'Profile',
      items: [
        { title: "Profile", desc: "Manage your account", route: ROUTES.PROFILE, icon: User }
      ]
    },
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

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSections;
    }

    const query = searchQuery.toLowerCase().trim();
    return allSections
      .map(section => ({
        ...section,
        items: section.items.filter(item => 
          item.title.toLowerCase().startsWith(query) ||
          item.title.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query)
        )
      }))
      .filter(section => section.items.length > 0);
  }, [allSections, searchQuery]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-600">
              Welcome back{user?.name ? `, ${user.name}` : ''}.
            </p>
          </div>

          <div className="w-full sm:max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="block w-full pl-9 pr-24 py-2.5 border border-slate-200 rounded-lg bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredSections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-slate-900 font-semibold">No results</p>
            <p className="text-sm text-slate-600 mt-1">Try a different search term.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredSections.map((section, idx) => (
              <section key={idx}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
                  <span className="text-xs text-slate-500">{section.items.length}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.items.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={i}
                        to={item.route}
                        className="group block rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-semibold text-slate-900 truncate">
                                {item.title}
                              </h3>
                              <span className="text-xs text-slate-400 group-hover:text-slate-500">
                                Open
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
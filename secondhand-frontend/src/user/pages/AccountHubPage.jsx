import React, {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight, Search, X, Inbox, LayoutDashboard, ShoppingBag, MapPin, CreditCard, User, Heart, Bell, Settings, Package, TrendingUp} from 'lucide-react';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {getAccountHubSections} from '../utils/accountHubSections.js';
import {filterAccountHubSections} from '../utils/accountHubFilter.js';

import { USER_DEFAULTS } from '../userConstants.js';

const getInitials = (name) => {
  const value = (name || '').trim();
  if (!value) return USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const parts = value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${last}`.toUpperCase();
};

const AccountHubPage = () => {
  const { user } = useAuthState();
  const [searchQuery, setSearchQuery] = useState('');

  const allSections = useMemo(() => getAccountHubSections({ userId: user?.id }), [user?.id]);

  const filteredSections = useMemo(() => filterAccountHubSections(allSections, searchQuery), [allSections, searchQuery]);

  const flatItems = useMemo(
    () => allSections.flatMap((section) => section.items.map((item) => ({ ...item, sectionTitle: section.title }))),
    [allSections]
  );

  const totalItemsCount = flatItems.length;

  const visibleItemsCount = useMemo(
    () => filteredSections.reduce((acc, section) => acc + section.items.length, 0),
    [filteredSections]
  );

  const quickItems = useMemo(() => {
    const byTitle = new Map(flatItems.map((item) => [item.title, item]));
    const prioritizedTitles = ['Profile', 'My Listings', 'Create Listing', 'My Orders'];
    return prioritizedTitles.map((t) => byTitle.get(t)).filter(Boolean).slice(0, 4);
  }, [flatItems]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Sidebar mock datası (Gerçek veride flatItems kullanılabilir, görseldeki menü referans alınmıştır)
  const sidebarNav = [
    { name: 'Dashboard', icon: LayoutDashboard, route: '#', active: true },
    { name: 'My Orders', icon: ShoppingBag, route: '/orders', active: false },
    { name: 'Addresses', icon: MapPin, route: '#', active: false },
    { name: 'Payment Methods', icon: CreditCard, route: '#', active: false },
    { name: 'Profile', icon: User, route: '/profile', active: false },
    { name: 'Wishlist', icon: Heart, route: '/favorites', active: false },
    { name: 'Notifications', icon: Bell, route: '/notifications', active: false },
    { name: 'Settings', icon: Settings, route: '/settings', active: false },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-[320px] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
            <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover rounded-full" />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-base font-bold text-gray-900 truncate">{user?.name || 'User'}</h2>
              <p className="text-sm text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 pb-8 overflow-y-auto">
          {sidebarNav.map((item) => (
            <Link
              key={item.name}
              to={item.route}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-colors ${
                item.active 
                  ? 'bg-[#0f111a] text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.active ? 'text-gray-300' : 'text-gray-400'}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 lg:pl-12 overflow-y-auto">
        <div className="max-w-5xl">
          <div className="mb-10">
            <h1 className="text-3xl lg:text-[40px] font-bold text-gray-900 tracking-tight flex items-center gap-3">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! <span>👋</span>
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Here's what's happening with your account today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[15px] font-medium text-gray-500 w-20">Total Orders</span>
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="text-[40px] font-bold text-gray-900 leading-none">24</div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">+12%</span>
                  <span className="text-sm text-gray-500">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[15px] font-medium text-gray-500 w-20">Active Orders</span>
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="text-[40px] font-bold text-gray-900 leading-none">3</div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">+2</span>
                  <span className="text-sm text-gray-500">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex flex-col justify-between overflow-hidden relative">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[15px] font-medium text-gray-500 w-20">Total Spent</span>
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white absolute -right-2 -top-2 scale-125">
                  <TrendingUp className="w-5 h-5 absolute bottom-3 left-3" />
                </div>
              </div>
              <div>
                <div className="text-[40px] font-bold text-gray-900 leading-none tracking-tight">$3,450</div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">+8%</span>
                  <span className="text-sm text-gray-500">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[15px] font-medium text-gray-500 w-20">Wishlist Items</span>
                <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center text-white">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="text-[40px] font-bold text-gray-900 leading-none">12</div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">+3</span>
                  <span className="text-sm text-gray-500">from last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-[24px] border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <Link to="/orders" className="text-sm font-semibold text-gray-900 flex items-center gap-1 hover:text-indigo-600 transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Dummy Order Item */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop" alt="Headphones" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Premium Wireless Headphones</h3>
                  <div className="text-sm text-gray-500 mt-1">ORD-2024-001 • Apr 5, 2024</div>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    Delivered
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900 tracking-tight">$299.99</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountHubPage;

import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, ShoppingBag, ShieldCheck, Wallet, Plus, MessageSquare, Heart, Sparkles, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { USER_DEFAULTS } from '../userConstants.js';
import { getAccountHubNavGroups } from '../utils/accountHubSections.js';
import { isAdminUser } from '../../common/utils/admin.js';
import { orderService } from '../../order/services/orderService.js';
import { formatCurrency } from '../../common/formatters.js';
import MyShowcasesPanel from '../../showcase/components/MyShowcasesPanel.jsx';
const getInitials = name => {
  const value = (name || '').trim();
  if (!value) return USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const parts = value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${last}`.toUpperCase();
};
const isRouteActive = (pathname, route) => pathname === route;
const AccountHubPage = () => {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuthState();
  const {
    pathname
  } = useLocation();
  const [openGroups, setOpenGroups] = useState(() => new Set(['overview', 'buying']));
  const navGroups = useMemo(() => {
    const id = user?.id;
    return getAccountHubNavGroups(id ?? 0, {
      isAdmin: isAdminUser(user)
    });
  }, [user?.id, user?.role]);
  const toggleGroup = id => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else next.add(id);
      return next;
    });
  };
  const {
    data: ordersData,
    isLoading: ordersLoading
  } = useQuery({
    queryKey: ['myOrders', user?.id, 0, 5],
    queryFn: () => orderService.myOrders(0, 5),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  const recentOrders = useMemo(() => ordersData?.content || [], [ordersData]);
  if (!user) {
    return <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>;
  }
  return <div className="min-h-screen bg-[#faf9f7] flex flex-col lg:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-[320px] bg-transparent flex-shrink-0 flex flex-col p-6 lg:py-10 lg:pl-10 lg:pr-6 select-none">
        {/* User Card */}
        <div className="bg-background-primary rounded-2xl p-5 shadow-sm border border-slate-100/60 mb-6 flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden">
            {user?.profilePicture ? <img src={user.profilePicture} alt="" className="h-full w-full object-cover" /> : getInitials(`${user?.name || ''} ${user?.surname || ''}`)}
          </div>
          <div className="overflow-hidden min-w-0">
            <h2 className="text-lg font-semibold text-text-primary truncate">
              {user?.name ? `${user.name}${user.surname ? ` ${user.surname}` : ''}` : 'User'}
            </h2>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || ''}</p>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Tabs */}
        <nav className="flex lg:hidden overflow-x-auto gap-2 pb-4 scrollbar-none -mx-2 px-2">
          {navGroups.map(group => {
          return group.items.map(item => {
            const active = isRouteActive(pathname, item.route);
            return <Link key={`mobile-${group.id}-${item.route}`} to={item.route} className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${active ? 'bg-slate-900 text-white shadow-sm' : 'bg-background-primary text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>
                  {item.name}
                </Link>;
          });
        })}
        </nav>

        {/* Desktop Navigation Groups */}
        <nav className="hidden lg:flex flex-col gap-2">
          <span className="text-caption font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">{t("private_space")}</span>
          {navGroups.map(group => {
          const GroupIcon = group.icon;
          const isOpen = openGroups.has(group.id);
          return <div key={group.id} className="mb-2">
                <button type="button" onClick={() => toggleGroup(group.id)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-950/[0.02] transition-colors">
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                  <GroupIcon className="h-4 w-4 text-slate-400 shrink-0" strokeWidth={2} />
                  <span className="truncate">{group.label}</span>
                </button>
                {isOpen && <div className="mt-1.5 ml-2.5 pl-3 border-l border-slate-100 space-y-1">
                    {group.items.map(item => {
                const ItemIcon = item.icon;
                const active = isRouteActive(pathname, item.route);
                return <Link key={`${group.id}-${item.route}`} to={item.route} className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-xs transition-all ${active ? 'bg-slate-900 text-white font-bold shadow-sm' : 'text-slate-500 font-semibold hover:bg-slate-950/[0.02] hover:text-text-primary'}`}>
                          <ItemIcon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} strokeWidth={active ? 2.5 : 2} />
                          <span className="truncate">{item.name}</span>
                        </Link>;
              })}
                  </div>}
              </div>;
        })}
        </nav>
      </aside>

      {/* Main Panel Body */}
      <main className="flex-1 p-6 lg:p-10 lg:pl-4 overflow-y-auto">
        <PageContainer className="max-w-4xl">
          {/* Header Panel */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("welcome")}{user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="mt-1 text-sm text-slate-500 font-medium">{t("your_personal_secondhand_space")}</p>
            </div>
            {/* Secure Trust Badge */}
            <div className="inline-flex items-center self-start gap-1.5 rounded-full bg-status-success-bg/50 border border-emerald-100/60 px-3.5 py-1.5 text-xs font-bold text-emerald-700 select-none shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-status-success" strokeWidth={2.5} />
              <span>{t("escrow_secured_member")}</span>
            </div>
          </div>

          {/* Mini Summary Row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <Link to={ROUTES.MY_LISTINGS} className="bg-background-primary rounded-2xl p-4 border border-slate-100/60 shadow-sm flex flex-col items-center justify-center text-center transition hover:shadow-md hover:scale-[1.01]">
              <Sparkles className="w-5 h-5 text-primary mb-1.5" />
              <span className="text-caption font-bold uppercase tracking-wider text-slate-400">{t("listings")}</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5">{t("manage_items")}</span>
            </Link>
            <Link to={ROUTES.FAVORITES} className="bg-background-primary rounded-2xl p-4 border border-slate-100/60 shadow-sm flex flex-col items-center justify-center text-center transition hover:shadow-md hover:scale-[1.01]">
              <Heart className="w-5 h-5 text-rose-500 mb-1.5" />
              <span className="text-caption font-bold uppercase tracking-wider text-slate-400">{t("saved")}</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5">{t("my_favorites")}</span>
            </Link>
            <Link to={ROUTES.CHAT} className="bg-background-primary rounded-2xl p-4 border border-slate-100/60 shadow-sm flex flex-col items-center justify-center text-center transition hover:shadow-md hover:scale-[1.01]">
              <MessageSquare className="w-5 h-5 text-teal-500 mb-1.5" />
              <span className="text-caption font-bold uppercase tracking-wider text-slate-400">{t("inbox")}</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5">{t("chat_history")}</span>
            </Link>
          </div>

          {/* Recent Orders Box */}
          <div className="bg-background-primary rounded-2xl border border-slate-100/60 shadow-sm p-6 lg:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary uppercase tracking-widest">{t("recent_orders")}</h2>
              <Link to={ROUTES.MY_ORDERS} className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 hover:text-text-primary transition-colors">{t("view_all")}<ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>

            {ordersLoading ? <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-50 animate-pulse border border-slate-100/40" />)}
              </div> : recentOrders.length === 0 ? <div className="text-center py-12 select-none">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                  <ShoppingBag className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-text-primary">{t("your_shopping_bag_is_waiting")}</h3>
                <p className="text-xs text-slate-400 mt-1">{t("explore_our_second_hand_listings_to_find")}</p>
                <Link to={ROUTES.LISTINGS} className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-black transition-all">{t("explore_listings")}</Link>
              </div> : <div className="space-y-4">
                {recentOrders.map(order => {
              const items = order.orderItems || order.items || [];
              const firstItem = items[0];
              const listing = firstItem?.listing;
              const thumbUrl = listing?.imageUrl || firstItem?.imageUrl;
              const lineTitle = listing?.title || firstItem?.title;
              const statusColor = order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-status-success-bg/50 text-emerald-700 border-emerald-100/50' : order.status === 'CANCELLED' ? 'bg-status-error-bg/50 text-red-700 border-red-100/50' : 'bg-status-warning-bg/50 text-amber-700 border-amber-100/50';
              return <Link key={order.id} to={ROUTES.MY_ORDERS} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100/60 bg-slate-50/30 hover:bg-slate-50 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-background-primary overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100/80 shadow-sm">
                          {thumbUrl ? <img src={thumbUrl} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-text-primary truncate">
                            {order.name || lineTitle || `Order #${order.orderNumber}`}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 font-medium">
                            {order.orderNumber} •{' '}
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : ''}
                          </p>
                          <span className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-caption font-bold uppercase tracking-wider border ${statusColor}`}>
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-base font-bold text-text-primary tracking-tight">
                          {formatCurrency(order.totalAmount ?? order.total ?? 0, order.currency)}
                        </p>
                      </div>
                    </Link>;
            })}
              </div>}
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link to={ROUTES.CREATE_LISTING} className="bg-background-primary rounded-2xl p-5 border border-slate-100/60 shadow-sm flex items-center gap-4 transition hover:shadow-md hover:scale-[1.01]">
              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                <Plus className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider">{t("sell_item")}</h3>
                <p className="text-caption text-slate-400 font-medium mt-0.5">{t("create_a_listing")}</p>
              </div>
            </Link>
            <Link to={ROUTES.EWALLET} className="bg-background-primary rounded-2xl p-5 border border-slate-100/60 shadow-sm flex items-center gap-4 transition hover:shadow-md hover:scale-[1.01]">
              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                <Wallet className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider">{t("my_wallet")}</h3>
                <p className="text-caption text-slate-400 font-medium mt-0.5">{t("top_up_balance")}</p>
              </div>
            </Link>
            <Link to={ROUTES.PROFILE} className="bg-background-primary rounded-2xl p-5 border border-slate-100/60 shadow-sm flex items-center gap-4 transition hover:shadow-md hover:scale-[1.01]">
              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                <MapPin className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider">{t("addresses")}</h3>
                <p className="text-caption text-slate-400 font-medium mt-0.5">{t("manage_profiles")}</p>
              </div>
            </Link>
          </div>

          <MyShowcasesPanel userId={user?.id} />
        </PageContainer>
      </main>
    </div>;
};
export default AccountHubPage;
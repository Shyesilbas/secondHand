import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { USER_DEFAULTS } from '../userConstants.js';
import { getAccountHubNavGroups } from '../utils/accountHubSections.js';
import { orderService } from '../../order/services/orderService.js';
import { formatCurrency } from '../../common/formatters.js';
import MyShowcasesPanel from '../../showcase/components/MyShowcasesPanel.jsx';

const getInitials = (name) => {
  const value = (name || '').trim();
  if (!value) return USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const parts = value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${last}`.toUpperCase();
};

const isRouteActive = (pathname, route) => pathname === route;

const AccountHubPage = () => {
  const { user } = useAuthState();
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState(() => new Set(['overview', 'buying']));

  const navGroups = useMemo(() => {
    const id = user?.id;
    const groups = getAccountHubNavGroups(id ?? 0);
    if (!id) return groups.filter((g) => g.id !== 'reviews');
    return groups;
  }, [user?.id]);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['myOrders', user?.id, 0, 5],
    queryFn: () => orderService.myOrders(0, 5),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const recentOrders = useMemo(() => ordersData?.content || [], [ordersData]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col lg:flex-row">
      <aside className="w-full lg:w-[300px] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col max-h-[100dvh] lg:max-h-none lg:min-h-screen">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
            <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
              ) : (
                getInitials(`${user?.name || ''} ${user?.surname || ''}`)
              )}
            </div>
            <div className="overflow-hidden min-w-0">
              <h2 className="text-base font-bold text-gray-900 truncate">
                {user?.name ? `${user.name}${user.surname ? ` ${user.surname}` : ''}` : 'User'}
              </h2>
              <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 pb-8 overflow-y-auto">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Menu</p>
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = openGroups.has(group.id);
            return (
              <div key={group.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                  />
                  <GroupIcon className="h-4 w-4 text-gray-500 shrink-0" />
                  <span className="truncate">{group.label}</span>
                </button>
                {isOpen && (
                  <div className="mt-0.5 ml-2 pl-2 border-l border-gray-100 space-y-0.5">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const active = isRouteActive(pathname, item.route);
                      return (
                        <Link
                          key={`${group.id}-${item.route}`}
                          to={item.route}
                          title={item.description}
                          className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                            active
                              ? 'bg-[#0f111a] text-white'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <ItemIcon className={`h-4 w-4 shrink-0 mt-0.5 ${active ? 'text-gray-300' : 'text-gray-400'}`} />
                          <span className="leading-snug">
                            <span className="font-medium block">{item.name}</span>
                            {!active && (
                              <span className="text-[11px] text-gray-400 font-normal line-clamp-1">{item.description}</span>
                            )}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl">
          <div className="mb-7">
            <h1 className="text-2xl lg:text-[30px] font-bold text-gray-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">Here&apos;s what&apos;s happening with your account today.</p>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-200 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <Link
                to={ROUTES.MY_ORDERS}
                className="text-sm font-semibold text-gray-900 flex items-center gap-1 hover:text-indigo-600 transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const items = order.orderItems || order.items || [];
                  const firstItem = items[0];
                  const listing = firstItem?.listing;
                  const thumbUrl = listing?.imageUrl || firstItem?.imageUrl;
                  const lineTitle = listing?.title || firstItem?.title;
                  const statusColor =
                    order.status === 'DELIVERED' || order.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.status === 'CANCELLED'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700';

                  return (
                    <Link
                      key={order.id}
                      to={ROUTES.MY_ORDERS}
                      className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                            {order.name || lineTitle || `Order #${order.orderNumber}`}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.orderNumber} •{' '}
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : ''}
                          </p>
                          <span
                            className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${statusColor}`}
                          >
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-base font-bold text-gray-900 tracking-tight">
                          {formatCurrency(order.totalAmount ?? order.total ?? 0, order.currency)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <MyShowcasesPanel userId={user?.id} />
        </div>
      </main>
    </div>
  );
};

export default AccountHubPage;

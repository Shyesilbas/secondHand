import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, Ticket } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { couponService } from '../../cart/services/couponService.js';
import { formatCouponDiscount, formatCouponKindLabel } from '../utils/couponUiFormat.js';

const TABS = {
  ACTIVE: 'active',
  PARTICIPATED: 'participated',
};

function sortActive(list) {
  return [...(list || [])].sort((a, b) => String(a.code).localeCompare(String(b.code)));
}

const PlatformCouponsPage = () => {
  const [tab, setTab] = useState(TABS.ACTIVE);

  const activeQ = useQuery({
    queryKey: ['coupons', 'active-for-me'],
    queryFn: () => couponService.active(),
    select: (d) => (Array.isArray(d) ? sortActive(d) : []),
    staleTime: 30_000,
  });

  const participationsQ = useQuery({
    queryKey: ['coupons', 'redemptions'],
    queryFn: () => couponService.redemptions(),
    select: (d) => (Array.isArray(d) ? d : []),
    staleTime: 30_000,
  });

  const isFetching = tab === TABS.ACTIVE ? activeQ.isFetching : participationsQ.isFetching;
  const refetch = () => {
    activeQ.refetch();
    participationsQ.refetch();
  };

  const activeList = activeQ.data ?? [];
  const participationsList = participationsQ.data ?? [];

  const loading = tab === TABS.ACTIVE ? activeQ.isLoading : participationsQ.isLoading;
  const error = tab === TABS.ACTIVE ? activeQ.error : participationsQ.error;

  const ordersHref = (orderId) =>
    orderId != null ? `${ROUTES.MY_ORDERS}?orderId=${encodeURIComponent(String(orderId))}` : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <div className="sticky top-0 z-10 -mx-4 mb-4 px-4 py-4 bg-[#F8FAFC]/90 backdrop-blur border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-xl bg-violet-100 text-violet-700 shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-semibold text-slate-900">Coupons</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white p-1 mb-6 w-fit max-w-full">
          <button
            type="button"
            onClick={() => setTab(TABS.ACTIVE)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === TABS.ACTIVE ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active campaigns
          </button>
          <button
            type="button"
            onClick={() => setTab(TABS.PARTICIPATED)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === TABS.PARTICIPATED ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Participated
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error?.response?.data?.message || error?.message || 'Could not load.'}
          </div>
        )}

        {!loading && !error && tab === TABS.ACTIVE && activeList.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600">
            No coupons here. Ones you&apos;ve applied to an order appear under Participated.
          </div>
        )}

        {!loading &&
          !error &&
          tab === TABS.PARTICIPATED &&
          participationsList.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600">
              You haven&apos;t used a coupon on an order yet.
            </div>
          )}

        {!loading && !error && tab === TABS.ACTIVE && activeList.length > 0 && (
          <div className="space-y-3">
            {activeList.map((c) => (
              <article key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <CouponActiveCard c={c} />
              </article>
            ))}
          </div>
        )}

        {!loading && !error && tab === TABS.PARTICIPATED && participationsList.length > 0 && (
          <div className="space-y-3">
            {participationsList.map((row) => (
              <article key={row.redemptionId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold text-slate-900 text-lg">{row.couponCode}</span>
                    </div>
                    {row.couponTitle?.trim() && (
                      <div className="text-sm font-semibold text-slate-800">{row.couponTitle.trim()}</div>
                    )}
                    {row.couponDescription?.trim() && (
                      <p className="text-xs text-slate-600">{row.couponDescription.trim()}</p>
                    )}
                    <p className="text-xs text-slate-500">Used {row.redeemedAt ? formatDateTime(row.redeemedAt) : '—'}</p>
                    <div className="text-sm">
                      {ordersHref(row.orderId) ? (
                        <Link
                          to={ordersHref(row.orderId)}
                          className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          Order {row.orderNumber ? `#${row.orderNumber}` : `#${row.orderId}`}
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-sm">No order linked</span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function CouponActiveCard({ c }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-semibold text-slate-900 text-lg">{c.code}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-violet-50 text-violet-700 border-violet-200">
            {formatCouponKindLabel(c.discountKind)}: {formatCouponDiscount(c)}
          </span>
        </div>
        {c.title?.trim() && <div className="text-sm font-semibold text-slate-800">{c.title.trim()}</div>}
        {c.description?.trim() && <p className="text-xs text-slate-600">{c.description.trim()}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            Min subtotal:{' '}
            <strong className="text-slate-900">{c.minSubtotal != null ? formatCurrency(c.minSubtotal, 'TRY') : '—'}</strong>
          </div>
          <div>
            Max discount:{' '}
            <strong className="text-slate-900">{c.maxDiscount != null ? formatCurrency(c.maxDiscount, 'TRY') : '—'}</strong>
          </div>
          <div>
            Global left:{' '}
            <strong className="text-slate-900">{c.usageLimitGlobal != null ? String(c.usageRemainingGlobal ?? '—') : '—'}</strong>
          </div>
          <div>
            Per user left:{' '}
            <strong className="text-slate-900">{c.usageLimitPerUser != null ? String(c.usageRemainingPerUser ?? '—') : '—'}</strong>
          </div>
        </div>
        {Array.isArray(c.eligibleTypes) && c.eligibleTypes.length > 0 && (
          <div className="text-xs text-slate-600">
            Types: <strong>{c.eligibleTypes.join(', ')}</strong>
          </div>
        )}
      </div>
      <Link
        to={ROUTES.CHECKOUT}
        className="shrink-0 inline-flex justify-center px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700"
      >
        Checkout
      </Link>
    </div>
  );
}

export default PlatformCouponsPage;

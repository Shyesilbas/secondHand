import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, Receipt, ShoppingBag } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { orderService } from '../services/orderService.js';

const resolveOrderId = (payload) => payload?.id || payload?.orderId || null;
const resolveOrderNumber = (payload) => payload?.orderNumber || payload?.orderNo || null;

const getOrderItemTitle = (item) =>
  item?.listing?.title?.trim() ||
  item?.listingTitle?.trim() ||
  item?.title?.trim() ||
  '';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(false);

  const orderId = resolveOrderId(order) || state?.orderId || null;
  const orderNumber = resolveOrderNumber(order) || state?.orderNumber || null;
  const currency = order?.currency || 'TRY';
  const totalAmount = Number(order?.totalAmount ?? state?.totalAmount ?? 0);
  const orderDate = order?.createdAt || state?.createdAt || new Date().toISOString();
  const shippingAddress = order?.shippingAddress || state?.shippingAddress || null;
  const itemCount = order?.orderItems?.length ?? state?.itemCount ?? 0;

  const itemTitles = useMemo(() => {
    const items = order?.orderItems;
    if (!Array.isArray(items) || items.length === 0) return [];
    return items.map(getOrderItemTitle).filter(Boolean);
  }, [order]);

  const detailFetchDoneRef = useRef(false);

  useEffect(() => {
    detailFetchDoneRef.current = false;
  }, [orderId, orderNumber]);

  useEffect(() => {
    let isMounted = true;
    if (!orderId && !orderNumber) return undefined;
    if (order && Array.isArray(order.orderItems)) return undefined;
    if (detailFetchDoneRef.current) return undefined;
    detailFetchDoneRef.current = true;

    const loadOrder = async () => {
      setLoading(true);
      try {
        const fetched = orderId
          ? await orderService.getById(orderId)
          : await orderService.getByOrderNumber(orderNumber);
        if (isMounted) setOrder(fetched);
      } catch {
        // Keep fallback data from navigation state if lookup fails.
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId, orderNumber, order]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <style>{`
        @keyframes successOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
          50% { transform: translate(8%, -6%) scale(1.08); opacity: 0.5; }
        }
        @keyframes successOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          50% { transform: translate(-10%, 8%) scale(1.12); opacity: 0.4; }
        }
        @keyframes successRing {
          0% { transform: scale(0.92); opacity: 0.55; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes successIconIn {
          0% { transform: scale(0.85); opacity: 0; }
          55% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Subtle ambient motion — professional, not playful */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl"
          style={{ animation: 'successOrb1 14s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-40 -left-28 h-[380px] w-[380px] rounded-full bg-emerald-200/35 blur-3xl"
          style={{ animation: 'successOrb2 18s ease-in-out infinite' }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_20px_70px_-26px_rgba(15,23,42,0.45)] overflow-hidden">
          <div className="px-6 py-7 border-b border-slate-100 text-center bg-gradient-to-b from-emerald-50/90 to-white relative">
            <div className="relative inline-flex items-center justify-center mx-auto mb-4">
              <span
                className="absolute inline-flex h-20 w-20 rounded-full border-2 border-emerald-400/50"
                style={{ animation: 'successRing 2s ease-out infinite' }}
              />
              <div
                className="relative w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm"
                style={{ animation: 'successIconIn 0.55s ease-out both' }}
              >
                <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Your order was placed successfully
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Payment is complete. We&apos;re getting your order ready.
            </p>
          </div>

          <div className="px-6 py-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">Order number</p>
                <p className="text-sm font-bold text-slate-800">#{orderNumber || '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">Date</p>
                <p className="text-sm font-bold text-slate-800">{formatDateTime(orderDate)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">Total</p>
                <p className="text-sm font-bold text-slate-800">{formatCurrency(totalAmount, currency)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <p className="text-sm font-semibold text-slate-800">Order details</p>
              </div>
              {loading && itemCount > 0 && itemTitles.length === 0 ? (
                <p className="text-sm text-slate-500">Loading details…</p>
              ) : (
                <div className="space-y-2 text-sm text-slate-600">
                  <div>
                    <p>
                      <span className="font-medium text-slate-700">Items:</span>{' '}
                      {itemCount}
                      {itemTitles.length === 1 && (
                        <span className="text-slate-600"> — {itemTitles[0]}</span>
                      )}
                    </p>
                    {itemTitles.length > 1 && (
                      <ul className="mt-1.5 ml-0.5 space-y-0.5 border-l-2 border-indigo-100 pl-3 text-slate-600">
                        {itemTitles.map((title, i) => (
                          <li key={i}>{title}</li>
                        ))}
                      </ul>
                    )}
                    {itemCount > 0 && itemTitles.length === 0 && !loading && (
                      <p className="text-xs text-slate-400 mt-1">Line items are unavailable for this order.</p>
                    )}
                  </div>
                  {shippingAddress?.addressLine && (
                    <p>
                      <span className="font-medium text-slate-700">Shipping:</span>{' '}
                      {shippingAddress.addressLine}, {shippingAddress.city}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {orderId ? (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.MY_ORDERS, { state: { focusOrderId: orderId } })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  View order
                </button>
              ) : (
                <Link
                  to={ROUTES.MY_ORDERS}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  My orders
                </Link>
              )}

              <Link
                to={ROUTES.MY_ORDERS}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                All orders
              </Link>

              <Link
                to={ROUTES.LISTINGS}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

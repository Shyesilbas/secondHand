import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, Receipt, ShoppingBag } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { orderService } from '../services/orderService.js';
const resolveOrderId = payload => payload?.id || payload?.orderId || null;
const resolveOrderNumber = payload => payload?.orderNumber || payload?.orderNo || null;
const getOrderItemTitle = item => item?.listing?.title?.trim() || item?.listingTitle?.trim() || item?.title?.trim() || '';
const OrderSuccessPage = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const {
    state
  } = useLocation();
  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(false);
  const orderId = resolveOrderId(order) || state?.orderId || null;
  const orderNumber = resolveOrderNumber(order) || state?.orderNumber || null;
  const currency = order?.currency || 'TRY';
  const totalAmount = Number(order?.totalAmount ?? state?.totalAmount ?? 0);
  const orderDate = order?.createdAt || state?.createdAt || new Date().toISOString();
  const shippingAddress = order?.shippingAddress || state?.shippingAddress || null;
  const itemCount = order?.orderItems?.length ?? state?.itemCount ?? 0;
  const deliveryMethod = order?.deliveryMethod || state?.deliveryMethod || 'CARGO';
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
        const fetched = orderId ? await orderService.getById(orderId) : await orderService.getByOrderNumber(orderNumber);
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
  return <div className="min-h-screen bg-slate-50 relative overflow-hidden">
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
        <div className="absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl" style={{
        animation: 'successOrb1 14s ease-in-out infinite'
      }} />
        <div className="absolute -bottom-40 -left-28 h-[380px] w-[380px] rounded-full bg-status-success-bg/35 blur-3xl" style={{
        animation: 'successOrb2 18s ease-in-out infinite'
      }} />
      </div>

      <PageContainer narrow className="py-10 relative z-10">
        <div className="bg-background-primary rounded-2xl border border-border-light shadow-sm overflow-hidden">
          <div className="px-6 py-7 border-b border-slate-100 text-center bg-gradient-to-b from-emerald-50/90 to-white relative">
            <div className="relative inline-flex items-center justify-center mx-auto mb-4">
              <span className="absolute inline-flex h-20 w-20 rounded-full border-2 border-emerald-400/50" style={{
              animation: 'successRing 2s ease-out infinite'
            }} />
              <div className="relative w-16 h-16 rounded-2xl bg-status-success-bg text-status-success flex items-center justify-center shadow-sm" style={{
              animation: 'successIconIn 0.55s ease-out both'
            }}>
                <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              {deliveryMethod === 'SAFE_MEETUP' ? 'Elden Teslimat Siparişiniz Oluşturuldu!' : 'Your order was placed successfully'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {deliveryMethod === 'SAFE_MEETUP' ? 'Ödemeniz alındı. Buluşma noktasında satıcıyla görüşerek teslim alabilirsiniz.' : "Payment is complete. We're getting your order ready."}
            </p>
          </div>

          <div className="px-6 py-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">{t("order_number")}</p>
                <p className="text-sm font-bold text-slate-800">#{orderNumber || '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">{t("date")}</p>
                <p className="text-sm font-bold text-slate-800">{formatDateTime(orderDate)}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">{t("total")}</p>
                <p className="text-sm font-bold text-slate-800">{formatCurrency(totalAmount, currency)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-slate-800">{t("order_details")}</p>
              </div>
              {loading && itemCount > 0 && itemTitles.length === 0 ? <p className="text-sm text-slate-500">{t("loading_details")}</p> : <div className="space-y-2 text-sm text-slate-600">
                  <div>
                    <p>
                      <span className="font-medium text-slate-700">{t("items")}</span>{' '}
                      {itemCount}
                      {itemTitles.length === 1 && <span className="text-slate-600"> — {itemTitles[0]}</span>}
                    </p>
                    {itemTitles.length > 1 && <ul className="mt-1.5 ml-0.5 space-y-0.5 border-l-2 border-primary pl-3 text-slate-600">
                        {itemTitles.map((title, i) => <li key={i}>{title}</li>)}
                      </ul>}
                    {itemCount > 0 && itemTitles.length === 0 && !loading && <p className="text-xs text-slate-400 mt-1">{t("line_items_are_unavailable_for_this_orde")}</p>}
                  </div>
                  {shippingAddress?.addressLine && deliveryMethod !== 'SAFE_MEETUP' && <p>
                      <span className="font-medium text-slate-700">{t("shipping")}</span>{' '}
                      {shippingAddress.addressLine}, {shippingAddress.city}
                    </p>}
                  {deliveryMethod === 'SAFE_MEETUP' && <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                      <p className="flex items-center gap-1.5 text-slate-800">
                        <span className="font-semibold text-slate-700">{t("bulu_ma_konumu")}</span>{' '}
                        <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-primary">{order?.meetupLocation || state?.meetupLocation || 'Belirtilmemiş'}</span>
                      </p>
                      <div className="p-3 bg-indigo-50 border border-primary rounded-xl text-xs text-primary leading-relaxed font-medium">
                        🔒 <strong>{t("g_venli_teslimat_hat_rlatmas")}</strong>{t("bulu_ma_noktas_na_vard_n_zda_sat_c_ya")}<strong>{t("sipari_lerim")}</strong>{t("sayfas_ndan_eri_ebilece_iniz_6_haneli_do")}<strong>{t("4_i_g_n")}</strong>{t("s_reniz_bulunmaktad_r")}</div>
                    </div>}
                </div>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {orderId ? <button type="button" onClick={() => navigate(ROUTES.MY_ORDERS, {
              state: {
                focusOrderId: orderId
              }
            })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                  <Receipt className="w-4 h-4" />{t("view_order")}</button> : <Link to={ROUTES.MY_ORDERS} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
                  <Receipt className="w-4 h-4" />{t("my_orders")}</Link>}

              <Link to={ROUTES.MY_ORDERS} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-light px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                <ShoppingBag className="w-4 h-4" />{t("all_orders")}</Link>

              <Link to={ROUTES.LISTINGS} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-light px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">{t("continue_shopping")}</Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>;
};
export default OrderSuccessPage;
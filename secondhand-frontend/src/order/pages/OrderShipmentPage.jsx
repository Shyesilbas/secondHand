import { useTranslation } from "react-i18next";
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Copy, Package } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';
import { ORDER_TIME } from '../constants/orderUiConstants.js';
import { orderService } from '../services/orderService.js';
import { formatDateTime, formatCurrency } from '../../common/formatters.js';
import { ShippingDetailsSection } from '../components/orderDetails/ShippingDetailsSection.jsx';
const Panel = ({
  children,
  className = ''
}) => <div className={`rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${className}`}>
    {children}
  </div>;

/** Uygulama içi sipariş kargo özeti (/profile/orders/... veya /profile/i-sold/... altında kullanılabilir.) */
const OrderShipmentPage = () => {
  const {
    t
  } = useTranslation();
  const {
    orderId
  } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  const isSellerView = location.pathname.includes(`${ROUTES.I_SOLD}/`);
  const scope = isSellerView ? 'seller' : 'buyer';
  const {
    data: order,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ORDER_QUERY_KEYS.orderShipment(scope, orderId),
    queryFn: () => isSellerView ? orderService.getSellerOrderById(orderId) : orderService.getById(orderId),
    enabled: Boolean(orderId),
    staleTime: ORDER_TIME.ORDERS_LIST_STALE_MS
  });
  const backPath = isSellerView ? ROUTES.I_SOLD : ROUTES.MY_ORDERS;
  const title = order?.name || (order?.orderNumber != null ? `Order #${order.orderNumber}` : 'Shipment');
  const copyTracking = () => {
    const n = order?.shipping?.trackingNumber;
    if (!n) return;
    navigator.clipboard.writeText(String(n)).then(() => {
      notification.showSuccess('Copied', 'Tracking number copied to clipboard.');
    }).catch(() => {
      notification.showWarning('Clipboard', 'Unable to copy — select the number manually.');
    });
  };
  const errorMessage = useMemo(() => {
    if (!error) return null;
    const m = error?.response?.data?.message || error?.message;
    return m || 'Could not load this order.';
  }, [error]);
  return <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 space-y-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(backPath)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 py-2">
            <ArrowLeft className="w-4 h-4" />{t("back_to_orders")}</button>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("shipment_tracking")}</h1>
          <p className="text-sm text-slate-500">{title}</p>
          {order?.status ? <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mt-2">{t("order_status")}{order.status}
            </p> : null}
        </div>

        {isLoading ? <Panel className="p-12 flex flex-col items-center justify-center animate-pulse">
            <Package className="w-10 h-10 text-slate-300 mb-3" />
            <span className="text-sm font-medium text-slate-400">{t("loading_shipment")}</span>
          </Panel> : null}

        {errorMessage && !isLoading ? <Panel className="p-6 border-rose-200 bg-rose-50/90">
            <p className="text-sm font-semibold text-rose-800">{errorMessage}</p>
            <button type="button" className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800 underline" onClick={() => refetch()}>{t("try_again")}</button>
          </Panel> : null}

        {order && !isLoading ? <>
            {order.orderItems?.length ? <Panel className="p-5">
                <h2 className="text-lg font-semibold text-text-primary uppercase tracking-widest mb-3">{t("items")}</h2>
                <ul className="space-y-2">
                  {order.orderItems.map(item => <li key={item.id ?? `${item.listing?.id}-${item.quantity}`} className="flex justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-900 line-clamp-2">{item.listing?.title || '—'}</span>
                      <span className="text-slate-600 whitespace-nowrap tabular-nums">{formatCurrency(item.totalPrice, order.currency)}</span>
                    </li>)}
                </ul>
              </Panel> : null}

            {order.shipping ? <ShippingDetailsSection shipping={order.shipping} deliveryAddress={order.shippingAddress} CardComponent={Panel} /> : <Panel className="p-10 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm font-semibold text-slate-900">{t("no_shipment_yet")}</p>
                <p className="text-sm text-slate-500 mt-1">{t("shipping_details_appear_after_the_seller")}</p>
              </Panel>}

            {order.shipping?.trackingNumber ? <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={copyTracking} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  <Copy className="w-3.5 h-3.5" />{t("copy_tracking_number")}</button>
              </div> : null}

            <div className="pt-4 text-center border-t border-slate-100">
              <Link to={backPath} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">{t("view_full_order")}</Link>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-xs text-slate-400">{order.updatedAt ? `Updated ${formatDateTime(order.updatedAt)}` : ''}</span>
            </div>
          </> : null}
      </div>
    </div>;
};
export default OrderShipmentPage;
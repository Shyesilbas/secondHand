import { useTranslation } from "react-i18next";
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Truck, Package, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../common/constants/routes.js';
import { formatDateTime } from '../../../common/formatters.js';

/**
 * internalTracking verildiğinde harici sekme yerine uygulama içi /profile/.../shipment rotasına gider (modal için).
 */
const linesForDeliveryAddress = addr => {
  if (!addr || typeof addr !== 'object') return {
    primary: '',
    secondary: ''
  };
  const primary = String(addr.addressLine || '').trim();
  const secondary = [addr.city, addr.state || addr.region, addr.postalCode || addr.zipCode, addr.country].filter(v => v != null && String(v).trim() !== '').map(v => String(v).trim()).join(', ');
  return {
    primary,
    secondary
  };
};
export const ShippingDetailsSection = React.memo(({
  shipping,
  deliveryAddress,
  CardComponent,
  internalTracking
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goInternalTracking = useCallback(() => {
    const id = internalTracking?.orderId;
    if (!id) return;
    internalTracking?.onBeforeNavigate?.();
    const path = internalTracking.isSellerView ? ROUTES.PROFILE_I_SOLD_SHIPMENT(id) : ROUTES.PROFILE_ORDER_SHIPMENT(id);
    navigate(path);
  }, [internalTracking, navigate]);
  if (!shipping) return null;
  const getStatusColor = status => {
    switch (status) {
      case 'PENDING':
        return 'text-status-warning bg-status-warning-bg border-amber-100';
      case 'IN_TRANSIT':
        return 'text-primary bg-blue-50 border-primary';
      case 'DELIVERED':
        return 'text-status-success bg-status-success-bg border-emerald-100';
      case 'CANCELLED':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'RETURNED':
        return 'text-purple-600 bg-purple-50 border-purple-100';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };
  const useInternalLinks = Boolean(internalTracking?.orderId);
  const canOpenCarrier = Boolean(shipping.trackingUrl && !useInternalLinks);
  const {
    primary: addrLine1,
    secondary: addrLine2
  } = linesForDeliveryAddress(deliveryAddress);
  const hasDeliveryAddress = Boolean(addrLine1 || addrLine2);
  return <CardComponent className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2 uppercase tracking-wider">
          <Truck className="w-4 h-4 text-primary" />{t("shipping_details")}</h3>
        <span className={`text-caption font-bold px-2 py-0.5 rounded-full border ${getStatusColor(shipping.status)}`}>
          {shipping.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <div>
            <p className="text-caption font-semibold text-slate-400 uppercase tracking-widest mb-1">{t("carrier")}</p>
            <p className="text-sm font-bold text-slate-800">
              {shipping.carrierName || 'Not Assigned'}
            </p>
          </div>

          {shipping.trackingNumber && <div>
              <p className="text-caption font-semibold text-slate-400 uppercase tracking-widest mb-1">{t("tracking_number")}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-sm font-mono font-bold text-primary break-all">{shipping.trackingNumber}</p>
                {useInternalLinks ? <button type="button" onClick={goInternalTracking} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-caption font-bold text-white bg-primary hover:bg-indigo-700 shadow-sm shadow-indigo-900/10 transition-colors">{t("track_in_app")}<ArrowRight className="w-3.5 h-3.5" />
                  </button> : null}
                {canOpenCarrier ? <a href={shipping.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-caption font-bold text-primary bg-indigo-50 border border-primary hover:bg-indigo-100 transition-colors">{t("open_carrier_site")}</a> : null}
              </div>
              {useInternalLinks && shipping.trackingUrl ? <p className="text-caption text-slate-400 mt-2">{t("full_tracking_page_also_offers_the_carri")}</p> : null}
            </div>}
        </div>

        <div className="space-y-3">
          {shipping.estimatedDeliveryDate && <div>
              <p className="text-caption font-semibold text-slate-400 uppercase tracking-widest mb-1">{t("estimated_delivery")}</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDateTime(shipping.estimatedDeliveryDate)}
              </div>
            </div>}

          {shipping.deliveredAt && <div>
              <p className="text-caption font-semibold text-slate-400 uppercase tracking-widest mb-1">{t("delivered_at")}</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-status-success">
                <Package className="w-3.5 h-3.5" />
                {formatDateTime(shipping.deliveredAt)}
              </div>
            </div>}

          {!shipping.trackingNumber && shipping.status === 'PENDING' && <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <p className="text-caption text-slate-500 font-medium">{t("waiting_for_seller_to_ship_the_items")}</p>
            </div>}
        </div>
      </div>

      {hasDeliveryAddress ? <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-caption font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />{t("teslimat_adresi")}</p>
          {addrLine1 ? <p className="text-sm font-semibold text-text-primary">{addrLine1}</p> : null}
          {addrLine2 ? <p className={addrLine1 ? 'text-sm text-slate-600 mt-1 leading-snug' : 'text-sm font-semibold text-text-primary leading-snug'}>
              {addrLine2}
            </p> : null}
        </div> : null}
    </CardComponent>;
});
ShippingDetailsSection.displayName = 'ShippingDetailsSection';
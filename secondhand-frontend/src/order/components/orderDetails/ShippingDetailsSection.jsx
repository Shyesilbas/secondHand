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
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'IN_TRANSIT':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'DELIVERED':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'CANCELLED':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'RETURNED':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };
  const useInternalLinks = Boolean(internalTracking?.orderId);
  const canOpenCarrier = Boolean(shipping.trackingUrl && !useInternalLinks);
  const {
    primary: addrLine1,
    secondary: addrLine2
  } = linesForDeliveryAddress(deliveryAddress);
  const hasDeliveryAddress = Boolean(addrLine1 || addrLine2);
  return <CardComponent className="p-6">
    <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
      <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-widest">
        <Truck className="w-4 h-4 text-emerald-600" />{t("shipping_details", "Kargo & Teslimat Bilgileri")}</h3>
      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusColor(shipping.status)}`}>
        {shipping.status}
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-3.5">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("carrier", "Kargo Firması")}</p>
          <p className="text-sm font-extrabold text-slate-900">
            {shipping.carrierName || 'Atanmadı'}
          </p>
        </div>

        {shipping.trackingNumber && <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("tracking_number", "Takip Numarası")}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-sm font-mono font-extrabold text-emerald-700 break-all bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">{shipping.trackingNumber}</p>
            {useInternalLinks ? <button type="button" onClick={goInternalTracking} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors">{t("track_in_app", "Uygulamada Takip Et")}<ArrowRight className="w-3.5 h-3.5" />
            </button> : null}
            {canOpenCarrier ? <a href={shipping.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 transition-colors">{t("open_carrier_site", "Kargo Sitesi")}</a> : null}
          </div>
          {useInternalLinks && shipping.trackingUrl ? <p className="text-[11px] text-slate-400 mt-2 font-medium">{t("full_tracking_page_also_offers_the_carri", "Detaylı takip sayfasında kargo firması sitesi de açılabilir.")}</p> : null}
        </div>}
      </div>

      <div className="space-y-3.5">
        {shipping.estimatedDeliveryDate && <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("estimated_delivery", "Tahmini Teslimat")}</p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatDateTime(shipping.estimatedDeliveryDate)}
          </div>
        </div>}

        {shipping.deliveredAt && <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t("delivered_at", "Teslim Tarihi")}</p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <Package className="w-3.5 h-3.5" />
            {formatDateTime(shipping.deliveredAt)}
          </div>
        </div>}

        {!shipping.trackingNumber && shipping.status === 'PENDING' && <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <p className="text-xs text-slate-600 font-medium">{t("waiting_for_seller_to_ship_the_items", "Satıcının ürünü kargoya vermesi bekleniyor.")}</p>
        </div>}
      </div>
    </div>

    {hasDeliveryAddress ? <div className="mt-5 pt-4 border-t border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{t("teslimat_adresi", "Teslimat Adresi")}</p>
      {addrLine1 ? <p className="text-xs font-bold text-slate-900">{addrLine1}</p> : null}
      {addrLine2 ? <p className={addrLine1 ? 'text-xs text-slate-600 mt-0.5 leading-snug font-medium' : 'text-xs font-bold text-slate-900 leading-snug'}>
        {addrLine2}
      </p> : null}
    </div> : null}
  </CardComponent>;
});
ShippingDetailsSection.displayName = 'ShippingDetailsSection';
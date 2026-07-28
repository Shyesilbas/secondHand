import { useTranslation } from "react-i18next";
import React from 'react';
import { Clock, Truck, Package, Calendar, MapPin } from 'lucide-react';
import { formatDateTime } from '../../../common/formatters.js';

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
  CardComponent
}) => {
  const { t } = useTranslation();
  if (!shipping) return null;

  const getStatusColor = status => {
    switch (status) {
      case 'PENDING':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'IN_TRANSIT':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'DELIVERED':
        return 'text-emerald-800 bg-emerald-100 border-emerald-200';
      case 'CANCELLED':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'RETURNED':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const {
    primary: addrLine1,
    secondary: addrLine2
  } = linesForDeliveryAddress(deliveryAddress);
  const hasDeliveryAddress = Boolean(addrLine1 || addrLine2);

  return (
    <CardComponent className="p-5">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          {t("shipping_details", "Kargo Detayları")}
        </h3>
        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusColor(shipping.status)}`}>
          {shipping.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">{t("carrier", "Kargo Firması")}</p>
            <p className="text-xs font-black text-slate-900">
              {shipping.carrierName || 'Atanmadı'}
            </p>
          </div>

          {shipping.trackingNumber && (
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">{t("tracking_number", "Takip Numarası")}</p>
              <p className="text-xs font-mono font-black text-slate-900 break-all">{shipping.trackingNumber}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {shipping.estimatedDeliveryDate && (
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">{t("estimated_delivery", "Tahmini Teslimat")}</p>
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {formatDateTime(shipping.estimatedDeliveryDate)}
              </div>
            </div>
          )}

          {shipping.deliveredAt && (
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">{t("delivered_at", "Teslim Tarihi")}</p>
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                <Package className="w-3.5 h-3.5" />
                {formatDateTime(shipping.deliveredAt)}
              </div>
            </div>
          )}

          {!shipping.trackingNumber && shipping.status === 'PENDING' && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <p className="text-xs text-slate-600 font-medium">{t("waiting_for_seller_to_ship_the_items", "Satıcının kargoya vermesi bekleniyor.")}</p>
            </div>
          )}
        </div>
      </div>

      {hasDeliveryAddress ? (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {t("teslimat_adresi", "Teslimat Adresi")}
          </p>
          {addrLine1 ? <p className="text-xs font-bold text-slate-900">{addrLine1}</p> : null}
          {addrLine2 ? <p className={addrLine1 ? 'text-xs text-slate-500 mt-0.5 font-medium' : 'text-xs font-bold text-slate-900'}>{addrLine2}</p> : null}
        </div>
      ) : null}
    </CardComponent>
  );
});

ShippingDetailsSection.displayName = 'ShippingDetailsSection';
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
 return 'text-status-warning-text bg-background-secondary border-border';
 case 'IN_TRANSIT':
 return 'text-text-primary bg-background-secondary border-border';
 case 'DELIVERED':
 return 'text-text-primary bg-background-tertiary border-card-border-hover';
 case 'CANCELLED':
 return 'text-status-error-text bg-background-secondary border-border';
 case 'RETURNED':
 return 'text-text-primary bg-background-secondary border-border';
 default:
 return 'text-text-secondary bg-background-secondary border-border';
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
 <div className="flex items-center justify-between mb-5 border-b border-border-light pb-3">
 <h3 className="text-xs font-semibold text-text-primary flex items-center gap-2">
 <Truck className="w-4 h-4 text-text-primary" />{t("shipping_details", "Kargo & Teslimat Bilgileri")}</h3>
 <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-sm border ${getStatusColor(shipping.status)}`}>
 {shipping.status}
 </span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="space-y-3.5">
 <div>
 <p className="text-xs font-semibold text-text-muted mb-1">{t("carrier", "Kargo Firması")}</p>
 <p className="text-sm font-semibold text-text-primary">
 {shipping.carrierName || 'Atanmadı'}
 </p>
 </div>

 {shipping.trackingNumber && <div>
 <p className="text-xs font-semibold text-text-muted mb-1">{t("tracking_number", "Takip Numarası")}</p>
 <div className="flex flex-col sm:flex-row sm:items-center gap-2">
 <p className="text-sm font-semibold text-text-primary break-all bg-background-tertiary px-2 py-0.5 rounded-md border border-card-border-hover/60">{shipping.trackingNumber}</p>
 {useInternalLinks ? <button type="button" onClick={goInternalTracking} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3">{t("track_in_app", "Uygulamada Takip Et")}<ArrowRight className="w-3.5 h-3.5" />
 </button> : null}
 {canOpenCarrier ? <a href={shipping.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-text-primary bg-background-tertiary border border-card-border-hover hover:bg-secondary-200/70 transition-colors">{t("open_carrier_site", "Kargo Sitesi")}</a> : null}
 </div>
 {useInternalLinks && shipping.trackingUrl ? <p className="text-xs text-text-muted mt-2 font-medium">{t("full_tracking_page_also_offers_the_carri", "Detaylı takip sayfasında kargo firması sitesi de açılabilir.")}</p> : null}
 </div>}
 </div>

 <div className="space-y-3.5">
 {shipping.estimatedDeliveryDate && <div>
 <p className="text-xs font-semibold text-text-muted mb-1">{t("estimated_delivery", "Tahmini Teslimat")}</p>
 <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
 <Calendar className="w-3.5 h-3.5 text-text-muted" />
 {formatDateTime(shipping.estimatedDeliveryDate)}
 </div>
 </div>}

 {shipping.deliveredAt && <div>
 <p className="text-xs font-semibold text-text-muted mb-1">{t("delivered_at", "Teslim Tarihi")}</p>
 <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
 <Package className="w-3.5 h-3.5" />
 {formatDateTime(shipping.deliveredAt)}
 </div>
 </div>}

 {!shipping.trackingNumber && shipping.status === 'PENDING' && <div className="flex items-center gap-2 p-3 bg-background-secondary rounded-md border border-border/80">
 <Clock className="w-4 h-4 text-text-muted shrink-0" />
 <p className="text-xs text-text-secondary font-medium">{t("waiting_for_seller_to_ship_the_items", "Satıcının ürünü kargoya vermesi bekleniyor.")}</p>
 </div>}
 </div>
 </div>

 {hasDeliveryAddress ? <div className="mt-5 pt-4 border-t border-border-light">
 <p className="text-xs font-semibold text-text-muted mb-1.5 flex items-center gap-1.5">
 <MapPin className="w-3.5 h-3.5 text-text-primary shrink-0" />{t("teslimat_adresi", "Teslimat Adresi")}</p>
 {addrLine1 ? <p className="text-xs font-semibold text-text-primary">{addrLine1}</p> : null}
 {addrLine2 ? <p className={addrLine1 ? 'text-xs text-text-secondary mt-0.5 leading-snug font-medium' : 'text-xs font-semibold text-text-primary leading-snug'}>
 {addrLine2}
 </p> : null}
 </div> : null}
 </CardComponent>;
});
ShippingDetailsSection.displayName = 'ShippingDetailsSection';
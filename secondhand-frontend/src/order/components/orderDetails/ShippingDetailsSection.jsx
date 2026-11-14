import { useTranslation } from "react-i18next";
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Truck, Package, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../common/constants/routes.js';
import { formatDateTime, resolveEnumLabel } from '../../../common/formatters.js';
import { useEnums } from '../../../common/hooks/useEnums.js';

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

const getShippingStatusPresentation = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DELIVERED') {
        return {
            badge: 'bg-status-success-bg text-status-success-text border-status-success-border',
            dot: 'bg-status-success'
        };
    }
    if (['IN_TRANSIT', 'PENDING'].includes(s)) {
        return {
            badge: 'bg-status-warning-bg text-status-warning-text border-status-warning-border',
            dot: 'bg-status-warning'
        };
    }
    if (['CANCELLED', 'RETURNED'].includes(s)) {
        return {
            badge: 'bg-status-error-bg text-status-error-text border-status-error-border',
            dot: 'bg-status-error'
        };
    }
    return {
        badge: 'bg-background-secondary text-text-secondary border-border',
        dot: 'bg-text-muted'
    };
};

export const ShippingDetailsSection = React.memo(({
    shipping,
    deliveryAddress,
    CardComponent,
    internalTracking
}) => {
    const { t } = useTranslation();
    const { enums } = useEnums();
    const navigate = useNavigate();

    const goInternalTracking = useCallback(() => {
        const id = internalTracking?.orderId;
        if (!id) return;
        internalTracking?.onBeforeNavigate?.();
        const path = internalTracking.isSellerView ? ROUTES.PROFILE_I_SOLD_SHIPMENT(id) : ROUTES.PROFILE_ORDER_SHIPMENT(id);
        navigate(path);
    }, [internalTracking, navigate]);

    if (!shipping) return null;

    const shippingPresentation = getShippingStatusPresentation(shipping.status);
    const shippingLabel = resolveEnumLabel(enums, 'shippingStatuses', shipping.status) || shipping.status;
    const useInternalLinks = Boolean(internalTracking?.orderId);
    const canOpenCarrier = Boolean(shipping.trackingUrl && !useInternalLinks);
    const {
        primary: addrLine1,
        secondary: addrLine2
    } = linesForDeliveryAddress(deliveryAddress);
    const hasDeliveryAddress = Boolean(addrLine1 || addrLine2);

    return (
        <CardComponent className="p-5">
            <div className="mb-5 flex items-center justify-between border-b border-border-light pb-3">
                <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
                    <Truck className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                    {t("shipping_details", "Kargo & Teslimat Bilgileri")}
                </h3>
                <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.5 text-xs font-medium ${shippingPresentation.badge}`}>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${shippingPresentation.dot}`} aria-hidden />
                    <span>{shippingLabel}</span>
                </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-3.5">
                    <div>
                        <p className="mb-1 text-xs text-text-tertiary">{t("carrier", "Kargo Firması")}</p>
                        <p className="text-sm font-medium text-text-primary">
                            {shipping.carrierName || t('not_assigned', 'Atanmadı')}
                        </p>
                    </div>

                    {shipping.trackingNumber && (
                        <div>
                            <p className="mb-1 text-xs text-text-tertiary">{t("tracking_number", "Takip Numarası")}</p>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <span className="break-all rounded-sm border border-border bg-background-secondary px-2 py-0.5 font-mono text-xs tabular-nums text-text-primary">
                                    {shipping.trackingNumber}
                                </span>
                                {useInternalLinks ? (
                                    <button
                                        type="button"
                                        onClick={goInternalTracking}
                                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded bg-primary px-3 text-xs font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                                    >
                                        {t("track_in_app", "Uygulamada Takip Et")}
                                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                                    </button>
                                ) : null}
                                {canOpenCarrier ? (
                                    <a
                                        href={shipping.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded border border-border bg-background-secondary px-3 text-xs font-medium text-text-primary transition-colors hover:bg-background-tertiary"
                                    >
                                        {t("open_carrier_site", "Kargo Sitesi")}
                                    </a>
                                ) : null}
                            </div>
                            {useInternalLinks && shipping.trackingUrl ? (
                                <p className="mt-2 text-xs text-text-tertiary">
                                    {t("full_tracking_page_also_offers_the_carri", "Detaylı takip sayfasında kargo firması sitesi de açılabilir.")}
                                </p>
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="space-y-3.5">
                    {shipping.estimatedDeliveryDate && (
                        <div>
                            <p className="mb-1 text-xs text-text-tertiary">{t("estimated_delivery", "Tahmini Teslimat")}</p>
                            <div className="flex items-center gap-1.5 text-xs tabular-nums text-text-primary">
                                <Calendar className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                                {formatDateTime(shipping.estimatedDeliveryDate)}
                            </div>
                        </div>
                    )}

                    {shipping.deliveredAt && (
                        <div>
                            <p className="mb-1 text-xs text-text-tertiary">{t("delivered_at", "Teslim Tarihi")}</p>
                            <div className="flex items-center gap-1.5 text-xs tabular-nums text-text-primary">
                                <Package className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                                {formatDateTime(shipping.deliveredAt)}
                            </div>
                        </div>
                    )}

                    {!shipping.trackingNumber && shipping.status === 'PENDING' && (
                        <div className="flex items-center gap-2 rounded-sm border border-border bg-background-secondary p-3">
                            <Clock className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                            <p className="text-xs text-text-secondary">
                                {internalTracking?.isSellerView
                                    ? t("waiting_for_you_to_ship_the_items", "Ürünleri kargoya vermeniz bekleniyor.")
                                    : t("waiting_for_seller_to_ship_the_items", "Satıcının ürünü kargoya vermesi bekleniyor.")}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {hasDeliveryAddress ? (
                <div className="mt-5 border-t border-border-light pt-4">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs text-text-tertiary">
                        <MapPin className="h-3.5 w-3.5 text-text-tertiary shrink-0" strokeWidth={1.5} aria-hidden />
                        {t("teslimat_adresi", "Teslimat Adresi")}
                    </p>
                    {addrLine1 ? <p className="text-xs font-medium text-text-primary">{addrLine1}</p> : null}
                    {addrLine2 ? (
                        <p className={addrLine1 ? 'mt-0.5 text-xs leading-snug text-text-secondary' : 'text-xs font-medium leading-snug text-text-primary'}>
                            {addrLine2}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </CardComponent>
    );
});
ShippingDetailsSection.displayName = 'ShippingDetailsSection';
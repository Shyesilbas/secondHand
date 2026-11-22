import { useTranslation } from "react-i18next";
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Package } from 'lucide-react';
import { ROUTES } from '../../../common/constants/routes.js';
import Badge from '../../../common/components/ui/Badge.jsx';
import Button, { buttonClasses } from '../../../common/components/ui/Button.jsx';
import { formatDateTime } from '../../../common/formatters.js';
import { useEnums } from '../../../common/hooks/useEnums.js';
import { getShippingStatusLabel } from '../../utils/statusPresentation.js';

/**
 * internalTracking verildiğinde harici sekme yerine uygulama içi /profile/.../shipment rotasına gider (modal için).
 */
const linesForDeliveryAddress = (addr) => {
  if (!addr || typeof addr !== 'object') {
    return { primary: '', secondary: '' };
  }
  const primary = String(addr.addressLine || '').trim();
  const secondary = [addr.city, addr.state || addr.region, addr.postalCode || addr.zipCode, addr.country]
    .filter((v) => v != null && String(v).trim() !== '')
    .map((v) => String(v).trim())
    .join(', ');
  return { primary, secondary };
};

const getShippingStatusVariant = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'DELIVERED') return 'success';
  if (['IN_TRANSIT', 'PENDING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(s)) return 'warning';
  if (['CANCELLED', 'RETURNED'].includes(s)) return 'error';
  return 'neutral';
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
    const path = internalTracking.isSellerView
      ? ROUTES.PROFILE_I_SOLD_SHIPMENT(id)
      : ROUTES.PROFILE_ORDER_SHIPMENT(id);
    navigate(path);
  }, [internalTracking, navigate]);

  if (!shipping) return null;

  const shippingVariant = getShippingStatusVariant(shipping.status);
  const shippingLabel = getShippingStatusLabel(t, enums, shipping.status);
  const useInternalLinks = Boolean(internalTracking?.orderId);
  const canOpenCarrier = Boolean(shipping.trackingUrl && !useInternalLinks);
  const { primary: addrLine1, secondary: addrLine2 } = linesForDeliveryAddress(deliveryAddress);
  const hasDeliveryAddress = Boolean(addrLine1 || addrLine2);

  return (
    <CardComponent>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary">
          {t('shipping_details', 'Kargo detayları')}
        </h3>
        <Badge variant={shippingVariant} dot>
          {shippingLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-text-tertiary">{t('carrier', 'Kargo firması')}</p>
            <p className="mt-0.5 text-sm font-medium text-text-primary">
              {shipping.carrierName || t('not_assigned', 'Atanmadı')}
            </p>
          </div>

          {shipping.trackingNumber && (
            <div>
              <p className="text-sm text-text-tertiary">{t('tracking_number', 'Takip numarası')}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="break-all rounded-sm bg-background-secondary px-2 py-1 font-mono text-xs tabular-nums text-text-primary">
                  {shipping.trackingNumber}
                </span>
                {useInternalLinks ? (
                  <Button size="sm" onClick={goInternalTracking}>
                    {t('track_in_app', 'Uygulamada takip et')}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  </Button>
                ) : null}
                {canOpenCarrier ? (
                  <a
                    href={shipping.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses('secondary', 'sm')}
                  >
                    {t('open_carrier_site', 'Kargo sitesi')}
                  </a>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {shipping.estimatedDeliveryDate && (
            <div>
              <p className="text-sm text-text-tertiary">{t('estimated_delivery', 'Tahmini teslimat')}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm tabular-nums text-text-primary">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                <span>{formatDateTime(shipping.estimatedDeliveryDate)}</span>
              </p>
            </div>
          )}

          {shipping.deliveredAt && (
            <div>
              <p className="text-sm text-text-tertiary">{t('delivered_at', 'Teslim tarihi')}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm tabular-nums text-text-primary">
                <Package className="h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                <span>{formatDateTime(shipping.deliveredAt)}</span>
              </p>
            </div>
          )}

          {!shipping.trackingNumber && shipping.status === 'PENDING' && (
            <div className="flex items-start gap-2.5 rounded bg-background-secondary p-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <p className="text-sm text-text-secondary">
                {internalTracking?.isSellerView
                  ? t('waiting_for_you_to_ship_the_items', 'Ürünleri kargoya vermeniz bekleniyor.')
                  : t('waiting_for_seller_to_ship_the_items', 'Satıcının ürünü kargoya vermesi bekleniyor.')}
              </p>
            </div>
          )}
        </div>
      </div>

      {hasDeliveryAddress ? (
        <div className="mt-4 border-t border-border-light pt-4">
          <p className="text-sm text-text-tertiary">{t('teslimat_adresi', 'Teslimat adresi')}</p>
          {addrLine1 ? <p className="mt-1 text-sm font-medium text-text-primary">{addrLine1}</p> : null}
          {addrLine2 ? (
            <p className={addrLine1 ? 'mt-0.5 text-sm text-text-secondary' : 'mt-1 text-sm font-medium text-text-primary'}>
              {addrLine2}
            </p>
          ) : null}
        </div>
      ) : null}
    </CardComponent>
  );
});
ShippingDetailsSection.displayName = 'ShippingDetailsSection';

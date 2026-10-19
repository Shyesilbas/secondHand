import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import { CheckCircle2, Package, Copy, Check, MapPin, Truck, ShieldCheck } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';

const DetailRow = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-sm text-text-secondary">{label}</dt>
    <dd className="mt-0.5 text-sm font-medium text-text-primary">{children}</dd>
  </div>
);

// Order confirmation, rendered as a page. Values the API did not give us are left out, never invented.
const OrderSuccessModal = ({
  order,
  orderNumber,
  orderDate,
  totalAmount,
  currency = 'TRY',
  shippingAddress,
  deliveryMethod,
  meetupLocation,
  orderItems = [],
  itemsLoading = false
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const isMeetup = deliveryMethod === 'SAFE_MEETUP';
  const isCargo = deliveryMethod === 'CARGO';
  const orderId = order?.id || order?.orderId || null;

  const handleCopyOrderNumber = async () => {
    if (!orderNumber) return;
    try {
      await navigator.clipboard.writeText(String(orderNumber));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the number stays visible to copy by hand.
    }
  };

  const heading = isMeetup
    ? t('order_success_meetup_title', 'Buluşma siparişiniz onaylandı')
    : isCargo
      ? t('order_success_cargo_title', 'Siparişiniz hazırlanıyor')
      : t('order_success_generic_title', 'Siparişiniz alındı');
  const description = isMeetup
    ? t('order_success_meetup_body', 'Ödemeniz güvenli escrow havuzunda güvence altına alındı. Satıcı ile belirlenen noktada görüşebilirsiniz.')
    : t('order_success_cargo_body', 'Ödemeniz alındı ve güvenli havuza aktarıldı. Satıcı ürününüzü kargoya vermek üzere hazırlıyor.');

  return (
    <div className="w-full overflow-hidden rounded border border-border bg-background-primary">
      <div className="border-b border-border-light p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto mb-4 block h-5 w-5 text-status-success" strokeWidth={1.5} aria-hidden />
        <h1 className="text-2xl font-semibold text-text-primary">{heading}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">{description}</p>

        {orderNumber && (
          <div className="mt-5 inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm">
            <span className="text-text-secondary">{t('order_success_number', 'Sipariş no')}</span>
            <span className="tabular-nums text-text-primary">#{orderNumber}</span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="-m-1 rounded p-2 text-text-tertiary transition-colors hover:text-text-primary"
              aria-label={t('order_success_copy_number', 'Sipariş numarasını kopyala')}
            >
              {copied ? <Check className="h-4 w-4" strokeWidth={1.5} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {orderDate && (
            <DetailRow label={t('order_success_date', 'Sipariş tarihi')}>
              <span className="tabular-nums">{formatDateTime(orderDate)}</span>
            </DetailRow>
          )}
          <DetailRow label={t('order_success_payment', 'Ödeme durumu')}>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />
              {t('order_success_escrow', 'Escrow korumalı')}
            </span>
          </DetailRow>
          {totalAmount != null && (
            <DetailRow label={t('order_success_amount', 'Tahsil edilen tutar')}>
              <span className="font-semibold tabular-nums">{formatCurrency(totalAmount, currency)}</span>
            </DetailRow>
          )}
        </dl>

        {(isMeetup || isCargo) && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
              {isMeetup
                ? <MapPin className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />
                : <Truck className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />}
              {isMeetup ? t('order_success_meetup_heading', 'Buluşma ve doğrulama kodu') : t('order_success_cargo_heading', 'Teslimat bilgileri')}
            </h2>

            {isMeetup ? (
              <div className="space-y-3 text-sm text-text-secondary">
                {meetupLocation && (
                  <p>
                    <span>{t('order_success_meetup_point', 'Buluşma noktası')}: </span>
                    <span className="font-medium text-text-primary">{meetupLocation}</span>
                  </p>
                )}
                <p>{t('order_success_meetup_pin', 'Satıcı ile buluştuğunuzda ürünü inceleyin. Ürünü sağlam ve tarif edildiği gibi teslim aldıysanız, "Siparişlerim" sayfasındaki 6 haneli doğrulama kodunu satıcıya ileterek satışı onaylayın.')}</p>
                <p className="text-text-tertiary">{t('order_success_meetup_deadline', 'Buluşmayı tamamlamak için 4 iş gününüz var.')}</p>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {shippingAddress ? (
                  <div className="border-l-2 border-border pl-4">
                    <p className="font-medium text-text-primary">{shippingAddress.title || t('order_success_address', 'Teslimat adresi')}</p>
                    <p className="mt-0.5 text-text-secondary">{shippingAddress.addressLine}</p>
                    <p className="text-text-tertiary">
                      {shippingAddress.city}{shippingAddress.state ? ` / ${shippingAddress.state}` : ''} {shippingAddress.postalCode}
                    </p>
                  </div>
                ) : (
                  <p className="text-text-tertiary">{t('order_success_saved_address', 'Kayıtlı teslimat adresinize gönderilecektir.')}</p>
                )}
                <p className="text-text-tertiary">
                  {t('order_success_tracking_note', 'Satıcı ürünü kargoya verdiğinde takip numarası sisteme işlenecek ve size SMS/e-posta ile bildirim gönderilecektir.')}
                </p>
              </div>
            )}
          </section>
        )}

        {itemsLoading && (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {Array.isArray(orderItems) && orderItems.length > 0 && (
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-text-primary">{t('order_success_items', 'Sipariş edilen ürünler')}</h2>
              <span className="text-sm tabular-nums text-text-tertiary">
                {t('order_success_items_count', { defaultValue: '{{count}} ürün', count: orderItems.length })}
              </span>
            </div>

            <ul className="divide-y divide-border-light">
              {orderItems.map((item, idx) => {
                const title = item?.listing?.title || t('order_success_item_fallback', 'Ürün');
                const image = item?.listing?.imageUrl || null;
                const itemCurrency = item?.currency || currency;

                return (
                  <li key={item?.id ?? idx} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-secondary">
                        {image ? (
                          <img src={image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{title}</p>
                        {item?.quantity != null && item?.unitPrice != null && (
                          <p className="text-sm tabular-nums text-text-tertiary">
                            {item.quantity} × {formatCurrency(item.unitPrice, itemCurrency)}
                          </p>
                        )}
                      </div>
                    </div>

                    {item?.totalPrice != null && (
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-text-primary">
                        {formatCurrency(item.totalPrice, itemCurrency)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link to={ROUTES.LISTINGS} className={buttonClasses('secondary')}>
            {t('order_success_continue', 'Alışverişe dön')}
          </Link>
          <Link
            to={orderId ? `${ROUTES.MY_ORDERS}?orderId=${orderId}` : ROUTES.MY_ORDERS}
            className={buttonClasses('primary')}
          >
            {orderId ? t('order_success_view_order', 'Siparişi incele') : t('order_success_my_orders', 'Siparişlerim')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;

import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { CheckCircle2, Package, Receipt, ShoppingBag, Copy, Check, MapPin, Truck, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';

const OrderSuccessModal = ({
  order,
  orderNumber,
  orderDate,
  totalAmount,
  currency = 'TRY',
  shippingAddress,
  deliveryMethod = 'CARGO',
  meetupLocation,
  orderItems = [],
  itemsLoading = false,
  onClose,
  isModal = false
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyOrderNumber = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(String(orderNumber));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const orderId = order?.id || order?.orderId || null;

  return (
    <div className={`overflow-hidden rounded border border-border bg-background-primary ${
      isModal ? 'max-w-2xl w-full mx-auto relative' : 'w-full'
    }`}>
      <div className="relative border-b border-border-light p-6 text-center sm:p-8">
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded p-2 text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary"
            aria-label={t("close", "Kapat")}
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}

        <CheckCircle2 className="mx-auto mb-4 block h-5 w-5 text-status-success" strokeWidth={1.5} aria-hidden />
        <p className="text-sm text-text-secondary">
          {deliveryMethod === 'SAFE_MEETUP' ? 'Elden teslimat başlatıldı' : 'Siparişiniz alındı'}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary">
          {deliveryMethod === 'SAFE_MEETUP' ? 'Buluşma siparişiniz onaylandı' : 'Siparişiniz hazırlanıyor'}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          {deliveryMethod === 'SAFE_MEETUP'
            ? 'Ödemeniz güvenli Escrow havuzunda güvence altına alındı. Satıcı ile belirlenen noktada görüşebilirsiniz.'
            : 'Ödemeniz alındı ve güvenli havuza aktarıldı. Satıcı ürününüzü kargoya vermek üzere hazırlıyor.'}
        </p>

        {orderNumber && (
          <div className="mt-5 inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm">
            <span className="text-text-secondary">Sipariş No:</span>
            <span className="font-mono tabular-nums text-text-primary">#{orderNumber}</span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="rounded p-1 text-text-tertiary transition-colors hover:text-text-primary"
              aria-label="Sipariş numarasını kopyala"
            >
              {copied ? <Check className="h-4 w-4" strokeWidth={1.5} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
        )}
      </div>

      {/* ── Details Bento Grid ──────────────────────────────────── */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-md border border-border/80 bg-background-secondary/70 p-4">
            <span className="text-xs font-semibold text-text-muted block mb-1">
              Sipariş Tarihi
            </span>
            <span className="text-xs font-semibold text-text-primary">
              {formatDateTime(orderDate || new Date().toISOString())}
            </span>
          </div>

          <div className="rounded-md border border-border/80 bg-background-secondary/70 p-4">
            <span className="text-xs font-semibold text-text-muted block mb-1">
              Ödeme Durumu
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-success-text">
              <ShieldCheck className="h-3.5 w-3.5 text-status-success-text" />
              Escrow Korumalı
            </span>
          </div>

          <div className="rounded-md border border-border/80 bg-background-secondary/70 p-4">
            <span className="text-xs font-semibold text-text-muted block mb-1">
              Tahsil Edilen Tutar
            </span>
            <span className="text-sm font-semibold text-text-primary">
              {formatCurrency(totalAmount, currency)}
            </span>
          </div>
        </div>

        {/* ── Delivery Info Box ──────────────────────────────────── */}
        <div className="rounded-md border border-border/90 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            {deliveryMethod === 'SAFE_MEETUP' ? (
              <MapPin className="h-4 w-4 text-status-warning-text" />
            ) : (
              <Truck className="h-4 w-4 text-text-primary" />
            )}
            <h4 className="text-xs font-semibold text-text-primary">
              {deliveryMethod === 'SAFE_MEETUP' ? 'Elden Buluşma & Güvenli PIN Kılavuzu' : 'Kargo & Teslimat Bilgileri'}
            </h4>
          </div>

          {deliveryMethod === 'SAFE_MEETUP' ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-background-secondary border border-border/80 px-4 py-2.5 rounded">
                <span className="text-status-warning-text font-semibold">Buluşma Noktası:</span>
                <span className="font-semibold text-text-primary">{meetupLocation || 'Belirtilen ortak nokta'}</span>
              </div>

              <div className="rounded border border-border/80 bg-background-secondary/80 p-4 text-text-secondary leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                  <ShieldCheck className="h-4 w-4 text-text-primary" />
                  <span>6 Haneli Teslimat PIN Kodu Hatırlatması</span>
                </div>
                <p>
                  Satıcı ile buluştuğunuzda ürünü detaylıca inceleyiniz. Ürünü sağlam ve tarif edildiği gibi teslim aldıktan sonra, 
                  <strong> "Siparişlerim"</strong> sayfanızda yer alan <strong>6 haneli doğrulama PIN kodunu</strong> satıcıya ileterek satışı onaylayabilirsiniz.
                </p>
                <p className="text-xs text-text-tertiary font-semibold">
                  ⏳ Buluşmayı tamamlamak için <strong>4 iş günü</strong> süreniz bulunmaktadır.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs space-y-2">
              {shippingAddress ? (
                <div className="rounded bg-background-secondary border border-border/80 p-3.5">
                  <p className="font-semibold text-text-primary">{shippingAddress.title || 'Teslimat Adresi'}</p>
                  <p className="text-text-secondary font-medium mt-0.5">{shippingAddress.addressLine}</p>
                  <p className="text-text-tertiary font-medium">
                    {shippingAddress.city}{shippingAddress.state ? ` / ${shippingAddress.state}` : ''} {shippingAddress.postalCode}
                  </p>
                </div>
              ) : (
                <p className="text-text-tertiary font-medium">Kayıtlı teslimat adresinize gönderilecektir.</p>
              )}
              <p className="text-xs text-text-tertiary font-medium leading-relaxed">
                Satıcı ürünü kargoya verdiğinde takip numarası sisteme işlenecek ve size SMS/e-posta ile bildirim gönderilecektir.
              </p>
            </div>
          )}
        </div>

        {/* ── Order Items List ───────────────────────────────────── */}
        {itemsLoading && (
          <div className="space-y-2 rounded border border-border bg-background-primary p-5" aria-busy="true">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        {Array.isArray(orderItems) && orderItems.length > 0 && (
          <div className="rounded-md border border-border/80 bg-background-secondary/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text-tertiary">
                Sipariş Edilen Ürünler
              </span>
              <span className="text-xs font-semibold text-text-secondary bg-white px-2 py-0.5 rounded-md border border-border">
                {orderItems.length} Ürün
              </span>
            </div>

            <div className="divide-y divide-border-light max-h-48 overflow-y-auto">
              {orderItems.map((item, idx) => {
                const title = item?.listing?.title || item?.listingTitle || item?.title || 'Ürün';
                const image = item?.listing?.imageUrl || item?.imageUrl || null;
                const price = item?.price || item?.listing?.price || 0;

                return (
                  <div key={item?.id ?? idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded border border-border bg-white flex items-center justify-center overflow-hidden">
                        {image ? (
                          <img src={image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-text-muted" />
                        )}
                      </div>
                      <span className="font-semibold text-text-primary truncate max-w-xs">{title}</span>
                    </div>

                    <span className="font-semibold text-text-primary shrink-0">
                      {formatCurrency(price, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Action Buttons ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {orderId ? (
            <button 
              type="button" 
              onClick={() => navigate(ROUTES.MY_ORDERS, { state: { focusOrderId: orderId } })} 
              className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4"
            >
              <Receipt className="h-4 w-4" />
              <span>Siparişi İncele</span>
            </button>
          ) : (
            <button 
              type="button" 
              onClick={() => navigate(ROUTES.MY_ORDERS)} 
              className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4"
            >
              <Receipt className="h-4 w-4" />
              <span>Siparişlerim</span>
            </button>
          )}

          <button 
            type="button" 
            onClick={() => navigate(ROUTES.MY_ORDERS)} 
            className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Tüm Siparişler</span>
          </button>

          <button 
            type="button" 
            onClick={() => navigate(ROUTES.LISTINGS)} 
            className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4"
          >
            <span>Alışverişe Dön</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;

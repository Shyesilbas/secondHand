import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Package, 
  Receipt, 
  ShoppingBag, 
  Copy, 
  Check, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
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
    <div className={`overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl transition-all ${
      isModal ? 'max-w-2xl w-full mx-auto relative' : 'w-full'
    }`}>
      {/* ── Top Festive Hero Section ────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-8 text-center text-white sm:p-10">
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
            aria-label={t("close", "Kapat")}
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />

        {/* Animated Checkmark Circle */}
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 backdrop-blur-md shadow-lg shadow-emerald-500/10 ring-8 ring-emerald-500/10">
          <CheckCircle2 className="h-10 w-10" strokeWidth={2.2} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/15 backdrop-blur-md mb-3">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>{deliveryMethod === 'SAFE_MEETUP' ? 'Elden Teslimat Başlatıldı' : 'Siparişiniz Başarıyla Alındı'}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          {deliveryMethod === 'SAFE_MEETUP' 
            ? 'Buluşma Siparişiniz Onaylandı!' 
            : 'Tebrikler! Siparişiniz Hazırlanıyor 🎉'}
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
          {deliveryMethod === 'SAFE_MEETUP'
            ? 'Ödemeniz güvenli Escrow havuzunda güvence altına alındı. Satıcı ile belirlenen noktada görüşebilirsiniz.'
            : 'Ödemeniz alındı ve güvenli havuza aktarıldı. Satıcı ürününüzü kargoya vermek üzere hazırlıyor.'}
        </p>

        {/* Order Number pill with Copy button */}
        {orderNumber && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-4 py-2 backdrop-blur-md">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sipariş No:</span>
            <span className="font-mono text-sm font-black text-white">#{orderNumber}</span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="ml-1 p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Sipariş numarasını kopyala"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* ── Details Bento Grid ──────────────────────────────────── */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Sipariş Tarihi
            </span>
            <span className="text-xs font-bold text-slate-800">
              {formatDateTime(orderDate || new Date().toISOString())}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Ödeme Durumu
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Escrow Korumalı
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Tahsil Edilen Tutar
            </span>
            <span className="text-sm font-black text-slate-900">
              {formatCurrency(totalAmount, currency)}
            </span>
          </div>
        </div>

        {/* ── Delivery Info Box ──────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            {deliveryMethod === 'SAFE_MEETUP' ? (
              <MapPin className="h-4 w-4 text-amber-600" />
            ) : (
              <Truck className="h-4 w-4 text-slate-900" />
            )}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {deliveryMethod === 'SAFE_MEETUP' ? 'Elden Buluşma & Güvenli PIN Kılavuzu' : 'Kargo & Teslimat Bilgileri'}
            </h4>
          </div>

          {deliveryMethod === 'SAFE_MEETUP' ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200/80 px-4 py-2.5 rounded-xl">
                <span className="text-amber-900 font-semibold">Buluşma Noktası:</span>
                <span className="font-bold text-slate-900">{meetupLocation || 'Belirtilen ortak nokta'}</span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-slate-600 leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-slate-900" />
                  <span>6 Haneli Teslimat PIN Kodu Hatırlatması</span>
                </div>
                <p>
                  Satıcı ile buluştuğunuzda ürünü detaylıca inceleyiniz. Ürünü sağlam ve tarif edildiği gibi teslim aldıktan sonra, 
                  <strong> "Siparişlerim"</strong> sayfanızda yer alan <strong>6 haneli doğrulama PIN kodunu</strong> satıcıya ileterek satışı onaylayabilirsiniz.
                </p>
                <p className="text-[11px] text-slate-500 font-semibold">
                  ⏳ Buluşmayı tamamlamak için <strong>4 iş günü</strong> süreniz bulunmaktadır.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs space-y-2">
              {shippingAddress ? (
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
                  <p className="font-bold text-slate-900">{shippingAddress.title || 'Teslimat Adresi'}</p>
                  <p className="text-slate-600 font-medium mt-0.5">{shippingAddress.addressLine}</p>
                  <p className="text-slate-500 font-medium">
                    {shippingAddress.city}{shippingAddress.state ? ` / ${shippingAddress.state}` : ''} {shippingAddress.postalCode}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 font-medium">Kayıtlı teslimat adresinize gönderilecektir.</p>
              )}
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                📦 Satıcı ürünü kargoya verdiğinde takip numarası sisteme işlenecek ve size SMS/e-posta ile bildirim gönderilecektir.
              </p>
            </div>
          )}
        </div>

        {/* ── Order Items List ───────────────────────────────────── */}
        {Array.isArray(orderItems) && orderItems.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sipariş Edilen Ürünler
              </span>
              <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {orderItems.length} Ürün
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {orderItems.map((item, idx) => {
                const title = item?.listing?.title || item?.listingTitle || item?.title || 'Ürün';
                const image = item?.listing?.imageUrl || item?.imageUrl || null;
                const price = item?.price || item?.listing?.price || 0;

                return (
                  <div key={idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                        {image ? (
                          <img src={image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <span className="font-bold text-slate-900 truncate max-w-xs">{title}</span>
                    </div>

                    <span className="font-extrabold text-slate-900 shrink-0">
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all"
            >
              <Receipt className="h-4 w-4" />
              <span>Siparişi İncele</span>
            </button>
          ) : (
            <button 
              type="button" 
              onClick={() => navigate(ROUTES.MY_ORDERS)} 
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all"
            >
              <Receipt className="h-4 w-4" />
              <span>Siparişlerim</span>
            </button>
          )}

          <button 
            type="button" 
            onClick={() => navigate(ROUTES.MY_ORDERS)} 
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Tüm Siparişler</span>
          </button>

          <button 
            type="button" 
            onClick={() => navigate(ROUTES.LISTINGS)} 
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
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

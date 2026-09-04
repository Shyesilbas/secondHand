import { useTranslation } from "react-i18next";
import { memo } from 'react';
import { formatCurrency } from '../../../common/formatters.js';
import { ShieldCheck, ShoppingBag, Store, Tag } from 'lucide-react';

const CheckoutOrderSummary = ({
  cartItems = [],
  calculateTotal,
  pricing,
}) => {
  const { t } = useTranslation();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = pricing?.subtotalAfterCampaigns != null 
    ? parseFloat(pricing.subtotalAfterCampaigns) 
    : calculateTotal ? calculateTotal() : 0;
  const originalSubtotal = pricing?.originalSubtotal != null ? parseFloat(pricing.originalSubtotal) : null;
  const campaignDiscount = pricing?.campaignDiscount != null ? parseFloat(pricing.campaignDiscount) : 0;
  const couponDiscount = pricing?.couponDiscount != null ? parseFloat(pricing.couponDiscount) : 0;
  const totalDiscounts = campaignDiscount + couponDiscount;
  const total = pricing?.total != null ? parseFloat(pricing.total) : subtotal - couponDiscount;
  const currency = cartItems.length > 0 ? cartItems[0]?.listing?.currency || 'TRY' : 'TRY';

  return (
    <aside className="sticky top-24">
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-slate-900" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {t("order_summary", "Sipariş Özeti")}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
            {cartCount} {cartCount === 1 ? 'Ürün' : 'Ürün'}
          </span>
        </div>

        {/* ── Ürün - Fiyat - Satıcı Listesi ───────────────────────── */}
        <div className="max-h-[min(380px,45vh)] overflow-y-auto divide-y divide-slate-100 px-5">
          {cartItems.map((item) => {
            const isOffer = !!item.isOffer;
            const hasCampaign = !isOffer && item.listing?.campaignId && item.listing?.campaignPrice != null && parseFloat(item.listing?.campaignPrice) < parseFloat(item.listing?.price);
            const unitPrice = isOffer 
              ? (item.offerTotalPrice != null && item.quantity ? parseFloat(item.offerTotalPrice) / item.quantity : item.listing?.price) 
              : hasCampaign ? item.listing?.campaignPrice : item.listing?.price;
            const lineTotal = isOffer ? parseFloat(item.offerTotalPrice) || 0 : parseFloat(unitPrice) * item.quantity;
            const sellerFullName = [item.listing?.sellerName, item.listing?.sellerSurname].filter(Boolean).join(' ') || item.listing?.sellerUsername || 'Satıcı';

            return (
              <div key={item.id} className="py-4 space-y-2">
                {/* Ürün & Fiyat Üst Sıra */}
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {item.listing?.imageUrl ? (
                      <img
                        src={item.listing?.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={e => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`text-xs font-bold text-slate-400 ${item.listing?.imageUrl ? 'hidden' : 'flex'}`}>
                      {item.listing?.title ? item.listing.title.charAt(0).toUpperCase() : 'P'}
                    </span>
                  </div>

                  {/* Title & Quantity */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-bold text-slate-900 leading-snug">
                      {item.listing?.title}
                    </p>
                    {isOffer && (
                      <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {t("offer", "Özel Teklif")}
                      </span>
                    )}
                  </div>

                  {/* Fiyat (Line total) */}
                  <div className="shrink-0 text-right">
                    <span className="block text-xs font-black text-slate-900">
                      {formatCurrency(lineTotal, item.listing?.currency || currency)}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-medium">
                      {item.quantity} × {formatCurrency(unitPrice, item.listing?.currency || currency)}
                    </span>
                  </div>
                </div>

                {/* Satıcı Bilgisi (Seller Pill) */}
                <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                  <div className="flex items-center gap-1.5 text-slate-600 truncate">
                    <Store className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-400">Satıcı:</span>
                    <strong className="text-slate-800 font-semibold truncate">{sellerFullName}</strong>
                  </div>
                  {item.listing?.city && (
                    <span className="text-slate-400 font-medium text-[10px] shrink-0">
                      {item.listing.city}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Özet Fiyat Kırılımı ─────────────────────────────────── */}
        <div className="border-t border-slate-100 bg-slate-50/40 p-5 space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>{t("subtotal", "Ara Toplam")}</span>
            <span className="font-bold text-slate-900">
              {formatCurrency(originalSubtotal != null ? originalSubtotal : subtotal, currency)}
            </span>
          </div>

          {totalDiscounts > 0 && (
            <div className="flex justify-between items-center text-emerald-700 font-semibold bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>Toplam İndirim</span>
              </span>
              <span className="font-black">
                −{formatCurrency(totalDiscounts, currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>{t("shipping", "Kargo Bedeli")}</span>
            <span className="font-bold text-emerald-700">{t("free", "Ücretsiz")}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 font-medium">
            <span>{t("tax", "KDV & Hizmet Bedeli")}</span>
            <span className="font-bold text-slate-900">Dahil</span>
          </div>

          {/* Toplam Tutar */}
          <div className="border-t border-slate-200 pt-3 flex items-baseline justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                {t("total", "Toplam Tutar")}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Vergiler Dahil</span>
            </div>
            <span className="text-xl font-black text-slate-900">
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>

        {/* ── Güvenlik Mührü ─────────────────────────────────────── */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-2.5 text-center flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>256-Bit SSL · Escrow Güvenli Havuz</span>
        </div>
      </div>
    </aside>
  );
};

export default memo(CheckoutOrderSummary);
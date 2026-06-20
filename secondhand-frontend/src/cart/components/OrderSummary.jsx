import { useTranslation } from "react-i18next";
import { formatCurrency } from '../../common/formatters.js';
import { Check } from 'lucide-react';
import { CART_UI, cartBtnPrimaryBlock, cartSurfacePanel } from '../uiPalette.js';
const OrderSummary = ({
  cartItems,
  cartCount,
  calculateTotal,
  onCheckout,
  pricing,
  disabled = false
}) => {
  const {
    t
  } = useTranslation();
  const originalSubtotal = pricing?.originalSubtotal != null ? parseFloat(pricing.originalSubtotal) : cartItems.reduce((sum, item) => {
    const price = parseFloat(item.listing.price) || 0;
    return sum + price * item.quantity;
  }, 0);
  const total = pricing?.total != null ? parseFloat(pricing.total) : calculateTotal();
  const campaignDiscount = pricing?.campaignDiscount != null ? parseFloat(pricing.campaignDiscount) : Math.max(0, (originalSubtotal || 0) - (total || 0));
  const shipping = 0;
  const tax = 0;
  const finalTotal = total; // pricing.total already includes tax/shipping logic if any

  const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';
  const hasCampaign = campaignDiscount > 0;
  return <aside className={`sticky top-14 ${cartSurfacePanel}`} style={{
    borderColor: CART_UI.border
  }}>
      <div className="border-b px-4 py-3 sm:px-5" style={{
      borderColor: CART_UI.border,
      backgroundColor: CART_UI.surface
    }}>
        <h3 className="text-sm font-medium text-text-primary text-[#1a1918]">{t("order_summary")}</h3>
        <p className="mt-0.5 text-xs tabular-nums text-text-secondary">
          {cartCount} {cartCount === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="max-h-[min(280px,40vh)] overflow-y-auto px-4 py-3 sm:px-5">
        <ul className="divide-y divide-[#e0deda]">
          {cartItems.map(item => {
          const itemPrice = parseFloat(item.listing.campaignPrice ?? item.listing.price) || 0;
          const itemTotal = itemPrice * item.quantity;
          return <li key={item.id} className="flex gap-3 py-3 first:pt-0">
                {item.listing.imageUrl ? <img src={item.listing.imageUrl} alt="" className="h-10 w-10 shrink-0 border object-cover" style={{
              borderColor: CART_UI.border
            }} onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }} /> : null}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center border bg-secondary text-caption font-medium text-text-muted ${item.listing.imageUrl ? 'hidden' : 'flex'}`} style={{
              borderColor: CART_UI.border
            }}>
                  {item.listing.title.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-medium leading-snug text-[#1a1918]">
                    {item.listing.title}
                  </p>
                  <p className="mt-0.5 text-caption tabular-nums text-text-secondary">
                    {item.quantity} × {formatCurrency(itemPrice, item.listing.currency)}
                  </p>
                </div>
                <p className="shrink-0 text-xs font-medium tabular-nums text-[#1a1918]">
                  {formatCurrency(itemTotal, item.listing.currency)}
                </p>
              </li>;
        })}
        </ul>
      </div>

      <div className="space-y-2.5 border-t px-4 py-4 text-sm sm:px-5" style={{
      borderColor: CART_UI.border,
      backgroundColor: CART_UI.surface
    }}>
        <div className="flex justify-between gap-4">
          <span className="text-text-secondary">{t("subtotal")}</span>
          <span className="tabular-nums font-medium text-[#1a1918]">
            {formatCurrency(total, currency)}
          </span>
        </div>

        {hasCampaign && <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-text-secondary">{t("discount")}</span>
              <span className="tabular-nums font-medium text-[#107c10]">
                −{formatCurrency(campaignDiscount, currency)}
              </span>
            </div>
            <div className="flex justify-end">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#dff6dd] px-2 py-0.5 text-caption font-bold text-[#107c10]">
                <Check className="h-3 w-3" strokeWidth={3} />{t("bundle_savings_applied")}</span>
            </div>
          </div>}

        <div className="flex justify-between gap-4">
          <span className="text-text-secondary">{t("shipping")}</span>
          <span className="font-medium text-[#1a1918]">{t("free")}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-text-secondary">{t("tax")}</span>
          <span className="tabular-nums font-medium text-[#1a1918]">
            {formatCurrency(tax, currency)}
          </span>
        </div>

        <div className="border-t border-[#e0deda] pt-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-base font-semibold text-[#1a1918]">{t("total")}</span>
            <span className="text-lg font-semibold tabular-nums text-[#1466c6]">
              {formatCurrency(finalTotal, currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#e0deda] px-4 pb-5 pt-2 sm:px-5">
        <button type="button" className={cartBtnPrimaryBlock} onClick={onCheckout} disabled={disabled}>{t("proceed_to_checkout")}</button>
        <p className="mt-3 text-center text-caption text-text-muted">{t("you_will_enter_address_and_payment_on_th")}</p>
      </div>
    </aside>;
};
export default OrderSummary;
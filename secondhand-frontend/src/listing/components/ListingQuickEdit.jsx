import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from 'react';
import { listingService } from '../services/listingService.js';
import { PriceInput } from '../../common/components/ui/PriceInput.jsx';
import { Check, Loader2 } from 'lucide-react';
import { NON_PURCHASABLE_TYPES } from '../types/index.js';

export const ListingQuickEdit = ({
  listing,
  onChanged,
  showSuccess,
  showError,
  compact = false
}) => {
  const { t } = useTranslation();
  const [qty, setQty] = useState(String(listing.quantity ?? 0));
  const [priceVal, setPriceVal] = useState(listing.price ?? 0);
  const [savingQty, setSavingQty] = useState(false);
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    setQty(String(listing.quantity ?? 0));
  }, [listing.quantity]);

  useEffect(() => {
    setPriceVal(listing.price ?? 0);
  }, [listing.price]);

  const showQty = !NON_PURCHASABLE_TYPES.includes(listing?.type);

  const save = useCallback(async (field, value) => {
    const num = field === 'quantity' ? parseInt(value, 10) : typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
    if (!Number.isFinite(num) || field === 'quantity' && num < 1 || field === 'price' && num < 0) return;
    field === 'quantity' ? setSavingQty(true) : setSavingPrice(true);
    try {
      if (field === 'quantity') await listingService.updateQuantity(listing.id, num);
      else await listingService.updatePrice(listing.id, num);
      showSuccess('Updated', `${field === 'quantity' ? 'Stock' : 'Price'} updated`);
      onChanged?.();
    } catch (e) {
      showError('Update failed', e?.response?.data?.message || 'Failed');
    } finally {
      setSavingQty(false);
      setSavingPrice(false);
    }
  }, [listing.id, onChanged, showSuccess, showError]);

  const btnCls = `inline-flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-7 h-7'} rounded-sm text-status-success-text bg-background-secondary hover:bg-secondary-200 hover:text-text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0`;

  return (
    <div
      className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0"
      onClick={e => e.stopPropagation()}
    >
      {showQty && (
        <div className="inline-flex items-center gap-1.5 bg-background-secondary/60 px-2 py-1 rounded border border-border-light h-9">
          <span className="text-xs font-medium text-text-muted select-none shrink-0">
            {t("qty")}
          </span>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={e => setQty(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save('quantity', qty)}
            className="w-14 px-1.5 py-0.5 text-xs tabular-nums font-semibold text-text-primary text-center bg-background-primary rounded-sm border border-border-light outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => save('quantity', qty)}
            disabled={savingQty || String(qty) === String(listing.quantity)}
            className={btnCls}
            title={t("save_quantity")}
          >
            {savingQty ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      <div className="inline-flex items-center gap-1.5 bg-background-secondary/60 px-2 py-1 rounded border border-border-light h-9">
        <span className="text-xs font-medium text-text-muted select-none shrink-0">
          {t("price")}
        </span>
        <div className="relative flex items-center">
          <PriceInput
            value={priceVal}
            onChange={n => setPriceVal(p => n != null ? n : p)}
            onKeyDown={e => e.key === 'Enter' && save('price', priceVal)}
            compact={compact}
            className="w-28 pl-2 pr-9 py-0.5 text-xs tabular-nums font-semibold text-text-primary bg-background-primary rounded-sm border border-border-light focus:ring-0 focus:border-primary"
          />
          <span className="absolute right-2 text-xs font-medium text-text-muted pointer-events-none select-none">
            {listing.currency || 'TRY'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => save('price', priceVal)}
          disabled={savingPrice || priceVal === listing.price}
          className={btnCls}
          title={t("save_price")}
        >
          {savingPrice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

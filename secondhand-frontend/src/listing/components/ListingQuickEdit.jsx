import React, {useCallback, useState} from 'react';
import {listingService} from '../services/listingService.js';
import {PriceInput} from '../../common/components/ui/PriceInput.jsx';
import {Check, Loader2} from 'lucide-react';
import { NON_PURCHASABLE_TYPES } from '../types/index.js';

export const ListingQuickEdit = ({listing, onChanged, showSuccess, showError, compact = false}) => {
    const [qty, setQty] = useState(String(listing.quantity ?? 0));
    const [priceVal, setPriceVal] = useState(listing.price ?? 0);
    const [savingQty, setSavingQty] = useState(false);
    const [savingPrice, setSavingPrice] = useState(false);
    const showQty = !NON_PURCHASABLE_TYPES.includes(listing?.type);

    const save = useCallback(async (field, value) => {
        const num = field === 'quantity' ? parseInt(value, 10) : (typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.')));
        if (!Number.isFinite(num) || (field === 'quantity' && num < 1) || (field === 'price' && num < 0)) return;
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

    const inputCls = compact ? 'w-16 px-2 py-1 text-xs border-slate-200' : 'w-20 px-2.5 py-1.5 text-sm border-slate-200';
    const btnCls = `flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-7 h-7'} rounded-md text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`;

    return (
        <div className={`flex flex-wrap items-center gap-3 bg-slate-50/50 p-2 rounded-lg border border-slate-100 w-fit`} onClick={e => e.stopPropagation()}>
            {showQty && (
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 select-none">QTY</span>
                    <input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={e => setQty(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && save('quantity', qty)}
                        className={`${inputCls} rounded border-0 outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 font-medium text-slate-700 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    />
                    <button type="button" onClick={() => save('quantity', qty)} disabled={savingQty || String(qty) === String(listing.quantity)} className={btnCls} title="Save Quantity">
                        {savingQty ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                </div>
            )}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-slate-200 shadow-sm">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 select-none">PRICE</span>
                <div className="relative flex items-center">
                    <PriceInput
                        value={priceVal}
                        onChange={n => setPriceVal(p => n != null ? n : p)}
                        onKeyDown={e => e.key === 'Enter' && save('price', priceVal)}
                        compact={compact}
                        className={`${compact ? 'w-24 py-1' : 'w-28 py-1.5'} pl-2 pr-10 border-0 outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 font-medium text-slate-700 rounded`}
                    />
                    <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none select-none">
                        {listing.currency || 'TRY'}
                    </span>
                </div>
                <button type="button" onClick={() => save('price', priceVal)} disabled={savingPrice || priceVal === listing.price} className={btnCls} title="Save Price">
                    {savingPrice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
    );
};

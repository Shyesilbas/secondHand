import React, {useCallback, useState} from 'react';
import {listingService} from '../services/listingService.js';
import {PriceInput} from '../../common/components/ui/PriceInput.jsx';
import {Check, Loader2} from 'lucide-react';

const TYPES_WITHOUT_QUANTITY = ['VEHICLE', 'REAL_ESTATE'];

export const ListingQuickEdit = ({listing, onChanged, showSuccess, showError, compact = false}) => {
    const [qty, setQty] = useState(String(listing.quantity ?? 0));
    const [priceVal, setPriceVal] = useState(listing.price ?? 0);
    const [savingQty, setSavingQty] = useState(false);
    const [savingPrice, setSavingPrice] = useState(false);
    const showQty = !TYPES_WITHOUT_QUANTITY.includes(listing?.type);

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

    const inputCls = compact ? 'w-14 px-1.5 py-0.5 text-xs' : 'w-14 px-2 py-1 text-sm';
    const btnCls = 'p-1 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded disabled:opacity-50';

    return (
        <div className={`flex flex-wrap items-center gap-2 ${compact ? 'gap-1.5' : 'gap-3'}`} onClick={e => e.stopPropagation()}>
            {showQty && (
                <div className="flex items-center gap-0.5">
                    <input type="number" min={1} value={qty} onChange={e => setQty(e.target.value)} onKeyDown={e => e.key === 'Enter' && save('quantity', qty)}
                        className={`${inputCls} border border-slate-200 rounded focus:ring-1 focus:ring-blue-500`} />
                    <button type="button" onClick={() => save('quantity', qty)} disabled={savingQty} className={btnCls} title="Update stock">
                        {savingQty ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    </button>
                </div>
            )}
            <div className="flex items-center gap-0.5">
                <PriceInput value={priceVal} onChange={n => setPriceVal(p => n != null ? n : p)} onKeyDown={e => e.key === 'Enter' && save('price', priceVal)}
                    compact={compact} className={compact ? 'w-20 py-1' : 'min-w-[7rem]'} />
                <span className="text-xs font-medium text-slate-500">{listing.currency || 'TRY'}</span>
                <button type="button" onClick={() => save('price', priceVal)} disabled={savingPrice} className={btnCls} title="Update price">
                    {savingPrice ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </button>
            </div>
        </div>
    );
};

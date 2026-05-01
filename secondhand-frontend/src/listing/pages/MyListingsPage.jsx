import React, {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {useEnums} from '../../common/hooks/useEnums.js';
import {useListingEngine} from '../hooks/useListingEngine.js';
import ListingsModuleLayout from '../components/ListingsModuleLayout.jsx';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {listingService} from '../services/listingService.js';
import {ListingQuickEdit} from '../components/ListingQuickEdit.jsx';
import {PriceInput} from '../../common/components/ui/PriceInput.jsx';
import {formatCurrency, parsePrice} from '../../common/formatters.js';
import {AlertTriangle, ChevronDown, ChevronUp, Loader2, Pencil, Plus, X} from 'lucide-react';

const LowStockCard = ({listing, onRefresh, showSuccess, showError}) => (
    <div className="flex flex-wrap items-center gap-3 rounded-lg p-3 bg-white/80 backdrop-blur border border-slate-200/50 hover:border-slate-300/70 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {listing.title?.charAt(0)?.toUpperCase() || 'L'}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{listing.title}</h4>
            <p className="text-sm text-gray-500">{listing.listingNo}</p>
        </div>
        <ListingQuickEdit listing={listing} onChanged={onRefresh} showSuccess={showSuccess} showError={showError} />
        <Link to={ROUTES.EDIT_LISTING(listing.id)} className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-lg">
            <Pencil className="w-3.5 h-3.5" /> Edit
        </Link>
    </div>
);

const MyListingsPage = () => {
    const { getListingTypeLabel } = useEnums();
    const { showSuccess, showError } = useNotification();
    const engine = useListingEngine({ initialListingType: null, mode: 'mine' });
    const lowStock = engine.alerts?.lowStock;

    const [bulkMode, setBulkMode] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkValue, setBulkValue] = useState('');
    const [saving, setSaving] = useState(false);

    const listings = lowStock?.listings ?? [];
    const toggleSelect = useCallback((id) => setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return new Set(s); }), []);
    const selectAll = useCallback(() => setSelectedIds(new Set(listings.map(l => l.id))), [listings]);
    const clearBulk = useCallback(() => { setBulkMode(null); setSelectedIds(new Set()); setBulkValue(''); }, []);

    const totalValueStats = useMemo(() => {
        const list = engine.filteredListings || engine.listings || [];
        let totalVal = 0;
        let activeCount = 0;
        list.forEach(item => {
            if (item.status === 'ACTIVE' || item.status === 'DRAFT') {
                const price = Number(item.price) || 0;
                const qty = Number(item.quantity) || 1;
                totalVal += price * qty;
                activeCount++;
            }
        });
        return { totalVal, activeCount };
    }, [engine.filteredListings, engine.listings]);

    const applyBulk = useCallback(async () => {
        const ids = Array.from(selectedIds);
        if (!ids.length) { showError('No selection', 'Select at least one listing'); return; }
        const num = bulkMode === 'quantity' ? parseInt(bulkValue, 10) : parsePrice(bulkValue);
        if (!Number.isFinite(num) || (bulkMode === 'quantity' && num < 1) || (bulkMode === 'price' && num < 0)) {
            showError('Invalid value', bulkMode === 'quantity' ? 'Quantity must be at least 1' : 'Price must be 0 or more');
            return;
        }
        setSaving(true);
        try {
            bulkMode === 'quantity' ? await listingService.updateBatchQuantity(ids, num) : await listingService.updateBatchPrice(ids, num);
            showSuccess('Updated', `${ids.length} listing(s) updated`);
            clearBulk();
            engine.refresh();
        } catch (e) {
            showError('Update failed', e?.response?.data?.message || 'Error');
        } finally {
            setSaving(false);
        }
    }, [bulkMode, bulkValue, selectedIds, showSuccess, showError, clearBulk, engine]);

    const extraActions = (
        <Link
            to={ROUTES.CREATE_LISTING}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                 hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm
                 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            <Plus className="w-4 h-4" />
            New Listing
        </Link>
    );

    const topSlot = useMemo(() => {
        const hasLowStock = lowStock && lowStock.count > 0;
        const stockText = hasLowStock ? `${lowStock.count} listing${lowStock.count === 1 ? '' : 's'}` : '';

        return (
            <div className="mb-6 space-y-4">
                {/* Total Value Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total Portfolio Value</p>
                        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {formatCurrency(totalValueStats.totalVal, 'TRY')}
                        </div>
                    </div>
                    <div className="flex items-center bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                        <div className="flex h-2 w-2 relative mr-2.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                            {totalValueStats.activeCount} Active/Draft Listings
                        </span>
                    </div>
                </div>

                {/* Low Stock Alert */}
                {hasLowStock && (
                    !lowStock.isOpen ? (
                        <div
                            className="rounded-xl p-4 cursor-pointer transition-all duration-200
                             bg-white/70 backdrop-blur-sm border border-slate-200/60
                             shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]
                             hover:border-slate-300/70"
                            onClick={lowStock.toggle}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-amber-600/90" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Low Stock Alert</h3>
                                        <p className="text-sm text-slate-600">
                                            {stockText} {lowStock.count === 1 ? 'has' : 'have'} less than 10 items in stock.
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl p-5 bg-white/70 backdrop-blur-sm border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                            <div className="flex items-center justify-between cursor-pointer mb-4" onClick={lowStock.toggle}>
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-amber-600/90" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">Stock Running Low</h3>
                                        <p className="text-sm text-slate-600">{stockText} {lowStock.count === 1 ? 'has' : 'have'} less than 10 items in stock.</p>
                                    </div>
                                </div>
                                <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                            </div>

                            {!bulkMode ? (
                                <>
                                    <div className="flex gap-2 mb-3" onClick={e => e.stopPropagation()}>
                                        <button type="button" onClick={() => setBulkMode('quantity')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                                            Bulk Update Quantity
                                        </button>
                                        <button type="button" onClick={() => setBulkMode('price')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">
                                            Bulk Update Price
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {lowStock.listings.slice(0, 6).map((listing) => (
                                            <LowStockCard key={listing.id} listing={listing} onRefresh={engine.refresh} showSuccess={showSuccess} showError={showError} />
                                        ))}
                                        {lowStock.count > 6 && <div className="text-center py-2 text-sm text-slate-600">And {lowStock.count - 6} more with low stock.</div>}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-2" onClick={e => e.stopPropagation()}>
                                    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-lg">
                                        {bulkMode === 'quantity' ? (
                                            <input type="number" min={1} value={bulkValue} onChange={e => setBulkValue(e.target.value)}
                                                placeholder="Quantity" className="w-28 px-3 py-2 text-sm border border-slate-200 rounded-lg" />
                                        ) : (
                                            <PriceInput value={parsePrice(bulkValue) ?? 0} onChange={n => setBulkValue(n != null ? String(n) : '')}
                                                placeholder="Price" className="min-w-[8rem]" />
                                        )}
                                        <button type="button" onClick={applyBulk} disabled={saving} className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
                                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Apply
                                        </button>
                                        <button type="button" onClick={clearBulk} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <label className="flex items-center gap-2 py-1 text-sm text-slate-600 cursor-pointer">
                                        <input type="checkbox" checked={listings.length > 0 && selectedIds.size === listings.length} onChange={e => e.target.checked ? selectAll() : setSelectedIds(new Set())} className="rounded" />
                                        Select all
                                    </label>
                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                        {listings.map((listing) => (
                                            <label key={listing.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                                                <input type="checkbox" checked={selectedIds.has(listing.id)} onChange={() => toggleSelect(listing.id)} className="rounded" />
                                                <span className="flex-1 truncate text-sm font-medium text-slate-800">{listing.title}</span>
                                                <span className="text-xs text-slate-500">{bulkMode === 'quantity' ? `Stock: ${listing.quantity}` : formatCurrency(listing.price, listing.currency)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        );
    }, [lowStock, engine, bulkMode, selectedIds, bulkValue, saving, toggleSelect, selectAll, clearBulk, applyBulk, listings, showSuccess, showError, totalValueStats]);

    return (
        <ListingsModuleLayout
            mode="mine"
            title="My Listings"
            getListingTypeLabel={getListingTypeLabel}
            engine={engine}
            extraActions={extraActions}
            topSlot={topSlot}
            disableSticky={true}
        />
    );
};

export default MyListingsPage;


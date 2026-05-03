import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import BulkShowcaseModal from '../../showcase/components/BulkShowcaseModal.jsx';
import BulkSelectionModal from '../../showcase/components/BulkSelectionModal.jsx';
import BulkShowcaseBanner from '../../showcase/components/BulkShowcaseBanner.jsx';
import {useShowcase} from '../../showcase/hooks/useShowcase.js';
import {showcaseService} from '../../showcase/services/showcaseService.js';

const LowStockCard = ({listing, onRefresh, showSuccess, showError}) => (
    <div className="flex flex-wrap items-center gap-3 rounded-lg p-3 bg-white/80 backdrop-blur border border-slate-200/50 hover:border-slate-300/70 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
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
    const { showcases } = useShowcase();

    const [bulkMode, setBulkMode] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkValue, setBulkValue] = useState('');
    const [saving, setSaving] = useState(false);
    
    // Showcase States
    const [isBulkShowcaseOpen, setIsBulkShowcaseOpen] = useState(false);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [selectedListingsForBulk, setSelectedListingsForBulk] = useState([]);
    const [pricing, setPricing] = useState(null);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const res = await showcaseService.getPricingConfig();
                setPricing(res);
            } catch (e) {
                console.error("Failed to fetch showcase pricing", e);
            }
        };
        fetchPricing();
    }, []);

    const showcaseListingIds = useMemo(() => {
        if (!Array.isArray(showcases)) return new Set();
        return new Set(showcases.map(s => s.listingId || s.listing?.id).filter(Boolean));
    }, [showcases]);

    const listings = lowStock?.listings ?? [];

    const toggleSelect = useCallback((id) => setSelectedIds(prev => { 
        const s = new Set(prev); 
        s.has(id) ? s.delete(id) : s.add(id); 
        return s; 
    }), []);
    
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
        <div className="flex items-center gap-2 sm:gap-3">
             <Link
                to={ROUTES.CREATE_LISTING}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl
                    hover:bg-slate-800 transition-all duration-200 font-bold shadow-sm
                    hover:shadow-md active:scale-95"
            >
                <Plus className="w-4 h-4" strokeWidth={3} />
                New Listing
            </Link>
        </div>
    );

    const topSlot = useMemo(() => {
        const hasLowStock = lowStock && lowStock.count > 0;
        const stockText = hasLowStock ? `${lowStock.count} listing${lowStock.count === 1 ? '' : 's'}` : '';

        return (
            <div className="mb-8 space-y-4">
                <BulkShowcaseBanner onBoostClick={() => setIsSelectionModalOpen(true)} />

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Portfolio Value</p>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">
                            {formatCurrency(totalValueStats.totalVal, 'TRY')}
                        </div>
                    </div>
                    <div className="flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <div className="flex h-2 w-2 relative mr-2.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                            {totalValueStats.activeCount} Active Listings
                        </span>
                    </div>
                </div>

                {hasLowStock && (
                    !lowStock.isOpen ? (
                        <div
                            className="rounded-2xl p-4 cursor-pointer transition-all duration-300
                             bg-white/70 backdrop-blur-sm border border-slate-200/60
                             shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]
                             hover:border-slate-300/70 group"
                            onClick={lowStock.toggle}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">Inventory Alert</h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {stockText} {lowStock.count === 1 ? 'has' : 'have'} critically low stock.
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl p-5 bg-white border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center justify-between cursor-pointer mb-5" onClick={lowStock.toggle}>
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Inventory Management</h3>
                                        <p className="text-xs text-slate-500 font-medium">{stockText} requiring attention.</p>
                                    </div>
                                </div>
                                <ChevronUp className="w-4 h-4 text-slate-600" />
                            </div>

                            {!bulkMode ? (
                                <>
                                    <div className="flex gap-2 mb-3" onClick={e => e.stopPropagation()}>
                                        <button type="button" onClick={() => setBulkMode('quantity')} className="px-3 py-1.5 text-[10px] font-black bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors uppercase tracking-wider">
                                            Batch Stock
                                        </button>
                                        <button type="button" onClick={() => setBulkMode('price')} className="px-3 py-1.5 text-[10px] font-black bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors uppercase tracking-wider">
                                            Batch Prices
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {lowStock.listings.slice(0, 6).map((listing) => (
                                            <LowStockCard key={listing.id} listing={listing} onRefresh={engine.refresh} showSuccess={showSuccess} showError={showError} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3" onClick={e => e.stopPropagation()}>
                                    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        {bulkMode === 'quantity' ? (
                                            <input type="number" min={1} value={bulkValue} onChange={e => setBulkValue(e.target.value)}
                                                placeholder="Qty" className="w-20 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        ) : (
                                            <PriceInput value={parsePrice(bulkValue) ?? 0} onChange={n => setBulkValue(n != null ? String(n) : '')}
                                                placeholder="Price" className="min-w-[8rem]" />
                                        )}
                                        <button type="button" onClick={applyBulk} disabled={saving} className="px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Apply
                                        </button>
                                        <button type="button" onClick={clearBulk} className="p-2 text-slate-400 hover:text-slate-600 transition-all">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                                        {listings.map((listing) => (
                                            <label key={listing.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                                                <input type="checkbox" checked={selectedIds.has(listing.id)} onChange={() => toggleSelect(listing.id)} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600" />
                                                <span className="flex-1 truncate text-xs font-bold text-slate-800">{listing.title}</span>
                                                <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{bulkMode === 'quantity' ? `Qty: ${listing.quantity}` : formatCurrency(listing.price, listing.currency)}</span>
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

    const handleSelectionProceed = (selectedListings) => {
        setSelectedListingsForBulk(selectedListings);
        setIsBulkShowcaseOpen(true);
    };

    return (
        <>
            <ListingsModuleLayout
                mode="mine"
                title="Inventory"
                getListingTypeLabel={getListingTypeLabel}
                engine={engine}
                extraActions={extraActions}
                topSlot={topSlot}
                disableSticky={true}
                isSelectable={false}
            />

            {isSelectionModalOpen && (
                <BulkSelectionModal
                    isOpen={isSelectionModalOpen}
                    onClose={() => setIsSelectionModalOpen(false)}
                    listings={engine.listings || []}
                    showcaseListingIds={showcaseListingIds}
                    onProceed={handleSelectionProceed}
                    pricing={pricing}
                />
            )}

            {isBulkShowcaseOpen && (
                <BulkShowcaseModal
                    isOpen={isBulkShowcaseOpen}
                    onClose={() => setIsBulkShowcaseOpen(false)}
                    selectedListings={selectedListingsForBulk}
                    pricing={pricing}
                    onSuccess={() => {
                        engine.refresh();
                    }}
                />
            )}
        </>
    );
};

export default MyListingsPage;

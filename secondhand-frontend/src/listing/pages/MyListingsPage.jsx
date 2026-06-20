import { useTranslation } from "react-i18next";
import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../common/constants/routes.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingEngine } from '../hooks/useListingEngine.js';
import ListingsModuleLayout from '../components/ListingsModuleLayout.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { listingService } from '../services/listingService.js';
import { ListingQuickEdit } from '../components/ListingQuickEdit.jsx';
import { PriceInput } from '../../common/components/ui/PriceInput.jsx';
import { formatCurrency, parsePrice } from '../../common/formatters.js';
import { AlertTriangle, ChevronDown, ChevronUp, Loader2, Pencil, Plus, X } from 'lucide-react';
import BulkShowcaseModal from '../../showcase/components/BulkShowcaseModal.jsx';
import BulkSelectionModal from '../../showcase/components/BulkSelectionModal.jsx';
import BulkShowcaseBanner from '../../showcase/components/BulkShowcaseBanner.jsx';
import { useShowcase } from '../../showcase/hooks/useShowcase.js';
import { showcaseService } from '../../showcase/services/showcaseService.js';
const LowStockCard = ({
  listing,
  onRefresh,
  showSuccess,
  showError
}) => {
  const { t } = useTranslation();
  return <div className="flex flex-wrap items-center gap-3 rounded-lg p-3 bg-background-primary border border-border-light hover:border-border-dark hover:shadow-sm transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-semibold text-sm shadow-sm">
            {listing.title?.charAt(0)?.toUpperCase() || 'L'}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-medium text-text-primary truncate">{listing.title}</h4>
            <p className="text-sm text-text-muted">{listing.listingNo}</p>
        </div>
        <ListingQuickEdit listing={listing} onChanged={onRefresh} showSuccess={showSuccess} showError={showError} />
        <Link to={ROUTES.EDIT_LISTING(listing.id)} className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-text-secondary bg-secondary-light hover:bg-secondary-200 rounded-lg">
            <Pencil className="w-3.5 h-3.5" />{t("edit")}</Link>
    </div>;
};
const MyListingsPage = () => {
  const {
    t
  } = useTranslation();
  const {
    getListingTypeLabel
  } = useEnums();
  const {
    showSuccess,
    showError
  } = useNotification();
  const engine = useListingEngine({
    initialListingType: null,
    mode: 'mine'
  });
  const lowStock = engine.alerts?.lowStock;
  const {
    showcases
  } = useShowcase();
  const [bulkMode, setBulkMode] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkValue, setBulkValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Showcase States
  const [isBulkShowcaseOpen, setIsBulkShowcaseOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedListingsForBulk, setSelectedListingsForBulk] = useState([]);
  const { data: pricing } = useQuery({
    queryKey: ['showcasePricingConfig'],
    queryFn: showcaseService.getPricingConfig,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
  const showcaseListingIds = useMemo(() => {
    if (!Array.isArray(showcases)) return new Set();
    return new Set(showcases.map(s => s.listingId || s.listing?.id).filter(Boolean));
  }, [showcases]);
  const listings = useMemo(() => lowStock?.listings ?? [], [lowStock]);
  const toggleSelect = useCallback(id => setSelectedIds(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  }), []);
  const clearBulk = useCallback(() => {
    setBulkMode(null);
    setSelectedIds(new Set());
    setBulkValue('');
  }, []);
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
    return {
      totalVal,
      activeCount
    };
  }, [engine.filteredListings, engine.listings]);
  const applyBulk = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) {
      showError('No selection', 'Select at least one listing');
      return;
    }
    const num = bulkMode === 'quantity' ? parseInt(bulkValue, 10) : parsePrice(bulkValue);
    if (!Number.isFinite(num) || bulkMode === 'quantity' && num < 1 || bulkMode === 'price' && num < 0) {
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
  const extraActions = <div className="flex items-center gap-2 sm:gap-3">
             <Link to={ROUTES.CREATE_LISTING} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg
                    hover:bg-primary-hover transition-all duration-200 font-bold shadow-sm
                    hover:shadow-md active:scale-95">
                <Plus className="w-4 h-4" strokeWidth={3} />{t("new_listing")}</Link>
        </div>;
  const topSlot = useMemo(() => {
    const hasLowStock = lowStock && lowStock.count > 0;
    const stockText = hasLowStock ? `${lowStock.count} listing${lowStock.count === 1 ? '' : 's'}` : '';
    return <div className="mb-8 space-y-4">
                <BulkShowcaseBanner onBoostClick={() => setIsSelectionModalOpen(true)} />

                {/* Portfolio Header */}
                <div className="relative overflow-hidden bg-background-primary rounded-2xl border border-border-light p-6 shadow-sm group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary-50 rounded-full -mr-16 -mt-16 blur-2xl transition-colors" />
                    
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="space-y-0.5">
                            <h2 className="text-lg font-semibold text-text-primary uppercase tracking-widest">{t("portfolio_performance")}</h2>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-text-primary tracking-tight">
                                    {formatCurrency(totalValueStats.totalVal, 'TRY').split(',')[0]}
                                </span>
                                <span className="text-sm font-bold text-text-muted">
                                    ,{formatCurrency(totalValueStats.totalVal, 'TRY').split(',')[1] || '00'}
                                </span>
                            </div>
                            <p className="text-xs text-text-secondary font-medium">{t("store_value_across")}{totalValueStats.activeCount}{t("live_listings")}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-status-success-bg px-3 py-1.5 rounded-md border border-status-success-border">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success-border opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-status-success-border"></span>
                                </span>
                                <span className="text-caption font-bold text-status-success-text">
                                    {totalValueStats.activeCount}{t("active")}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-secondary-light px-3 py-1.5 rounded-md border border-border-light">
                                <span className="text-caption font-bold text-text-secondary">
                                    {engine.listings?.length || 0}{t("total")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Management Section */}
                {hasLowStock && <div className="bg-background-primary rounded-2xl border border-border-light overflow-hidden shadow-sm">
                        <div className="p-4 cursor-pointer hover:bg-secondary-light transition-colors border-b border-border-light" onClick={lowStock.toggle}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-status-warning-bg rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-status-warning" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-text-primary">{t("inventory_alert")}</h3>
                                        <p className="text-caption text-text-secondary font-medium">{stockText}{t("needs_attention")}</p>
                                    </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${lowStock.isOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>

                        {lowStock.isOpen && <div className="p-4 bg-background-primary">
                                {!bulkMode ? <>
                                        <div className="flex gap-2 mb-4">
                                            <button onClick={() => setBulkMode('quantity')} className="px-4 py-1.5 bg-primary text-white text-caption font-bold rounded-lg hover:bg-primary-hover transition-all">{t("batch_stock")}</button>
                                            <button onClick={() => setBulkMode('price')} className="px-4 py-1.5 bg-secondary-light text-primary text-caption font-bold rounded-lg hover:bg-secondary-200 transition-all">{t("batch_prices")}</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {lowStock.listings.slice(0, 4).map(listing => <LowStockCard key={listing.id} listing={listing} onRefresh={engine.refresh} showSuccess={showSuccess} showError={showError} />)}
                                        </div>
                                    </> : <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary">
                                            <div className="flex items-center gap-2">
                                                {bulkMode === 'quantity' ? <input type="number" min={1} value={bulkValue} onChange={e => setBulkValue(e.target.value)} placeholder={t("qty")} className="w-24 px-3 py-1.5 text-xs bg-background-primary border border-primary rounded-lg outline-none" /> : <PriceInput value={parsePrice(bulkValue) ?? 0} onChange={n => setBulkValue(n != null ? String(n) : '')} placeholder={t("price")} className="w-32 bg-background-primary text-xs" />}
                                                <button onClick={applyBulk} disabled={saving} className="px-4 py-1.5 bg-primary text-white text-caption font-bold rounded-lg hover:bg-primary-hover disabled:opacity-50">{t("apply")}</button>
                                            </div>
                                            <X onClick={clearBulk} className="w-4 h-4 text-primary cursor-pointer" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                                            {listings.map(listing => <label key={listing.id} className={`flex items-center gap-2.5 p-3 rounded-lg border transition-all cursor-pointer ${selectedIds.has(listing.id) ? 'bg-primary-50 border-primary' : 'bg-background-primary border-border-light'}`}>
                                                    <input type="checkbox" checked={selectedIds.has(listing.id)} onChange={() => toggleSelect(listing.id)} className="w-4 h-4 rounded border-border-light text-primary" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-caption font-bold text-text-primary truncate">{listing.title}</p>
                                                        <p className="text-caption font-medium text-text-secondary">{t("current")}{bulkMode === 'quantity' ? `${listing.quantity} pcs` : formatCurrency(listing.price, listing.currency)}
                                                        </p>
                                                    </div>
                                                </label>)}
                                        </div>
                                    </div>}
                            </div>}
                    </div>}
            </div>;
  }, [lowStock, engine, bulkMode, selectedIds, bulkValue, saving, toggleSelect, clearBulk, applyBulk, listings, showSuccess, showError, totalValueStats, t]);
  const handleSelectionProceed = selectedListings => {
    setSelectedListingsForBulk(selectedListings);
    setIsBulkShowcaseOpen(true);
  };
  return <div className="min-h-screen bg-[#fafafa]">
            <ListingsModuleLayout mode="mine" title={t("my_listings")} getListingTypeLabel={getListingTypeLabel} engine={engine} extraActions={extraActions} topSlot={topSlot} disableSticky={true} isSelectable={false} />

            {isSelectionModalOpen && <BulkSelectionModal isOpen={isSelectionModalOpen} onClose={() => setIsSelectionModalOpen(false)} listings={engine.listings || []} showcaseListingIds={showcaseListingIds} onProceed={handleSelectionProceed} pricing={pricing} />}

            {isBulkShowcaseOpen && <BulkShowcaseModal isOpen={isBulkShowcaseOpen} onClose={() => setIsBulkShowcaseOpen(false)} selectedListings={selectedListingsForBulk} pricing={pricing} onSuccess={() => {
      engine.refresh();
    }} />}
        </div>;
};
export default MyListingsPage;
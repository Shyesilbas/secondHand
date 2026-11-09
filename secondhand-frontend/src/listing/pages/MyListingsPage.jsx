import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useListingEngine } from '../hooks/useListingEngine.js';
import ListingsModuleLayout from '../components/ListingsModuleLayout.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { listingService } from '../services/listingService.js';
import { ListingQuickEdit } from '../components/ListingQuickEdit.jsx';
import { PriceInput } from '../../common/components/ui/PriceInput.jsx';
import { formatCurrency, parsePrice } from '../../common/formatters.js';
import { AlertTriangle, ChevronDown, Pencil, Plus, X } from 'lucide-react';
const LowStockCard = ({
  listing,
  onRefresh,
  showSuccess,
  showError
}) => {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded p-3 bg-background-primary border border-border-light hover:border-border transition-colors"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.title || ''}
            className="w-9 h-9 rounded object-cover border border-border-light shrink-0"
          />
        ) : (
          <div className="shrink-0 w-9 h-9 bg-background-secondary text-text-secondary border border-border-light rounded flex items-center justify-center font-semibold text-xs">
            {listing.title?.charAt(0)?.toUpperCase() || 'L'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-sm font-medium text-text-primary truncate">{listing.title}</h4>
          </div>
          <p className="text-xs text-text-muted tabular-nums truncate">{listing.listingNo}</p>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 shrink-0">
        <ListingQuickEdit
          listing={listing}
          onChanged={onRefresh}
          showSuccess={showSuccess}
          showError={showError}
        />
        <Link
          to={ROUTES.EDIT_LISTING(listing.id)}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium text-text-secondary bg-background-secondary hover:bg-secondary-200 hover:text-text-primary border border-border-light rounded transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>{t("edit")}</span>
        </Link>
      </div>
    </div>
  );
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
  const [bulkMode, setBulkMode] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkValue, setBulkValue] = useState('');
  const [saving, setSaving] = useState(false);
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
  const extraActions = (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
      <div className="flex items-center gap-2.5 sm:gap-3 py-1.5 px-3 rounded bg-background-secondary border border-border-light text-xs">
        <div className="flex flex-col text-left sm:text-right">
          <span className="text-text-muted font-medium">{t("portfolio_performance")}</span>
          <span className="text-sm font-semibold text-text-primary tabular-nums">
            {formatCurrency(totalValueStats.totalVal, 'TRY')}
          </span>
        </div>
        <div className="h-6 w-px bg-border-light hidden sm:block" />
        <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0.5 text-text-secondary">
          <span className="inline-flex items-center gap-1.5 font-medium text-text-primary tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
            {totalValueStats.activeCount} <span className="font-normal text-text-secondary">{t("active")}</span>
          </span>
          <span className="text-border sm:hidden">·</span>
          <span className="tabular-nums text-text-muted">
            {engine.listings?.length || 0} {t("total")}
          </span>
        </div>
      </div>
      <Link
        to={ROUTES.CREATE_LISTING}
        className="inline-flex items-center justify-center gap-1.5 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 sm:h-10 px-3.5 sm:px-4 shrink-0"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        {t("new_listing")}
      </Link>
    </div>
  );

  const topSlot = useMemo(() => {
    const hasLowStock = lowStock && lowStock.count > 0;
    if (!hasLowStock) return null;
    const stockText = `${lowStock.count} listing${lowStock.count === 1 ? '' : 's'}`;
    return (
      <div className="space-y-3">
        <div className="bg-background-primary rounded border border-border-light overflow-hidden">
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-background-secondary/60 transition-colors"
            onClick={lowStock.toggle}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-status-warning" strokeWidth={1.5} aria-hidden />
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h3 className="text-sm font-semibold text-text-primary">{t("inventory_alert")}</h3>
                <span className="text-xs text-text-secondary font-medium tabular-nums">
                  {stockText} {t("needs_attention")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {lowStock.isOpen && !bulkMode && (
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setBulkMode('quantity')}
                    className="inline-flex items-center justify-center rounded text-xs font-medium transition-colors bg-background-secondary text-text-primary hover:bg-secondary-200 border border-border-light h-8 px-3"
                  >
                    {t("batch_stock")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkMode('price')}
                    className="inline-flex items-center justify-center rounded text-xs font-medium transition-colors bg-background-secondary text-text-primary hover:bg-secondary-200 border border-border-light h-8 px-3"
                  >
                    {t("batch_prices")}
                  </button>
                </div>
              )}
              <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${lowStock.isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {lowStock.isOpen && (
            <div className="p-3.5 bg-background-secondary/30 border-t border-border-light">
              {!bulkMode ? (
                <div className={`grid grid-cols-1 ${lowStock.listings.length > 1 ? 'xl:grid-cols-2' : ''} gap-2.5`}>
                  {lowStock.listings.slice(0, 4).map(listing => (
                    <LowStockCard
                      key={listing.id}
                      listing={listing}
                      onRefresh={engine.refresh}
                      showSuccess={showSuccess}
                      showError={showError}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-background-primary rounded border border-border-light">
                    <div className="flex items-center gap-2">
                      {bulkMode === 'quantity' ? (
                        <input
                          type="number"
                          min={1}
                          value={bulkValue}
                          onChange={e => setBulkValue(e.target.value)}
                          placeholder={t("qty")}
                          className="w-24 h-8 px-2.5 text-xs tabular-nums bg-background-secondary border border-border-light rounded outline-none focus:border-primary"
                        />
                      ) : (
                        <PriceInput
                          value={parsePrice(bulkValue)}
                          onChange={n => setBulkValue(n != null ? String(n) : '')}
                          placeholder={t("price")}
                          compact
                          className="w-32 h-8 bg-background-secondary text-xs tabular-nums"
                        />
                      )}
                      <button
                        type="button"
                        onClick={applyBulk}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-1.5 rounded text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-8 px-3"
                      >
                        {t("apply")}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={clearBulk}
                      className="p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto">
                    {listings.map(listing => (
                      <label
                        key={listing.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded border transition-colors cursor-pointer ${selectedIds.has(listing.id) ? 'bg-secondary-light border-primary' : 'bg-background-primary border-border-light hover:border-border'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(listing.id)}
                          onChange={() => toggleSelect(listing.id)}
                          className="w-4 h-4 rounded-sm border-border-light text-primary shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-text-primary truncate">{listing.title}</p>
                          <p className="text-xs text-text-secondary tabular-nums">
                            {t("current")} {bulkMode === 'quantity' ? `${listing.quantity} pcs` : formatCurrency(listing.price, listing.currency)}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [lowStock, bulkMode, bulkValue, selectedIds, saving, applyBulk, clearBulk, listings, toggleSelect, engine.refresh, showSuccess, showError, t]);
  return <div className="min-h-screen bg-background-secondary">
    <ListingsModuleLayout mode="mine" title={t("my_listings")} getListingTypeLabel={getListingTypeLabel} engine={engine} extraActions={extraActions} topSlot={topSlot} disableSticky={true} isSelectable={false} />
  </div>;
};
export default MyListingsPage;
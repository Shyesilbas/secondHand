import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from "react";
import { useEnums } from "../../common/hooks/useEnums.js";
import { X, RotateCcw, SlidersHorizontal } from "lucide-react";
import PriceLocationFields from "./filters/shared/PriceLocationFields.jsx";
import FilterRenderer from "./filters/FilterRenderer.jsx";
import { getListingConfig } from "../config/listingConfig.js";
import { LISTING_STATUSES } from "../types/index.js";

/**
 * browse mode: local draft filters applied on "Apply Filters" click.
 * mine mode: category + status selections fire immediately (no draft needed).
 */
const FilterSidebar = ({
  mode = 'browse',
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onReset,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange
}) => {
  const {
    t
  } = useTranslation();
  const {
    enums,
    isLoading: enumsLoading
  } = useEnums();
  const [localFilters, setLocalFilters] = useState(filters);
  const [mineActiveTab, setMineActiveTab] = useState('category');
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  const handleInputChange = useCallback((field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  const handleCategoryChange = useCallback(category => {
    onCategoryChange(category);
  }, [onCategoryChange]);
  const handleStatusChange = useCallback(status => {
    const next = status === selectedStatus ? null : status;
    onStatusChange?.(next);
  }, [selectedStatus, onStatusChange]);
  const handleReset = useCallback(() => {
    setLocalFilters({});
    onReset();
  }, [onReset]);
  const handleApplyFilters = useCallback(() => {
    if (mode === 'mine') return;
    onFiltersChange(localFilters);
  }, [localFilters, mode, onFiltersChange]);
  const listingConfig = getListingConfig(selectedCategory);
  const filterConfig = listingConfig?.filterConfig;

  // In browse mode, hide category selector if a category is already active
  const showCategorySelector = mode === 'browse' && !selectedCategory;
  if (enumsLoading) {
    return <div className="fixed inset-0 z-50 lg:relative lg:z-auto">
        <div className="fixed inset-0 bg-slate-900/40 lg:hidden" onClick={onClose} />
        <div className="fixed left-0 top-0 h-full w-80 max-w-[calc(100vw-1.25rem)] bg-background-secondary border-r border-border-light/80 flex items-center justify-center shadow-xl shadow-slate-900/10">
          <div className="flex flex-col items-center gap-3 px-6">
            <div className="w-9 h-9 rounded-full border-2 border-primary border-t-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-text-muted">{t("loading_filters")}</p>
          </div>
        </div>
      </div>;
  }
  return <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden transition-opacity" onClick={onClose} />}
      <aside className={`
        fixed left-0 top-0 z-50 flex h-[100dvh] w-80 max-w-[calc(100vw-1.25rem)] flex-col border-r border-border-light/80 bg-background-secondary shadow-xl shadow-slate-900/10
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `} aria-labelledby="listing-filters-title">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-border-light/80 bg-background-primary px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background-secondary text-white shadow-md shadow-indigo-500/25">
                <SlidersHorizontal className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h2 id="listing-filters-title" className="text-lg font-semibold text-text-primary truncate tracking-tight">{t("filters")}</h2>
                <p className="text-xs font-medium text-text-muted">{t("refine_listings_then_apply")}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="shrink-0 rounded-xl border border-transparent p-2 text-text-muted transition-colors hover:bg-secondary-light hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/35 lg:hidden" aria-label={t("close_filters")}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <div className="flex flex-col gap-3">
            {mode === 'mine' ? (/* Mine mode: tabs for category/status */
          <div>
              <div className="mb-3 flex gap-1 rounded-xl bg-secondary-light p-1">
                  {['category', 'status'].map(tab => <button key={tab} type="button" onClick={() => setMineActiveTab(tab)} className={`flex-1 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all capitalize ${mineActiveTab === tab ? 'bg-background-primary text-text-primary shadow-sm ring-1 ring-border-light/70' : 'text-text-muted hover:text-text-primary'}`}>
                      {tab}
                    </button>)}
                </div>
                <div className="space-y-1">
                   {mineActiveTab === 'category' && <>
                      <OptionRow label={t("all_categories")} active={selectedCategory === null} onClick={() => handleCategoryChange(null)} />
                      {(enums?.listingTypes || []).map(type => <OptionRow key={type.value} label={type.label} active={selectedCategory === type.value} onClick={() => handleCategoryChange(type.value)} />)}
                    </>}
                  {mineActiveTab === 'status' && <>
                      <OptionRow label={t("all_statuses")} active={selectedStatus === null} onClick={() => handleStatusChange(null)} />
                      {LISTING_STATUSES.map(s => <OptionRow key={s.value} label={s.label} active={selectedStatus === s.value} onClick={() => handleStatusChange(s.value)} />)}
                    </>}
                </div>
              </div>) : <>
                {/* Category — only when no category is pre-selected */}
                {showCategorySelector && <FilterSection title={t("category")} description="Pick a listing type to unlock specific filters">
                    <div className="flex flex-wrap gap-1.5">
                      <CategoryChip label={t("all")} active={!selectedCategory} onClick={() => onCategoryChange(null)} />
                      {(enums?.listingTypes || []).map(t => {
                  const typeConfig = getListingConfig(t.value);
                  const icon = t.icon ?? typeConfig?.icon ?? '📦';
                  return <CategoryChip key={t.value} label={t.label} icon={icon} active={selectedCategory === t.value} onClick={() => onCategoryChange(t.value)} />;
                })}
                    </div>
                  </FilterSection>}

                {/* Active category label (when category is locked) */}
                {selectedCategory && <div className="flex items-center justify-between rounded-xl border border-border-light/80 bg-background-primary px-3 py-2.5 shadow-sm">
                    <span className="text-sm font-semibold tracking-tight text-slate-800">
                      {listingConfig?.label || selectedCategory}
                    </span>
                    <button type="button" onClick={() => onCategoryChange(null)} className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-indigo-50">{t("change")}</button>
                  </div>}

                <FilterSection title={t("budget_location")} description="Amounts and Turkish city / district">
                  <PriceLocationFields filters={localFilters} onPriceChange={handleInputChange} onInputChange={handleInputChange} compact={true} />
                </FilterSection>

                {/* Category-specific filters */}
                {selectedCategory && filterConfig && <FilterSection title={listingConfig?.label ? `${listingConfig.label}` : 'Category'} description="Fine-tune this listing type">
                    <FilterRenderer config={filterConfig} filters={localFilters} onChange={handleInputChange} enums={enums} title="" />
                  </FilterSection>}

                {selectedCategory && !filterConfig && <div className="rounded-xl border border-dashed border-border-light bg-background-primary px-4 py-6 text-center">
                    <p className="text-sm font-medium text-text-muted">{t("no_extra_filters_for_this_category")}</p>
                  </div>}
              </>}
          </div>
        </div>

        <footer className="flex-shrink-0 border-t border-border-light/80 bg-background-primary px-4 py-3">
          <div className="flex gap-2">
            {mode !== 'mine' && <button type="button" onClick={handleApplyFilters} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/45 focus-visible:ring-offset-2">{t("apply_filters")}</button>}
            <button type="button" onClick={handleReset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-light bg-background-primary px-3 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-background-secondary hover:border-border-DEFAULT focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/35">
              <RotateCcw className="w-4 h-4 shrink-0" />{t("reset")}</button>
          </div>
        </footer>
      </aside>
    </>;
};

/* ── Sub-components ── */

const FilterSection = ({
  title,
  description,
  children
}) => <section className="overflow-hidden rounded-2xl border border-border-light/70 bg-background-primary shadow-sm">
    <div className="border-b border-border-light bg-background-secondary px-4 py-3">
      <h3 className="text-sm font-medium text-text-primary tracking-tight">{title}</h3>
      {description ? <p className="mt-0.5 text-xs font-medium leading-relaxed text-text-muted">{description}</p> : null}
    </div>
    <div className="p-4">{children}</div>
  </section>;
const OptionRow = ({
  label,
  active,
  onClick
}) => <button type="button" onClick={onClick} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${active ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'}`}>
    {label}
  </button>;
const CategoryChip = ({
  label,
  icon,
  active,
  onClick
}) => <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${active ? 'border-primary bg-primary text-white shadow-sm shadow-indigo-500/20' : 'border-transparent bg-background-primary text-text-secondary shadow-sm shadow-slate-900/5 ring-1 ring-border-light hover:bg-background-secondary'}`}>
    {icon && <span className="text-caption">{icon}</span>}
    <span>{label}</span>
  </button>;
export default FilterSidebar;
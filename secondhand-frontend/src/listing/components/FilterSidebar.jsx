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
  onStatusChange,
}) => {
  const { enums, isLoading: enumsLoading } = useEnums();

  const [localFilters, setLocalFilters] = useState(filters);
  const [mineActiveTab, setMineActiveTab] = useState('category');

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = useCallback((field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCategoryChange = useCallback((category) => {
    onCategoryChange(category);
  }, [onCategoryChange]);

  const handleStatusChange = useCallback((status) => {
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
    return (
      <div className="fixed inset-0 z-50 lg:relative lg:z-auto">
        <div className="fixed inset-0 bg-black/40 lg:hidden" onClick={onClose} />
        <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
            <p className="text-[13px] text-gray-400">Loading filters…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      <div className={`
        fixed left-0 top-0 h-screen w-80 bg-white z-50 border-r border-gray-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="border-b border-gray-100 px-4 py-3.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <h2 className="text-[15px] font-semibold text-gray-900">Filters</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 space-y-4">
            {mode === 'mine' ? (
              /* Mine mode: tabs for category/status */
              <div>
                <div className="flex gap-1 p-1 bg-gray-50 rounded-lg mb-3">
                  {['category', 'status'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setMineActiveTab(tab)}
                      className={`flex-1 px-3 py-2 text-[13px] font-medium rounded-md transition-all capitalize ${
                        mineActiveTab === tab
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  {mineActiveTab === 'category' && (
                    <>
                      <OptionRow
                        label="All Categories"
                        active={selectedCategory === null}
                        onClick={() => handleCategoryChange(null)}
                      />
                      {(enums?.listingTypes || []).map((type) => (
                        <OptionRow
                          key={type.value}
                          label={type.label}
                          active={selectedCategory === type.value}
                          onClick={() => handleCategoryChange(type.value)}
                        />
                      ))}
                    </>
                  )}
                  {mineActiveTab === 'status' && (
                    <>
                      <OptionRow
                        label="All Statuses"
                        active={selectedStatus === null}
                        onClick={() => handleStatusChange(null)}
                      />
                      {LISTING_STATUSES.map((s) => (
                        <OptionRow
                          key={s.value}
                          label={s.label}
                          active={selectedStatus === s.value}
                          onClick={() => handleStatusChange(s.value)}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Category — only when no category is pre-selected */}
                {showCategorySelector && (
                  <FilterSection title="Category">
                    <div className="flex flex-wrap gap-1.5">
                      <CategoryChip
                        label="All"
                        active={!selectedCategory}
                        onClick={() => onCategoryChange(null)}
                      />
                      {(enums?.listingTypes || []).map((t) => {
                        const typeConfig = getListingConfig(t.value);
                        const icon = t.icon ?? typeConfig?.icon ?? '📦';
                        return (
                          <CategoryChip
                            key={t.value}
                            label={t.label}
                            icon={icon}
                            active={selectedCategory === t.value}
                            onClick={() => onCategoryChange(t.value)}
                          />
                        );
                      })}
                    </div>
                  </FilterSection>
                )}

                {/* Active category label (when category is locked) */}
                {selectedCategory && (
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-[13px] font-semibold text-gray-700">
                      {listingConfig?.label || selectedCategory}
                    </span>
                    <button
                      onClick={() => onCategoryChange(null)}
                      className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Price & Location */}
                <FilterSection title="Price & Location">
                  <PriceLocationFields
                    filters={localFilters}
                    onPriceChange={handleInputChange}
                    onInputChange={handleInputChange}
                    compact={true}
                  />
                </FilterSection>

                {/* Category-specific filters */}
                {selectedCategory && filterConfig && (
                  <FilterSection title={`${listingConfig?.label || ''} Filters`}>
                    <FilterRenderer
                      config={filterConfig}
                      filters={localFilters}
                      onChange={handleInputChange}
                      title=""
                    />
                  </FilterSection>
                )}

                {selectedCategory && !filterConfig && (
                  <div className="py-4 text-center">
                    <p className="text-[13px] text-gray-400">No additional filters for this category.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-100 px-4 py-3 flex-shrink-0">
          <div className="flex gap-2">
            {mode !== 'mine' && (
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-[13px] font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Apply
              </button>
            )}
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-gray-500 text-[13px] font-medium hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Sub-components ── */

const FilterSection = ({ title, children }) => (
  <div>
    <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5 px-0.5">{title}</h3>
    {children}
  </div>
);

const OptionRow = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full px-3 py-2.5 rounded-lg text-left transition-colors text-[13px] font-medium ${
      active
        ? 'bg-gray-900 text-white'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {label}
  </button>
);

const CategoryChip = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
      active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {icon && <span className="text-[11px]">{icon}</span>}
    <span>{label}</span>
  </button>
);

export default FilterSidebar;

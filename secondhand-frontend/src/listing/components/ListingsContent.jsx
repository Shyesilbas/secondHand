import { useTranslation } from "react-i18next";
import React from 'react';
import ListingGrid from './ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import FilterStatus from './FilterStatus.jsx';
import ListingsSkeleton from './ListingsSkeleton.jsx';
import { EmptyState } from '../../common/components/ui/index.js';
import { PackageSearch } from 'lucide-react';

const ListingsContent = React.memo(({
  isLoading,
  filteredListings,
  error,
  totalPages,
  currentPage,
  onPageChange,
  totalElements,
  filters,
  getListingTypeLabel,
  onResetFilters,
  updateFilters,
  hasActiveFilters = false,
  searchTerm,
  searchMode,
  onListingChanged,
  isSelectable = false,
  selectedIds = new Set(),
  onToggleSelect = null
}) => {
  const { t } = useTranslation();
  const hasSearch = Boolean(searchTerm) && searchMode !== 'none';
  const categoryLabel = getListingTypeLabel?.(filters?.listingType) || '';

  const isFiltering = hasActiveFilters || (filters && Object.keys(filters).some(key => {
    if (['page', 'size', 'listingType', 'type', 'status', 'sortBy', 'sortDirection'].includes(key)) return false;
    const v = filters[key];
    return Array.isArray(v) ? v.length > 0 : (v !== null && v !== undefined && v !== '' && v !== 0 && v !== false);
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[60vh]">
      {!isLoading && (!searchTerm || searchMode === 'none') && (
        <div className="mb-6">
          <FilterStatus
            totalElements={totalElements}
            filters={filters}
            getListingTypeLabel={getListingTypeLabel}
            onResetFilters={onResetFilters}
            updateFilters={updateFilters}
            hasActiveFilters={isFiltering}
          />
        </div>
      )}

      {isLoading ? (
        <ListingsSkeleton />
      ) : filteredListings && filteredListings.length === 0 ? (
        <div className="flex items-center justify-center min-h-80 py-12">
          <div className="max-w-md w-full">
            <EmptyState
              icon={PackageSearch}
              title={
                hasSearch
                  ? t("no_results_found", "Arama sonucu bulunamadı")
                  : isFiltering
                  ? t("no_matching_listings_title", "Eşleşen ilan bulunamadı")
                  : t("nothing_here_yet", "Henüz ilan bulunmuyor")
              }
              description={
                hasSearch
                  ? t("try_different_keywords", "Farklı anahtar kelimeler deneyebilir veya filtreleri kaldırabilirsiniz.")
                  : isFiltering
                  ? t("try_adjusting_filters", "Seçili filtrelere uygun ilan bulunamadı. Filtreleri temizleyerek veya kriterlerinizi genişleterek tekrar deneyebilirsiniz.")
                  : categoryLabel
                  ? t("no_listings_in_category", {
                      defaultValue: `${categoryLabel} kategorisinde şu anda aktif ilan bulunmuyor.`
                    })
                  : t("no_listings_available", "Şu anda listelenen aktif ilan bulunmuyor.")
              }
              primaryAction={
                (isFiltering || hasSearch) && onResetFilters
                  ? {
                      label: t("clear_filters", "Filtreleri Temizle"),
                      onClick: onResetFilters
                    }
                  : undefined
              }
              className="w-full"
            />
          </div>
        </div>
      ) : (
        <ListingGrid
          listings={filteredListings}
          isLoading={isLoading}
          error={error}
          onDeleted={onListingChanged}
          isSelectable={isSelectable}
          selectedIds={selectedIds}
          onSelectToggle={onToggleSelect}
        />
      )}

      {!isLoading && (!searchTerm || searchMode === 'none') && totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <div className="bg-background-primary border border-border-light rounded p-1.5">
            <Pagination page={currentPage || 0} totalPages={totalPages || 0} onPageChange={onPageChange} />
          </div>
        </div>
      )}
    </div>
  );
});

export default ListingsContent;
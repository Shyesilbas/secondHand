import { useTranslation } from "react-i18next";
import React from 'react';
import ListingGrid from './ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import FilterStatus from './FilterStatus.jsx';
import ListingsSkeleton from './ListingsSkeleton.jsx';
import { EmptyState } from '../../common/components/ui/index.js';
import { PackageSearch, SlidersHorizontal, RefreshCw } from 'lucide-react';
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
  searchTerm,
  searchMode,
  onListingChanged,
  isSelectable = false,
  selectedIds = new Set(),
  onToggleSelect = null
}) => {
  const { t } = useTranslation();
  const hasSearch = Boolean(searchTerm) && searchMode !== 'none';
  const categoryLabel = getListingTypeLabel?.(filters.listingType) || 'this category';
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
            {!isLoading && (!searchTerm || searchMode === 'none') && <div className="mb-8">
                    <FilterStatus totalElements={totalElements} filters={filters} getListingTypeLabel={getListingTypeLabel} onResetFilters={onResetFilters} updateFilters={updateFilters} />
                </div>}

            {isLoading ? <ListingsSkeleton /> : filteredListings && filteredListings.length === 0 ? <div className="flex items-center justify-center min-h-[380px] py-8">
                    <div className="max-w-md w-full">
                        <EmptyState
                            icon={PackageSearch}
                            title={hasSearch ? t("no_results_found", "No results found") : t("nothing_here_yet", "Nothing here yet")}
                            description={hasSearch ? t("try_different_keywords", "Try different keywords or remove some filters to see more results.") : t("no_listings_in_category", { defaultValue: `No listings in ${categoryLabel} right now. Try a different category or check back soon.` })}
                            primaryAction={onResetFilters ? {
                                label: t("reset_filters"),
                                onClick: onResetFilters
                            } : undefined}
                            className="w-full"
                        />
                    </div>
                </div> : <ListingGrid listings={filteredListings} isLoading={isLoading} error={error} onDeleted={onListingChanged} isSelectable={isSelectable} selectedIds={selectedIds} onSelectToggle={onToggleSelect} />}
            
            {!isLoading && (!searchTerm || searchMode === 'none') && totalPages > 1 && <div className="mt-10 flex justify-center">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-1.5">
                        <Pagination page={currentPage || 0} totalPages={totalPages || 0} onPageChange={onPageChange} />
                    </div>
                </div>}
        </div>;
});
export default ListingsContent;
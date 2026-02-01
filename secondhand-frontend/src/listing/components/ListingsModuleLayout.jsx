import React, { useCallback } from 'react';
import FilterSidebar from './FilterSidebar.jsx';
import ListingsNavigation from './ListingsNavigation.jsx';
import ListingsContent from './ListingsContent.jsx';
import { ShoppingBag } from 'lucide-react';

const ListingsModuleLayout = ({
  mode = 'browse',
  engine,
  getListingTypeLabel,
  onListingChanged,
  title,
  icon,
  extraActions,
  topSlot,
}) => {
  const handleListingChanged = useCallback(() => {
    onListingChanged?.();
    engine?.refresh?.();
  }, [engine, onListingChanged]);

  if (!engine) return null;

  return (
    <div className="min-h-screen bg-background-secondary/50 relative">
      <FilterSidebar
        mode={mode}
        isOpen={engine.showFilterSidebar}
        onClose={engine.closeFilterSidebar}
        filters={engine.filters}
        onFiltersChange={engine.updateFilters}
        onReset={engine.resetFilters}
        selectedCategory={engine.selectedCategory}
        onCategoryChange={engine.onCategoryChange}
        selectedStatus={engine.mine?.status || null}
        onStatusChange={engine.mine?.setStatus}
      />

      <div className={`flex flex-col min-w-0 transition-all duration-300 ${engine.showFilterSidebar ? 'lg:ml-80' : ''}`}>
        <ListingsNavigation
          totalElements={engine.totalElements}
          selectedCategory={engine.selectedCategory}
          filters={engine.filters}
          getListingTypeLabel={getListingTypeLabel}
          hasActiveFilters={engine.hasActiveFilters}
          onToggleFilterSidebar={engine.toggleFilterSidebar}
          engineSearch={engine.search}
          filteredListings={engine.filteredListings}
          title={title || (mode === 'mine' ? 'My Listings' : 'Browse Listings')}
          icon={icon || <ShoppingBag className="w-6 h-6 text-white" />}
          extraActions={extraActions}
          topSlot={topSlot}
        >
          {({ filteredListings, searchTerm, searchMode }) => (
            <ListingsContent
              isLoading={engine.isLoading}
              filteredListings={filteredListings}
              error={engine.error}
              totalPages={engine.totalPages}
              currentPage={engine.currentPage}
              onPageChange={engine.handlePageChange}
              totalElements={engine.totalElements}
              filters={engine.filters}
              getListingTypeLabel={getListingTypeLabel}
              onResetFilters={engine.resetFilters}
              updateFilters={engine.updateFilters}
              searchTerm={searchTerm}
              searchMode={searchMode}
              onListingChanged={handleListingChanged}
            />
          )}
        </ListingsNavigation>
      </div>
    </div>
  );
};

export default ListingsModuleLayout;


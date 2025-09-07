/**
 * Centralized exports for the listing package
 * This file provides a clean API for importing listing-related functionality
 */

// Core types and constants
export * from './types/index.js';

// Main configuration
export * from './config/listingConfig.js';

// Hooks
export { useListingData, useListingsData } from './hooks/useListingData.js';
export { useAdvancedListings } from './hooks/useAdvancedListings.js';
export { useListingFilters } from './hooks/useListingFilters.js';
export { useListingStatistics } from './hooks/useListingStatistics.js';
export { useMyListings } from './hooks/useMyListings.js';
export { usePriceHistory } from './hooks/usePriceHistory.js';

// Services
export { listingService } from './services/listingService.js';
export { priceHistoryService } from './services/priceHistoryService.js';

// Main components
export { default as ListingCard } from './components/ListingCard.jsx';
export { default as ListingCardActions } from './components/ListingCardActions.jsx';
export { default as ListingGrid } from './components/ListingGrid.jsx';
export { default as AdvancedFilters } from './components/AdvancedFilters.jsx';
export { default as CategorySelector } from './components/CategorySelector.jsx';
export { default as FilterStatus } from './components/FilterStatus.jsx';
export { default as ListingCategories } from './components/ListingCategories.jsx';
export { default as ListingSearch } from './components/ListingSearch.jsx';
export { default as ListingStats } from './components/ListingStats.jsx';
export { default as ListingWizard } from './components/ListingWizard.jsx';
export { default as PageHeader } from './components/PageHeader.jsx';
export { default as SearchResult } from './components/SearchResult.jsx';
export { default as PriceHistoryModal } from './components/PriceHistoryModal.jsx';

// Form components
export { renderEditForm } from './components/EditFormRenderer.jsx';

// Filter components
export { default as FilterRenderer } from './components/filters/FilterRenderer.jsx';
export { default as FiltersHeader } from './components/filters/shared/FiltersHeader.jsx';
export { default as PriceLocationFields } from './components/filters/shared/PriceLocationFields.jsx';
export { default as SortingControls } from './components/filters/shared/SortingControls.jsx';

// Detail components
export { default as VehicleDetails } from './components/details/VehicleDetails.jsx';
export { default as ElectronicsDetails } from './components/details/ElectronicsDetails.jsx';
export { default as RealEstateDetails } from './components/details/RealEstateDetails.jsx';
export { default as ClothingDetails } from './components/details/ClothingDetails.jsx';
export { default as BooksDetails } from './components/details/BooksDetails.jsx';
export { default as SportsDetails } from './components/details/SportsDetails.jsx';

// Pages
export { default as CreateListingPage } from './pages/CreateListingPage.jsx';
export { default as EditListingPage } from './pages/EditListingPage.jsx';
export { default as ListingDetailPage } from './pages/ListingDetailPage.jsx';
export { default as ListingsPage } from './pages/ListingsPage.jsx';
export { default as MyListingsPage } from './pages/MyListingsPage.jsx';

// Legacy exports for backward compatibility (will be removed in future versions)
export { listingTypeRegistry, createFormRegistry } from './components/typeRegistry.js';
export { filtersRegistry } from './components/filters/filtersRegistry.js';

// DTOs and utility functions from listings.js
export * from './listings.js';

/**
 * Service Adapter Factory
 * Converts existing services to generic interface for use with generic hooks
 */

/**
 * Create Vehicle Service Adapter
 * Maps vehicle service methods to generic interface
 */
export const createVehicleServiceAdapter = (vehicleService) => ({
  // CRUD operations
  getEntityById: vehicleService.getVehicleById,
  createEntity: vehicleService.createVehicleListing,
  updateEntity: vehicleService.updateVehicleListing,
  deleteEntity: vehicleService.deleteVehicleListing,
  
  // Search operations
  filterEntities: vehicleService.searchVehicles,
  searchByCriteria: vehicleService.findVehiclesByBrandAndModel
});

/**
 * Create Real Estate Service Adapter
 * Maps real estate service methods to generic interface
 */
export const createRealEstateServiceAdapter = (realEstateService) => ({
  // CRUD operations
  getEntityById: realEstateService.getRealEstateById,
  createEntity: realEstateService.createRealEstateListing,
  updateEntity: realEstateService.updateRealEstateListing,
  deleteEntity: realEstateService.deleteRealEstateListing,
  
  // Search operations
  filterEntities: realEstateService.filterRealEstates
});

/**
 * Create Electronics Service Adapter
 * Maps electronics service methods to generic interface
 */
export const createElectronicsServiceAdapter = (electronicService) => ({
  // CRUD operations
  getEntityById: electronicService.getElectronicById,
  createEntity: electronicService.createElectronicListing,
  updateEntity: electronicService.updateElectronicListing,
  deleteEntity: electronicService.deleteElectronicListing,
  
  // Search operations
  filterEntities: electronicService.filterElectronics,
  searchByCriteria: electronicService.findElectronicsByType
});

/**
 * Create Books Service Adapter
 * Maps books service methods to generic interface
 */
export const createBooksServiceAdapter = (booksService) => ({
  // CRUD operations
  getEntityById: booksService.getBooksDetails,
  createEntity: booksService.createBooksListing,
  updateEntity: booksService.updateBooksListing,
  deleteEntity: booksService.deleteBooksListing,
  
  // Search operations
  filterEntities: booksService.filterBooks
});

/**
 * Create Sports Service Adapter
 * Maps sports service methods to generic interface
 */
export const createSportsServiceAdapter = (sportsService) => ({
  // CRUD operations
  getEntityById: sportsService.getSportsDetails,
  createEntity: sportsService.createSportsListing,
  updateEntity: sportsService.updateSportsListing,
  deleteEntity: sportsService.deleteSportsListing,
  
  // Search operations
  filterEntities: sportsService.filterSports
});

/**
 * Create Clothing Service Adapter
 * Maps clothing service methods to generic interface
 */
export const createClothingServiceAdapter = (clothingService) => ({
  // CRUD operations
  getEntityById: clothingService.getClothingDetails,
  createEntity: clothingService.createClothingListing,
  updateEntity: clothingService.updateClothingListing,
  deleteEntity: clothingService.deleteClothingListing,
  
  // Search operations
  filterEntities: clothingService.filterClothing
});

/**
 * Create Listing Service Adapter
 * Maps listing service methods to generic interface
 */
export const createListingServiceAdapter = (listingService) => ({
  // CRUD operations
  getEntityById: listingService.getListingById,
  createEntity: listingService.createListing,
  updateEntity: listingService.updateListing,
  deleteEntity: listingService.deleteListing,
  
  // Search operations
  filterEntities: listingService.filterListings
});

/**
 * Generic Service Adapter Factory
 * Creates adapter for any service with custom mappings
 */
export const createServiceAdapter = (service, mappings) => {
  const adapter = {};
  Object.entries(mappings).forEach(([key, value]) => {
    adapter[key] = service[value];
  });
  return adapter;
};

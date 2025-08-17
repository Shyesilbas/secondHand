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


export const createVehicleServiceAdapter = (vehicleService) => ({
    getEntityById: vehicleService.getVehicleById,
  createEntity: vehicleService.createVehicleListing,
  updateEntity: vehicleService.updateVehicleListing,
  deleteEntity: vehicleService.deleteVehicleListing,
  
    filterEntities: vehicleService.searchVehicles,
  searchByCriteria: vehicleService.findVehiclesByBrandAndModel
});

export const createRealEstateServiceAdapter = (realEstateService) => ({
    getEntityById: realEstateService.getRealEstateById,
  createEntity: realEstateService.createRealEstateListing,
  updateEntity: realEstateService.updateRealEstateListing,
  deleteEntity: realEstateService.deleteRealEstateListing,
  
    filterEntities: realEstateService.filterRealEstates
});

export const createElectronicsServiceAdapter = (electronicService) => ({
    getEntityById: electronicService.getElectronicById,
  createEntity: electronicService.createElectronicListing,
  updateEntity: electronicService.updateElectronicListing,
  deleteEntity: electronicService.deleteElectronicListing,
  
    filterEntities: electronicService.filterElectronics,
  searchByCriteria: electronicService.findElectronicsByType
});

export const createBooksServiceAdapter = (booksService) => ({
    getEntityById: booksService.getBooksDetails,
  createEntity: booksService.createBooksListing,
  updateEntity: booksService.updateBooksListing,
  deleteEntity: booksService.deleteBooksListing,
  
    filterEntities: booksService.filterBooks
});

export const createSportsServiceAdapter = (sportsService) => ({
    getEntityById: sportsService.getSportsDetails,
  createEntity: sportsService.createSportsListing,
  updateEntity: sportsService.updateSportsListing,
  deleteEntity: sportsService.deleteSportsListing,
  
    filterEntities: sportsService.filterSports
});

export const createClothingServiceAdapter = (clothingService) => ({
    getEntityById: clothingService.getClothingDetails,
  createEntity: clothingService.createClothingListing,
  updateEntity: clothingService.updateClothingListing,
  deleteEntity: clothingService.deleteClothingListing,
  
    filterEntities: clothingService.filterClothing
});

export const createListingServiceAdapter = (listingService) => ({
    getEntityById: listingService.getListingById,
  createEntity: listingService.createListing,
  updateEntity: listingService.updateListing,
  deleteEntity: listingService.deleteListing,
  
    filterEntities: listingService.filterListings
});

export const createServiceAdapter = (service, mappings) => {
  const adapter = {};
  Object.entries(mappings).forEach(([key, value]) => {
    adapter[key] = service[value];
  });
  return adapter;
};

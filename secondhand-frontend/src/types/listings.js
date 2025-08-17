export const ListingDTO = {
  id: '',
  listingNo: '',
  title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  status: '',
  city: '',
  district: '',
  sellerName: '',
  sellerSurname: '',
  sellerId: 0,
  type: '', // VEHICLE, ELECTRONICS, etc.
  createdAt: '',
  updatedAt: '',
};

export const ListingFilterDTO = {
  type: '',
  listingType: '',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',
  
  brands: [],
  minYear: 0,
  maxYear: 0,
  maxMileage: 0,
  fuelTypes: [],
  colors: [],
  doors: '',
  gearTypes: [],
  seatCounts: [],
  
  electronicTypes: [],
  electronicBrands: [],
  
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  
  page: 0,
  size: 20,
};

// Vehicle-specific filter DTO
export const VehicleListingFilterDTO = {
  type: 'VEHICLE',
  listingType: 'VEHICLE',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',
  
  // Vehicle-specific filters
  brands: [],
  minYear: 0,
  maxYear: 0,
  maxMileage: 0,
  fuelTypes: [],
  colors: [],
  doors: '',
  gearTypes: [],
  seatCounts: [],
  
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  
  page: 0,
  size: 20,
};

// Electronics-specific filter DTO
export const ElectronicListingFilterDTO = {
  type: 'ELECTRONICS',
  listingType: 'ELECTRONICS',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',
  
  // Electronics-specific filters
  electronicTypes: [],
  electronicBrands: [],
  minYear: 0,
  maxYear: 0,
  colors: [],
  
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  
  page: 0,
  size: 20,
};

// Real Estate-specific filter DTO
export const RealEstateListingFilterDTO = {
  type: 'REAL_ESTATE',
  listingType: 'REAL_ESTATE',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',
  
  // Real Estate-specific filters
  adType: '',
  realEstateTypes: [],
  heatingTypes: [],
  ownerType: '',
  minSquareMeters: 0,
  maxSquareMeters: 0,
  minRoomCount: 0,
  maxRoomCount: 0,
  minBathroomCount: 0,
  maxBathroomCount: 0,
  floor: 0,
  minBuildingAge: 0,
  maxBuildingAge: 0,
  furnished: false,
  
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  
  page: 0,
  size: 20,
};

// Clothing-specific filter DTO
export const ClothingListingFilterDTO = {
  type: 'CLOTHING',
  listingType: 'CLOTHING',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',
  
  // Clothing-specific filters
  brands: [],
  types: [],
  colors: [],
  conditions: [],
  minPurchaseDate: null,
  maxPurchaseDate: null,
  
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  
  page: 0,
  size: 20,
};

// Listing Statistics DTO
export const ListingStatisticsDTO = {
  totalListings: 0,
  activeListings: 0,
  activeSellerCount: 0,
  activeCityCount: 0,
};

// Listing Response DTO (for general listings)
export const ListingResponseDTO = {
  id: '',
  listingNo: '',
  title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  status: '',
  city: '',
  district: '',
  sellerName: '',
  sellerSurname: '',
  sellerId: 0,
  type: '', // VEHICLE, ELECTRONICS, etc.
  createdAt: '',
  updatedAt: '',
};

/**
 * Create Vehicle Filter Request DTO with validation
 * @param {Object} data - Filter data
 * @returns {Object} - Validated Vehicle Filter DTO
 */
export const createVehicleFilterRequest = (data) => {
  return {
    type: 'VEHICLE',
    listingType: 'VEHICLE',
    status: data.status || 'ACTIVE',
    city: data.city?.trim() || '',
    district: data.district?.trim() || '',
    minPrice: parseFloat(data.minPrice) || null,
    maxPrice: parseFloat(data.maxPrice) || null,
    currency: data.currency || 'TRY',
    
    // Vehicle specific filters
    brands: Array.isArray(data.brands) ? data.brands : [],
    minYear: parseInt(data.minYear) || null,
    maxYear: parseInt(data.maxYear) || null,
    maxMileage: parseInt(data.maxMileage) || null,
    fuelTypes: Array.isArray(data.fuelTypes) ? data.fuelTypes : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
    doors: data.doors || null,
    gearTypes: Array.isArray(data.gearTypes) ? data.gearTypes : [],
    seatCounts: Array.isArray(data.seatCounts) ? data.seatCounts : [],
    
    // Sorting
    sortBy: data.sortBy || 'createdAt',
    sortDirection: data.sortDirection || 'DESC',
    
    // Pagination
    page: parseInt(data.page) || 0,
    size: parseInt(data.size) || 20,
  };
};

/**
 * Create Electronics Filter Request DTO with validation
 * @param {Object} data - Filter data
 * @returns {Object} - Validated Electronics Filter DTO
 */
export const createElectronicsFilterRequest = (data) => {
  return {
    type: 'ELECTRONICS',
    listingType: 'ELECTRONICS',
    status: data.status || 'ACTIVE',
    city: data.city?.trim() || '',
    district: data.district?.trim() || '',
    minPrice: parseFloat(data.minPrice) || null,
    maxPrice: parseFloat(data.maxPrice) || null,
    currency: data.currency || 'TRY',
    
    // Electronics specific filters
    electronicTypes: Array.isArray(data.electronicTypes) ? data.electronicTypes : [],
    electronicBrands: Array.isArray(data.electronicBrands) ? data.electronicBrands : [],
    minYear: parseInt(data.minYear) || null,
    maxYear: parseInt(data.maxYear) || null,
    colors: Array.isArray(data.colors) ? data.colors : [],
    
    // Sorting
    sortBy: data.sortBy || 'createdAt',
    sortDirection: data.sortDirection || 'DESC',
    
    // Pagination
    page: parseInt(data.page) || 0,
    size: parseInt(data.size) || 20,
  };
};

/**
 * Create Real Estate Filter Request DTO with validation
 * @param {Object} data - Filter data
 * @returns {Object} - Validated Real Estate Filter DTO
 */
export const createRealEstateFilterRequest = (data) => {
  return {
    type: 'REAL_ESTATE',
    listingType: 'REAL_ESTATE',
    status: data.status || 'ACTIVE',
    city: data.city?.trim() || '',
    district: data.district?.trim() || '',
    minPrice: parseFloat(data.minPrice) || null,
    maxPrice: parseFloat(data.maxPrice) || null,
    currency: data.currency || 'TRY',
    
    // Real Estate specific filters
    adType: data.adType || null,
    realEstateTypes: Array.isArray(data.realEstateTypes) ? data.realEstateTypes : [],
    heatingTypes: Array.isArray(data.heatingTypes) ? data.heatingTypes : [],
    ownerType: data.ownerType || null,
    minSquareMeters: parseInt(data.minSquareMeters) || null,
    maxSquareMeters: parseInt(data.maxSquareMeters) || null,
    minRoomCount: parseInt(data.minRoomCount) || null,
    maxRoomCount: parseInt(data.maxRoomCount) || null,
    minBathroomCount: parseInt(data.minBathroomCount) || null,
    maxBathroomCount: parseInt(data.maxBathroomCount) || null,
    floor: parseInt(data.floor) || null,
    minBuildingAge: parseInt(data.minBuildingAge) || null,
    maxBuildingAge: parseInt(data.maxBuildingAge) || null,
    furnished: Boolean(data.furnished),
    
    // Sorting
    sortBy: data.sortBy || 'createdAt',
    sortDirection: data.sortDirection || 'DESC',
    
    // Pagination
    page: parseInt(data.page) || 0,
    size: parseInt(data.size) || 20,
  };
};


export const ListingDTO = {
  id: '',
  listingNo: '',
  title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  status: '',
  isListingFeePaid: false,
  city: '',
  district: '',
  sellerName: '',
  sellerSurname: '',
  sellerId: 0,
  type: '',
  createdAt: '',
  updatedAt: '',
};

export const ListingFilterDTO = {
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
 * Create Listing Filter DTO with validation
 * @param {Object} data - Filter data
 * @returns {Object} - Validated DTO
 */
export const createListingFilterRequest = (data) => {
  return {
    listingType: data.listingType || null,
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
    
    // Electronics specific filters
    electronicTypes: Array.isArray(data.electronicTypes) ? data.electronicTypes : [],
    electronicBrands: Array.isArray(data.electronicBrands) ? data.electronicBrands : [],
    
    // Sorting
    sortBy: data.sortBy || 'createdAt',
    sortDirection: data.sortDirection || 'DESC',
    
    // Pagination
    page: parseInt(data.page) || 0,
    size: parseInt(data.size) || 20,
  };
};
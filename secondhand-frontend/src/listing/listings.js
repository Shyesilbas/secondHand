export const ListingDTO = {
  id: '',
  listingNo: '',
  title: '',
  description: '',
  price: 0,
  currency: '',
  status: '',
  city: '',
  district: '',
  sellerName: '',
  sellerSurname: '',
  sellerId: 0,
  type: '',   createdAt: '',
  updatedAt: '',
};


export const BooksListingFilterDTO = {
  type: 'BOOKS',
  listingType: 'BOOKS',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: '',
  genres: [],
  languages: [],
  formats: [],
  conditions: [],
  minYear: 0,
  maxYear: 0,
  minPageCount: 0,
  maxPageCount: 0,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  page: 0,
  size: 10,
};

export const SportsListingFilterDTO = {
  type: 'SPORTS',
  listingType: 'SPORTS',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: '',
  disciplines: [],
  equipmentTypes: [],
  conditions: [],
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  page: 0,
  size: 10,
};

export const ListingFilterDTO = {
  type: '',
  listingType: '',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: '',
  
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
  size: 10,
};

export const VehicleListingFilterDTO = {
  type: 'VEHICLE',
  listingType: 'VEHICLE',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: '',
  
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
  size: 10,
};

export const ElectronicListingFilterDTO = {
  type: 'ELECTRONICS',
  listingType: 'ELECTRONICS',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: '',
  
    electronicTypes: [],
  electronicBrands: [],
  minYear: 0,
  maxYear: 0,
  colors: [],
  
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  
  page: 0,
  size: 10,
};

export const RealEstateListingFilterDTO = {
  type: 'REAL_ESTATE',
  listingType: 'REAL_ESTATE',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: '',
  
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
  size: 10,
};

export const ClothingListingFilterDTO = {
  type: 'CLOTHING',
  listingType: 'CLOTHING',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: '',
  
    brands: [],
  types: [],
  colors: [],
  conditions: [],
  minPurchaseDate: null,
  maxPurchaseDate: null,
  
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  
  page: 0,
  size: 10,
};

export const ListingStatisticsDTO = {
  totalListings: 0,
  activeListings: 0,
  activeSellerCount: 0,
  activeCityCount: 0,
};

export const ListingResponseDTO = {
  id: '',
  listingNo: '',
  title: '',
  description: '',
  price: 0,
  currency: '',
  status: '',
  city: '',
  district: '',
  sellerName: '',
  sellerSurname: '',
  sellerId: 0,
  type: '',   createdAt: '',
  updatedAt: '',
};

export const createVehicleFilterRequest = (data) => {
  const payload = {
    type: 'VEHICLE',
    listingType: 'VEHICLE',
    status: data.status || 'ACTIVE',
    city: data.city?.trim() || '',
    district: data.district?.trim() || '',
    minPrice: parseFloat(data.minPrice) || null,
    maxPrice: parseFloat(data.maxPrice) || null,
        brands: Array.isArray(data.brands) ? data.brands : [],
    minYear: parseInt(data.minYear) || null,
    maxYear: parseInt(data.maxYear) || null,
    maxMileage: parseInt(data.maxMileage) || null,
    fuelTypes: Array.isArray(data.fuelTypes) ? data.fuelTypes : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
    doors: data.doors || null,
    gearTypes: Array.isArray(data.gearTypes) ? data.gearTypes : [],
    seatCounts: Array.isArray(data.seatCounts) ? data.seatCounts : [],
        sortBy: data.sortBy || 'createdAt',
    sortDirection: data.sortDirection || 'DESC',
        page: parseInt(data.page) || 0,
    size: parseInt(data.size) || 20,
  };
  if (data.currency) payload.currency = data.currency;
  return payload;
};

export const createElectronicsFilterRequest = (data) => {
  const payload = {
    type: 'ELECTRONICS',
    listingType: 'ELECTRONICS',
    status: data.status || 'ACTIVE',
    city: data.city?.trim() || '',
    district: data.district?.trim() || '',
    minPrice: parseFloat(data.minPrice) || null,
    maxPrice: parseFloat(data.maxPrice) || null,
        electronicTypes: Array.isArray(data.electronicTypes) ? data.electronicTypes : [],
    electronicBrands: Array.isArray(data.electronicBrands) ? data.electronicBrands : [],
    minYear: parseInt(data.minYear) || null,
    maxYear: parseInt(data.maxYear) || null,
    colors: Array.isArray(data.colors) ? data.colors : [],
        sortBy: data.sortBy || 'createdAt',
    sortDirection: data.sortDirection || 'DESC',
        page: parseInt(data.page) || 0,
    size: parseInt(data.size) || 20,
  };
  if (data.currency) payload.currency = data.currency;
  return payload;
};

export const createRealEstateFilterRequest = (data) => {
  const payload = {
    type: 'REAL_ESTATE',
    listingType: 'REAL_ESTATE',
    status: data.status || 'ACTIVE',
    city: data.city?.trim() || '',
    district: data.district?.trim() || '',
    minPrice: parseFloat(data.minPrice) || null,
    maxPrice: parseFloat(data.maxPrice) || null,
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
        sortBy: data.sortBy || 'createdAt',
    sortDirection: data.sortDirection || 'DESC',
        page: parseInt(data.page) || 0,
    size: parseInt(data.size) || 20,
  };
  if (data.currency) payload.currency = data.currency;
  return payload;
};

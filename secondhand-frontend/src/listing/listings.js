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
  
  brandIds: [],
  brands: [],
  minYear: 0,
  maxYear: 0,
  maxMileage: 0,
  fuelTypes: [],
  colors: [],
  doors: '',
  gearTypes: [],
  seatCounts: [],
  
  electronicTypeIds: [],
  electronicBrandIds: [],
  
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
  
    brandIds: [],
  minYear: 0,
  maxYear: 0,
  maxMileage: 0,
  fuelTypes: [],
  colors: [],
  doors: '',
  gearTypes: [],
  seatCounts: [],
  drivetrains: [],
  bodyTypes: [],
  
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
  
    electronicTypeIds: [],
  electronicBrandIds: [],
  minYear: 0,
  maxYear: 0,
  colors: [],
  minRam: 0,
  maxRam: 0,
  minStorage: 0,
  maxStorage: 0,
  processors: [],
  minScreenSize: 0,
  maxScreenSize: 0,
  
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
  
    adTypeId: '',
  realEstateTypeIds: [],
  heatingTypeIds: [],
  ownerTypeId: '',
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
  clothingGenders: [],
  clothingCategories: [],
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
        brandIds: Array.isArray(data.brandIds) ? data.brandIds : [],
    minYear: parseInt(data.minYear) || null,
    maxYear: parseInt(data.maxYear) || null,
    maxMileage: parseInt(data.maxMileage) || null,
    fuelTypes: Array.isArray(data.fuelTypes) ? data.fuelTypes : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
    doors: data.doors || null,
    gearTypes: Array.isArray(data.gearTypes) ? data.gearTypes : [],
    seatCounts: Array.isArray(data.seatCounts) ? data.seatCounts : [],
    drivetrains: Array.isArray(data.drivetrains) ? data.drivetrains : [],
    bodyTypes: Array.isArray(data.bodyTypes) ? data.bodyTypes : [],
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
        electronicTypeIds: Array.isArray(data.electronicTypeIds) ? data.electronicTypeIds : [],
    electronicBrandIds: Array.isArray(data.electronicBrandIds) ? data.electronicBrandIds : [],
    minYear: parseInt(data.minYear) || null,
    maxYear: parseInt(data.maxYear) || null,
    colors: Array.isArray(data.colors) ? data.colors : [],
    minRam: data.minRam ? parseInt(data.minRam) : null,
    maxRam: data.maxRam ? parseInt(data.maxRam) : null,
    minStorage: data.minStorage ? parseInt(data.minStorage) : null,
    maxStorage: data.maxStorage ? parseInt(data.maxStorage) : null,
    processors: Array.isArray(data.processors) ? data.processors : [],
    minScreenSize: data.minScreenSize ? parseInt(data.minScreenSize) : null,
    maxScreenSize: data.maxScreenSize ? parseInt(data.maxScreenSize) : null,
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
        adTypeId: data.adTypeId || null,
    realEstateTypeIds: Array.isArray(data.realEstateTypeIds) ? data.realEstateTypeIds : [],
    heatingTypeIds: Array.isArray(data.heatingTypeIds) ? data.heatingTypeIds : [],
    ownerTypeId: data.ownerTypeId || null,
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

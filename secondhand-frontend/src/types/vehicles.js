/**
 * Vehicle Related DTOs
 */

// Vehicle Create Request DTO
export const VehicleCreateRequestDTO = {
  // Basic Info
  title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  city: '',
  district: '',
  
  // Vehicle Specs
  brand: '',
  model: '',
  year: 0,
  mileage: 0,
  engineCapacity: 0,
  gearbox: 0,
  seatCount: 0,
  doors: '',
  wheels: 0,
  color: '',
  fuelCapacity: 0,
  fuelConsumption: 0,
  horsePower: 0,
  kilometersPerLiter: 0,
  fuelType: '',
};

// Vehicle Update Request DTO
export const VehicleUpdateRequestDTO = {
  // Basic Info
  title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  city: '',
  district: '',
  
  // Vehicle Specs
  brand: '',
  model: '',
  year: 0,
  mileage: 0,
  engineCapacity: 0,
  gearbox: 0,
  seatCount: 0,
  doors: '',
  wheels: 0,
  color: '',
  fuelCapacity: 0,
  fuelConsumption: 0,
  horsePower: 0,
  kilometersPerLiter: 0,
  fuelType: '',
};

// Vehicle Response DTO
export const VehicleListingDTO = {
  // Basic Listing Info
  id: '',
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
  type: 'VEHICLE',
  createdAt: '',
  updatedAt: '',
  
  // Vehicle Specific Info
  brand: '',
  model: '',
  year: 0,
  mileage: 0,
  engineCapacity: 0,
  gearbox: 0,
  seatCount: 0,
  doors: '',
  wheels: 0,
  color: '',
  fuelCapacity: 0,
  fuelConsumption: 0,
  horsePower: 0,
  kilometersPerLiter: 0,
  fuelType: '',
};

// Vehicle Search Filters DTO
export const VehicleSearchFiltersDTO = {
  listingType: 'VEHICLE',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',
  
  // Vehicle specific filters
  brands: [],
  minYear: 0,
  maxYear: 0,
  maxMileage: 0,
  fuelTypes: [],
  colors: [],
  doors: '',
  
  // Sorting
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  
  // Pagination
  page: 0,
  size: 20,
};

/**
 * Create Vehicle Request DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createVehicleCreateRequest = (data) => {
  return {
    // Basic Info
    title: data.title || '',
    description: data.description || '',
    price: parseFloat(data.price) || 0,
    currency: data.currency || 'TRY',
    city: data.city || '',
    district: data.district || '',
    
    // Vehicle Specs
    brand: data.brand || '',
    model: data.model || '',
    year: parseInt(data.year) || 0,
    mileage: parseInt(data.mileage) || 0,
    engineCapacity: parseInt(data.engineCapacity) || 0,
    gearbox: parseInt(data.gearbox) || 0,
    seatCount: parseInt(data.seatCount) || 0,
    doors: data.doors || '',
    wheels: parseInt(data.wheels) || 0,
    color: data.color || '',
    fuelCapacity: parseInt(data.fuelCapacity) || 0,
    fuelConsumption: parseInt(data.fuelConsumption) || 0,
    horsePower: parseInt(data.horsePower) || 0,
    kilometersPerLiter: parseInt(data.kilometersPerLiter) || 0,
    fuelType: data.fuelType || '',
  };
};

/**
 * Create Vehicle Update Request DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createVehicleUpdateRequest = (data) => {
  return createVehicleCreateRequest(data); // Same structure for update
};
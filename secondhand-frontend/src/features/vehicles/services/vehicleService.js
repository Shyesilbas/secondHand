import { get, post, put } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { createVehicleCreateRequest, createVehicleUpdateRequest } from '../../../types/vehicles';

export const vehicleService = {
  // Create a new vehicle listing
  createVehicleListing: async (vehicleData) => {
    const createData = createVehicleCreateRequest(vehicleData);
    // Debug: inspect payload
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[vehicleService.createVehicleListing] payload', createData);
    }
    return post(API_ENDPOINTS.VEHICLES.CREATE, createData);
  },

  // Update an existing vehicle listing
  updateVehicleListing: async (id, vehicleData) => {
    const updateData = createVehicleUpdateRequest(vehicleData);
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[vehicleService.updateVehicleListing] payload', { id, updateData });
    }
    return put(API_ENDPOINTS.VEHICLES.UPDATE(id), updateData);
  },

  // Get vehicle details by ID
  getVehicleById: async (id) => get(API_ENDPOINTS.VEHICLES.BY_ID(id)),



  // Find vehicles by brand and model
  findVehiclesByBrandAndModel: async (brand, model) => get(API_ENDPOINTS.VEHICLES.BY_BRAND_MODEL(brand, model)),

  // Get all car brands (if this endpoint exists)
  getCarBrands: async () => get(API_ENDPOINTS.VEHICLES.BRANDS),

  // Search vehicles with filters (if needed in the future)
  searchVehicles: async (filters) => {
    // This could use the general listing filter endpoint with VEHICLE type
    const vehicleFilters = {
      ...filters,
      listingType: 'VEHICLE'
    };
    const filterData = createListingFilterRequest(vehicleFilters);
    return post(API_ENDPOINTS.LISTINGS.FILTER, filterData);
  },
};
import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { createVehicleCreateRequest, createVehicleUpdateRequest } from '../../../types/vehicles';
import { createListingFilterRequest } from '../../../types/listings';

export const vehicleService = {
  // Create a new vehicle listing
  createVehicleListing: async (vehicleData) => {
    const createData = createVehicleCreateRequest(vehicleData);
    // Debug: inspect payload
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[vehicleService.createVehicleListing] payload', createData);
    }
    const response = await apiClient.post(API_ENDPOINTS.VEHICLES.CREATE, createData);
    return response.data;
  },

  // Update an existing vehicle listing
  updateVehicleListing: async (id, vehicleData) => {
    const updateData = createVehicleUpdateRequest(vehicleData);
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[vehicleService.updateVehicleListing] payload', { id, updateData });
    }
    const response = await apiClient.put(API_ENDPOINTS.VEHICLES.UPDATE(id), updateData);
    return response.data;
  },

  // Get vehicle details by ID
  getVehicleById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.VEHICLES.BY_ID(id));
    return response.data;
  },



  // Find vehicles by brand and model
  findVehiclesByBrandAndModel: async (brand, model) => {
    const response = await apiClient.get(API_ENDPOINTS.VEHICLES.BY_BRAND_MODEL(brand, model));
    return response.data;
  },

  // Get all car brands (if this endpoint exists)
  getCarBrands: async () => {
    const response = await apiClient.get(API_ENDPOINTS.VEHICLES.BRANDS);
    return response.data;
  },

  // Search vehicles with filters (if needed in the future)
  searchVehicles: async (filters) => {
    // This could use the general listing filter endpoint with VEHICLE type
    const vehicleFilters = {
      ...filters,
      listingType: 'VEHICLE'
    };
    const filterData = createListingFilterRequest(vehicleFilters);
    const response = await apiClient.post(API_ENDPOINTS.LISTINGS.FILTER, filterData);
    return response.data;
  },
};
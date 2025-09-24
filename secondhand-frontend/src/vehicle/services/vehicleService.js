import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { createVehicleCreateRequest, createVehicleUpdateRequest } from '../vehicles.js';

export const vehicleService = {
    createVehicleListing: async (vehicleData) => {
    const createData = createVehicleCreateRequest(vehicleData);
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      console.log('[vehicleService.createVehicleListing] payload', createData);
    }
    return post(API_ENDPOINTS.VEHICLES.CREATE, createData);
  },

    updateVehicleListing: async (id, vehicleData) => {
    const updateData = createVehicleUpdateRequest(vehicleData);
    if (import.meta && import.meta.env && import.meta.env.DEV) {
            console.log('[vehicleService.updateVehicleListing] payload', { id, updateData });
    }
    return put(API_ENDPOINTS.VEHICLES.UPDATE(id), updateData);
  },

    getVehicleById: async (id) => get(API_ENDPOINTS.VEHICLES.BY_ID(id)),



    findVehiclesByBrandAndModel: async (brand, model) => get(API_ENDPOINTS.VEHICLES.BY_BRAND_MODEL(brand, model)),

    getCarBrands: async () => get(API_ENDPOINTS.VEHICLES.BRANDS),

    searchVehicles: async (filters) => {
        const vehicleFilters = {
      ...filters,
      listingType: 'VEHICLE'
    };
    const filterData = createListingFilterRequest(vehicleFilters);
    return post(API_ENDPOINTS.LISTINGS.FILTER, filterData);
  },
};
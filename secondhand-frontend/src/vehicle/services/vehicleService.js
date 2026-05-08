import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { listingService } from '../../listing/services/listingService.js';
import { createVehicleCreateRequest, createVehicleUpdateRequest } from '../vehicles.js';

export const vehicleService = {
    createVehicleListing: async (vehicleData) => {
    const createData = createVehicleCreateRequest(vehicleData);
    return post(API_ENDPOINTS.VEHICLES.CREATE, createData);
  },

    updateVehicleListing: async (id, vehicleData) => {
    const updateData = createVehicleUpdateRequest(vehicleData);
    return put(API_ENDPOINTS.VEHICLES.UPDATE(id), updateData);
  },

    getVehicleById: async (id) => get(API_ENDPOINTS.VEHICLES.BY_ID(id)),



    findVehiclesByBrandAndModel: async (brand, model) => get(API_ENDPOINTS.VEHICLES.BY_BRAND_MODEL(brand, model)),

    getCarBrands: async () => get(API_ENDPOINTS.VEHICLES.BRANDS),

    searchVehicles: async (filters) =>
        listingService.filterListings({ ...filters, listingType: 'VEHICLE' }),
};
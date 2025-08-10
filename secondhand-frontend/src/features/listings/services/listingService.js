import apiClient from '../../../services/api/config';

export const listingService = {
    // Get all active listings
    getAllListings: async () => {
        const response = await apiClient.get('/v1/listings/allListings');
        return response.data;
    },

    // Get listing by ID
    getListingById: async (id) => {
        const response = await apiClient.get(`/v1/listings/${id}`);
        return response.data;
    },

    // Get listings by status
    getListingsByStatus: async (status) => {
        const response = await apiClient.get(`/v1/listings/status/${status}`);
        return response.data;
    },

    // Get my listings (authenticated)
    getMyListings: async () => {
        const response = await apiClient.get('/v1/listings/my-listings');
        return response.data;
    },

    // Get my listings by status (authenticated)
    getMyListingsByStatus: async (status) => {
        const response = await apiClient.get(`/v1/listings/my-listings/status/${status}`);
        return response.data;
    },

    // Publish a listing (authenticated)
    publishListing: async (id) => {
        const response = await apiClient.put(`/v1/listings/${id}/publish`);
        return response.data;
    },
};
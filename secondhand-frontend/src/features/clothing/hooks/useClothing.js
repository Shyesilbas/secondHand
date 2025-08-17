import { useState, useCallback } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import { clothingService } from '../services/clothingService';

export const useClothing = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const notification = useNotification();

    const createClothingListing = useCallback(async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await clothingService.createClothingListing(data);
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create clothing listing';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateClothingListing = useCallback(async (id, data) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await clothingService.updateClothingListing(id, data);
            notification.showSuccess('Success', 'Clothing listing updated successfully!');
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update clothing listing';
            setError(errorMessage);
            notification.showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [notification]);

    const getClothingDetails = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await clothingService.getClothingDetails(id);
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to get clothing details';
            setError(errorMessage);
            notification.showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [notification]);

    const findByBrandAndClothingType = useCallback(async (brand, clothingType) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await clothingService.findByBrandAndClothingType(brand, clothingType);
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to find clothing by brand and type';
            setError(errorMessage);
            notification.showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [notification]);

    const filterClothing = useCallback(async (filters) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await clothingService.filterClothing(filters);
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to filter clothing listings';
            setError(errorMessage);
            notification.showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [notification]);

    return {
        isLoading,
        error,
        createClothingListing,
        updateClothingListing,
        getClothingDetails,
        findByBrandAndClothingType,
        filterClothing
    };
};

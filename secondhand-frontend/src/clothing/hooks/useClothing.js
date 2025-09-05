import {useCallback, useState} from 'react';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {clothingService} from '../services/clothingService.js';

export const useClothing = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showSuccess, showError } = useNotification();

    const createClothingListing = useCallback(async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await clothingService.createClothingListing(data);
            showSuccess('Success', 'Clothing listing created successfully!');
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create clothing listing';
            setError(errorMessage);
            showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [showSuccess, showError]);

    const updateClothingListing = useCallback(async (id, data) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await clothingService.updateClothingListing(id, data);
            showSuccess('Success', 'Clothing listing updated successfully!');
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update clothing listing';
            setError(errorMessage);
            showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [showSuccess, showError]);

    const getClothingDetails = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);
        try {
            return await clothingService.getClothingDetails(id);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to get clothing details';
            setError(errorMessage);
            showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [showError]);

    const findByBrandAndClothingType = useCallback(async (brand, clothingType) => {
        setIsLoading(true);
        setError(null);
        try {
            return await clothingService.findByBrandAndClothingType(brand, clothingType);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to find clothing by brand and type';
            setError(errorMessage);
            showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [showError]);

    const filterClothing = useCallback(async (filters) => {
        setIsLoading(true);
        setError(null);
        try {
            return await clothingService.filterClothing(filters);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to filter clothing listings';
            setError(errorMessage);
            showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [showError]);

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

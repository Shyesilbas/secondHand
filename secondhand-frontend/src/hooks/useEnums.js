import { useState, useEffect } from 'react';
import { enumService } from '../services/enumService';
import { getCachedEnums, setCachedEnums, clearEnumCache } from '../services/storage/enumCache';

export const useEnums = () => {
  const [enums, setEnums] = useState({
    listingTypes: [],
    listingStatuses: [],
    carBrands: [],
    fuelTypes: [],
    colors: [],
    doors: [],
    currencies: [],
    gearTypes: [],
    seatCounts: [],
    electronicTypes: [],
    electronicBrands: [],
    realEstateTypes: [],
    realEstateAdTypes: [],
    heatingTypes: [],
    ownerTypes: [],
    clothingBrands: [],
    clothingTypes: [],
    clothingConditions: [],
    bookGenres: [],
    bookLanguages: [],
    bookFormats: [],
    bookConditions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllEnums = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to get cached enums first
        const cachedEnums = getCachedEnums();
        if (cachedEnums) {
          setEnums(cachedEnums);
          setIsLoading(false);
          return;
        }
        
        // If no cache, fetch from API
        console.log('Fetching enums from API...');
        const [
          listingTypes,
          listingStatuses,
          carBrands,
          fuelTypes,
          colors,
          doors,
          currencies,
          gearTypes,
          seatCounts,
          electronicTypes,
          electronicBrands,
          realEstateTypes,
          realEstateAdTypes,
          heatingTypes,
          ownerTypes,
          clothingBrands,
          clothingTypes,
          clothingConditions,
          bookGenres,
          bookLanguages,
          bookFormats,
          bookConditions
        ] = await Promise.all([
          enumService.getListingTypes(),
          enumService.getListingStatuses(),
          enumService.getCarBrands(),
          enumService.getFuelTypes(),
          enumService.getColors(),
          enumService.getDoors(),
          enumService.getCurrencies(),
          enumService.getGearTypes(),
          enumService.getSeatCounts(),
          enumService.getElectronicTypes(),
          enumService.getElectronicBrands(),
          enumService.getRealEstateTypes(),
          enumService.getRealEstateAdTypes(),
          enumService.getHeatingTypes(),
          enumService.getOwnerTypes(),
          enumService.getClothingBrands(),
          enumService.getClothingTypes(),
          enumService.getClothingConditions(),
          enumService.getBookGenres(),
          enumService.getBookLanguages(),
          enumService.getBookFormats(),
          enumService.getBookConditions()
        ]);

        const fetchedEnums = {
          listingTypes,
          listingStatuses,
          carBrands,
          fuelTypes,
          colors,
          doors,
          currencies,
          gearTypes,
          seatCounts,
          electronicTypes,
          electronicBrands,
          realEstateTypes,
          realEstateAdTypes,
          heatingTypes,
          ownerTypes,
          clothingBrands,
          clothingTypes,
          clothingConditions,
          bookGenres,
          bookLanguages,
          bookFormats,
          bookConditions
        };

        setEnums(fetchedEnums);
        // Cache the fetched enums
        setCachedEnums(fetchedEnums);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching enums.');
        console.error('Error fetching enums:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEnums();
  }, []);

  // Helper functions to get labels by value
  const getListingTypeLabel = (value) => {
    const type = enums.listingTypes.find(t => t.value === value);
    return type?.label || value;
  };

  const getListingTypeIcon = (value) => {
    const type = enums.listingTypes.find(t => t.value === value);
    return type?.icon || '📦';
  };

  const getCarBrandLabel = (value) => {
    const brand = enums.carBrands.find(b => b.value === value);
    return brand?.label || value;
  };

  const getFuelTypeLabel = (value) => {
    const fuel = enums.fuelTypes.find(f => f.value === value);
    return fuel?.label || value;
  };

  const getColorLabel = (value) => {
    const color = enums.colors.find(c => c.value === value);
    return color?.label || value;
  };

  const getCurrencyLabel = (value) => {
    const currency = enums.currencies.find(c => c.value === value);
    return currency?.label || value;
  };

  const getCurrencySymbol = (value) => {
    const currency = enums.currencies.find(c => c.value === value);
    return currency?.symbol || value;
  };

  // Function to force refresh enums from API
  const refreshEnums = async () => {
    clearEnumCache();
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Force refreshing enums from API...');
      const [
        listingTypes,
        listingStatuses,
        carBrands,
        fuelTypes,
        colors,
        doors,
        currencies,
        gearTypes,
        seatCounts,
        electronicTypes,
        electronicBrands,
        realEstateTypes,
        realEstateAdTypes,
        heatingTypes,
        ownerTypes,
        clothingBrands,
        clothingTypes,
        clothingConditions
      ] = await Promise.all([
        enumService.getListingTypes(),
        enumService.getListingStatuses(),
        enumService.getCarBrands(),
        enumService.getFuelTypes(),
        enumService.getColors(),
        enumService.getDoors(),
        enumService.getCurrencies(),
        enumService.getGearTypes(),
        enumService.getSeatCounts(),
        enumService.getElectronicTypes(),
        enumService.getElectronicBrands(),
        enumService.getRealEstateTypes(),
        enumService.getRealEstateAdTypes(),
        enumService.getHeatingTypes(),
        enumService.getOwnerTypes(),
        enumService.getClothingBrands(),
        enumService.getClothingTypes(),
        enumService.getClothingConditions()
      ]);

      const freshEnums = {
        listingTypes,
        listingStatuses,
        carBrands,
        fuelTypes,
        colors,
        doors,
        currencies,
        gearTypes,
        seatCounts,
        electronicTypes,
        electronicBrands,
        realEstateTypes,
        realEstateAdTypes,
        heatingTypes,
        ownerTypes,
        clothingBrands,
        clothingTypes,
        clothingConditions
      };

      setEnums(freshEnums);
      setCachedEnums(freshEnums);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while refreshing enums.');
      console.error('Error refreshing enums:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    enums,
    isLoading,
    error,
    getListingTypeLabel,
    getListingTypeIcon,
    getCarBrandLabel,
    getFuelTypeLabel,
    getColorLabel,
    getCurrencyLabel,
    getCurrencySymbol,
    refreshEnums
  };
};
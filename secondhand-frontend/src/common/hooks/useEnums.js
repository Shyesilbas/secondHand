import { useState, useEffect } from 'react';
import { getCachedEnums, setCachedEnums, clearEnumCache, forceClearEnumCache } from '../services/storage/enumCache.js';
import { fetchVehicleEnums, getCarBrandLabel, getFuelTypeLabel, getColorLabel } from '../enums/vehicleEnums.js';
import { fetchListingEnums, getListingTypeLabel, getListingTypeIcon, getCurrencyLabel, getCurrencySymbol } from '../enums/listingEnums.js';
import { fetchPaymentEnums } from '../enums/paymentEnums.js';

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
    clothingGenders: [],
    clothingCategories: [],
    bookGenres: [],
    bookLanguages: [],
    bookFormats: [],
    bookConditions: [],
    sportDisciplines: [],
    sportEquipmentTypes: [],
    sportConditions: [],
    processors: [],
    paymentTypes: [],
    shippingStatuses: [],
    emailTypes: [],
    genders: [],
    auditEventTypes: [],
    auditEventStatuses: [],
    listingFeeConfig: null,
    showcasePricingConfig: null,
    agreementGroups: [],
    agreementTypes: [],
    drivetrains: [],
    bodyTypes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllEnums = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const cachedEnums = getCachedEnums();
        if (cachedEnums) {
          const processorsMissing = !cachedEnums.processors || cachedEnums.processors.length === 0;
          const vehicleNewEnumsMissing = !cachedEnums.drivetrains || cachedEnums.drivetrains.length === 0 ||
            !cachedEnums.bodyTypes || cachedEnums.bodyTypes.length === 0;

          if (processorsMissing || vehicleNewEnumsMissing) {
            forceClearEnumCache();
          } else {
            setEnums(cachedEnums);
            setIsLoading(false);
            return;
          }
        }
        
        console.log('Fetching enums from API...');
        const [vehicleEnumsData, listingEnumsData, paymentEnumsData] = await Promise.all([
          fetchVehicleEnums(),
          fetchListingEnums(),
          fetchPaymentEnums(),
        ]);

        const fetchedEnums = {
          ...vehicleEnumsData,
          ...listingEnumsData,
          ...paymentEnumsData,
        };

        setEnums(fetchedEnums);
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

  const refreshEnums = async () => {
    clearEnumCache();
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Force refreshing enums from API...');
      const [vehicleEnumsData, listingEnumsData, paymentEnumsData] = await Promise.all([
        fetchVehicleEnums(),
        fetchListingEnums(),
        fetchPaymentEnums(),
      ]);

      const freshEnums = {
        ...vehicleEnumsData,
        ...listingEnumsData,
        ...paymentEnumsData,
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
    getListingTypeLabel: (value) => getListingTypeLabel(value, enums.listingTypes),
    getListingTypeIcon: (value) => getListingTypeIcon(value, enums.listingTypes),
    getCarBrandLabel: (value) => getCarBrandLabel(value, enums.carBrands),
    getFuelTypeLabel: (value) => getFuelTypeLabel(value, enums.fuelTypes),
    getColorLabel: (value) => getColorLabel(value, enums.colors),
    getCurrencyLabel: (value) => getCurrencyLabel(value, enums.currencies),
    getCurrencySymbol: (value) => getCurrencySymbol(value, enums.currencies),
    refreshEnums
  };
};
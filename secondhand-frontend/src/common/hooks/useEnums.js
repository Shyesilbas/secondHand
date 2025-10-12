import { useState, useEffect } from 'react';
import { enumService } from '../services/enumService.js';
import { getCachedEnums, setCachedEnums, clearEnumCache, forceClearEnumCache } from '../services/storage/enumCache.js';

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
    paymentTypes: [],
    shippingStatuses: [],
    emailTypes: [],
    genders: [],
    auditEventTypes: [],
    auditEventStatuses: [],
    listingFeeConfig: null,
    showcasePricingConfig: null,
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
          if (!cachedEnums.auditEventTypes || !cachedEnums.auditEventStatuses) {
            console.log('Cached enums missing audit enums, clearing cache and refetching...');
            forceClearEnumCache();
          } else {
            setEnums(cachedEnums);
            setIsLoading(false);
            return;
          }
        }
        
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
          clothingGenders,
          clothingCategories,
          bookGenres,
          bookLanguages,
          bookFormats,
          bookConditions,
          sportDisciplines,
          sportEquipmentTypes,
          sportConditions,
          paymentTypes,
          shippingStatuses,
          emailTypes,
          genders,
          auditEventTypes,
          auditEventStatuses,
          listingFeeConfig,
          showcasePricingConfig
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
          enumService.getClothingGenders(),
          enumService.getClothingCategories(),
          enumService.getBookGenres(),
          enumService.getBookLanguages(),
          enumService.getBookFormats(),
          enumService.getBookConditions(),
          enumService.getSportDisciplines(),
          enumService.getSportEquipmentTypes(),
          enumService.getSportConditions(),
          enumService.getPaymentTypes(),
          enumService.getShippingStatuses(),
          enumService.getEmailTypes(),
          enumService.getGenders(),
          enumService.getAuditEventTypes(),
          enumService.getAuditEventStatuses(),
          enumService.getListingFeeConfig(),
          enumService.getShowcasePricingConfig(),
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
          clothingGenders,
          clothingCategories,
          bookGenres,
          bookLanguages,
          bookFormats,
          bookConditions,
          sportDisciplines,
          sportEquipmentTypes,
          sportConditions,
          paymentTypes,
          shippingStatuses,
          emailTypes,
          genders,
          auditEventTypes,
          auditEventStatuses,
          listingFeeConfig,
          showcasePricingConfig,
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
        clothingConditions,
        bookGenres,
        bookLanguages,
        bookFormats,
        bookConditions,
        sportDisciplines,
        sportEquipmentTypes,
        sportConditions,
        paymentTypes,
        shippingStatuses,
        emailTypes,
        genders,
        auditEventTypes,
        auditEventStatuses
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
        enumService.getBookConditions(),
        enumService.getSportDisciplines(),
        enumService.getSportEquipmentTypes(),
        enumService.getSportConditions(),
        enumService.getPaymentTypes(),
        enumService.getShippingStatuses(),
        enumService.getEmailTypes(),
        enumService.getGenders(),
        enumService.getAuditEventTypes(),
        enumService.getAuditEventStatuses()
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
        clothingConditions,
        bookGenres,
        bookLanguages,
        bookFormats,
        bookConditions,
        sportDisciplines,
        sportEquipmentTypes,
        sportConditions,
        paymentTypes,
        shippingStatuses,
        emailTypes,
        genders,
        auditEventTypes,
        auditEventStatuses
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
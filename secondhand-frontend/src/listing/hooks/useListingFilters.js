import { useState, useCallback } from 'react';
import { 
  ListingFilterDTO, 
  VehicleListingFilterDTO, 
  ElectronicListingFilterDTO,
  RealEstateListingFilterDTO,
  ClothingListingFilterDTO,
  BooksListingFilterDTO,
  SportsListingFilterDTO
} from '../listings.js';

export const useListingFilters = (initialFilters = {}, listingType = null) => {
  const getInitialFilters = useCallback(() => {
    const baseFilters = { ...ListingFilterDTO };
    
    if (listingType) {
      baseFilters.listingType = listingType;
      
            if (listingType === 'VEHICLE') {
        return { ...VehicleListingFilterDTO, ...initialFilters };
      } else if (listingType === 'ELECTRONICS') {
        return { ...ElectronicListingFilterDTO, ...initialFilters };
      } else if (listingType === 'REAL_ESTATE') {
        return { ...RealEstateListingFilterDTO, ...initialFilters };
      } else if (listingType === 'CLOTHING') {
        return { ...ClothingListingFilterDTO, ...initialFilters };
      } else if (listingType === 'BOOKS') {
        return { ...BooksListingFilterDTO, ...initialFilters };
      } else if (listingType === 'SPORTS') {
        return { ...SportsListingFilterDTO, ...initialFilters };
      }
      else {
                return { 
          type: listingType,
          listingType: listingType,
          status: 'ACTIVE',
          page: 0,
          size: 20,
          ...initialFilters 
        };
      }
    }
    
    return { ...baseFilters, ...initialFilters };
  }, [listingType, initialFilters]);

  const [filters, setFilters] = useState(getInitialFilters());

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  }, []);

  const updatePage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    const defaultFilters = getInitialFilters();
    setFilters(defaultFilters);
  }, [getInitialFilters]);

  const updateSingleFilter = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 0 }));
  }, []);

  const updateArrayFilter = useCallback((field, value) => {
    setFilters(prev => {
      const currentArray = prev[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray, page: 0 };
    });
  }, []);

  const clearFilter = useCallback((field) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return { ...newFilters, page: 0 };
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    return filters.minPrice || filters.maxPrice || filters.city || filters.district ||
      (filters.brands && filters.brands.length > 0) ||
      (filters.fuelTypes && filters.fuelTypes.length > 0) ||
      (filters.colors && filters.colors.length > 0) ||
      (filters.gearTypes && filters.gearTypes.length > 0) ||
      (filters.seatCounts && filters.seatCounts.length > 0) ||
      (filters.electronicTypes && filters.electronicTypes.length > 0) ||
      (filters.electronicBrands && filters.electronicBrands.length > 0) ||
      (filters.realEstateTypes && filters.realEstateTypes.length > 0) ||
      (filters.heatingTypes && filters.heatingTypes.length > 0) ||
      filters.adType || filters.ownerType || filters.furnished ||
      filters.minSquareMeters || filters.maxSquareMeters ||
      filters.minRoomCount || filters.maxRoomCount ||
      filters.minBathroomCount || filters.maxBathroomCount ||
      filters.floor || filters.minBuildingAge || filters.maxBuildingAge ||
      filters.minYear || filters.maxYear || filters.maxMileage ||
      (filters.types && filters.types.length > 0) ||
      (filters.conditions && filters.conditions.length > 0) ||
      filters.minPurchaseDate || filters.maxPurchaseDate ||
      (filters.genres && filters.genres.length > 0) ||
      (filters.languages && filters.languages.length > 0) ||
      (filters.formats && filters.formats.length > 0) ||
      (filters.conditions && filters.conditions.length > 0) ||
      filters.minPageCount || filters.maxPageCount;
  }, [filters]);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.city || filters.district) count++;
    if (filters.brands && filters.brands.length > 0) count++;
    if (filters.fuelTypes && filters.fuelTypes.length > 0) count++;
    if (filters.colors && filters.colors.length > 0) count++;
    if (filters.gearTypes && filters.gearTypes.length > 0) count++;
    if (filters.seatCounts && filters.seatCounts.length > 0) count++;
    if (filters.electronicTypes && filters.electronicTypes.length > 0) count++;
    if (filters.electronicBrands && filters.electronicBrands.length > 0) count++;
    if (filters.realEstateTypes && filters.realEstateTypes.length > 0) count++;
    if (filters.heatingTypes && filters.heatingTypes.length > 0) count++;
    if (filters.adType) count++;
    if (filters.ownerType) count++;
    if (filters.furnished) count++;
    if (filters.minSquareMeters || filters.maxSquareMeters) count++;
    if (filters.minRoomCount || filters.maxRoomCount) count++;
    if (filters.minBathroomCount || filters.maxBathroomCount) count++;
    if (filters.floor) count++;
    if (filters.minBuildingAge || filters.maxBuildingAge) count++;
    if (filters.minYear || filters.maxYear) count++;
    if (filters.maxMileage) count++;
    if (filters.types && filters.types.length > 0) count++;
    if (filters.conditions && filters.conditions.length > 0) count++;
    if (filters.minPurchaseDate || filters.maxPurchaseDate) count++;
    if (filters.genres && filters.genres.length > 0) count++;
    if (filters.languages && filters.languages.length > 0) count++;
    if (filters.formats && filters.formats.length > 0) count++;
    if (filters.minPageCount || filters.maxPageCount) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilters,
    updatePage,
    resetFilters,
    updateSingleFilter,
    updateArrayFilter,
    clearFilter,
    hasActiveFilters,
    getActiveFilterCount,
  };
};
 

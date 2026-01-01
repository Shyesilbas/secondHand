import { enumService } from '../services/enumService.js';

export const listingEnums = {
  listingTypes: [],
  listingStatuses: [],
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
  currencies: [],
  genders: [],
  auditEventTypes: [],
  auditEventStatuses: [],
  listingFeeConfig: null,
  showcasePricingConfig: null,
  drivetrains: [],
  bodyTypes: [],
};

export const fetchListingEnums = async () => {
  try {
    const [
      listingTypes,
      listingStatuses,
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
      currencies,
      genders,
      auditEventTypes,
      auditEventStatuses,
      listingFeeConfig,
      showcasePricingConfig,
      processors,
      drivetrains,
      bodyTypes,
      orderStatuses,
    ] = await Promise.all([
      enumService.getListingTypes(),
      enumService.getListingStatuses(),
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
      enumService.getCurrencies(),
      enumService.getGenders(),
      enumService.getAuditEventTypes().catch(() => []),
      enumService.getAuditEventStatuses().catch(() => []),
      enumService.getListingFeeConfig(),
      enumService.getShowcasePricingConfig(),
      enumService.getProcessors(),
      enumService.getDrivetrains(),
      enumService.getBodyTypes(),
      enumService.getOrderStatuses(),
    ]);

    return {
      listingTypes,
      listingStatuses,
      orderStatuses,
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
      currencies,
      genders,
      auditEventTypes,
      auditEventStatuses,
      listingFeeConfig,
      showcasePricingConfig,
      processors,
      drivetrains,
      bodyTypes,
    };
  } catch (error) {
    console.error('Error fetching listing enums:', error);
    return listingEnums;
  }
};

export const getListingTypeLabel = (value, listingTypes) => {
  const type = listingTypes.find(t => t.value === value);
  return type?.label || value;
};

export const getListingTypeIcon = (value, listingTypes) => {
  const type = listingTypes.find(t => t.value === value);
  return type?.icon || '📦';
};

export const getCurrencyLabel = (value, currencies) => {
  const currency = currencies.find(c => c.value === value);
  return currency?.label || value;
};

export const getCurrencySymbol = (value, currencies) => {
  const currency = currencies.find(c => c.value === value);
  return currency?.symbol || value;
};

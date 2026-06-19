// Main EnumContext (backward compatible)
export { useEnumContext } from './EnumContext.jsx';
export { EnumProvider } from './EnumProvider.jsx';

// Domain-specific contexts
export { useGeneralEnums, useListingTypes, useCurrencies, useOrderStatuses, useListingStatuses, usePaymentTypes, useShippingStatuses } from './GeneralEnumContext.jsx';
export { GeneralEnumProvider } from './GeneralEnumProvider.jsx';

export { useVehicleEnums, useCarBrands, useVehicleTypes, useVehicleModels, useFuelTypes, useColors, useDoors, useGearTypes, useSeatCounts, useDrivetrains, useBodyTypes, useVehicleGenerations, useVehicleEngines, useVehicleTrims } from './VehicleEnumContext.jsx';
export { VehicleEnumProvider } from './VehicleEnumProvider.jsx';

export { useElectronicsEnums, useElectronicTypes, useElectronicBrands, useElectronicModels, useStorageTypes, useElectronicConnectionTypes, useProcessors, useElectronicConditions } from './ElectronicsEnumContext.jsx';
export { ElectronicsEnumProvider } from './ElectronicsEnumProvider.jsx';

export { useRealEstateEnums, useRealEstateTypes, useRealEstateAdTypes, useHeatingTypes, useOwnerTypes } from './RealEstateEnumContext.jsx';
export { RealEstateEnumProvider } from './RealEstateEnumProvider.jsx';

export { useClothingEnums, useClothingBrands, useClothingTypes, useClothingConditions, useClothingGenders, useClothingCategories, useClothingSizes } from './ClothingEnumContext.jsx';
export { ClothingEnumProvider } from './ClothingEnumProvider.jsx';

export { useBookEnums, useBookTypes, useBookGenres, useBookLanguages, useBookFormats, useBookConditions } from './BookEnumContext.jsx';
export { BookEnumProvider } from './BookEnumProvider.jsx';

export { useSportEnums, useSportDisciplines, useSportEquipmentTypes, useSportConditions } from './SportEnumContext.jsx';
export { SportEnumProvider } from './SportEnumProvider.jsx';

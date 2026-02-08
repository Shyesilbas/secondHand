// Main EnumContext (backward compatible)
export { EnumProvider, useEnumContext } from './EnumContext.jsx';

// Domain-specific contexts
export {
    GeneralEnumProvider,
    useGeneralEnums,
    useListingTypes,
    useCurrencies,
    useOrderStatuses,
    useListingStatuses,
    usePaymentTypes,
    useShippingStatuses,
} from './GeneralEnumContext.jsx';

export {
    VehicleEnumProvider,
    useVehicleEnums,
    useCarBrands,
    useVehicleTypes,
    useVehicleModels,
    useFuelTypes,
    useColors,
    useDoors,
    useGearTypes,
    useSeatCounts,
    useDrivetrains,
    useBodyTypes,
} from './VehicleEnumContext.jsx';

export {
    ElectronicsEnumProvider,
    useElectronicsEnums,
    useElectronicTypes,
    useElectronicBrands,
    useElectronicModels,
    useStorageTypes,
    useElectronicConnectionTypes,
    useProcessors,
} from './ElectronicsEnumContext.jsx';

export {
    RealEstateEnumProvider,
    useRealEstateEnums,
    useRealEstateTypes,
    useRealEstateAdTypes,
    useHeatingTypes,
    useOwnerTypes,
} from './RealEstateEnumContext.jsx';

export {
    ClothingEnumProvider,
    useClothingEnums,
    useClothingBrands,
    useClothingTypes,
    useClothingConditions,
    useClothingGenders,
    useClothingCategories,
    useClothingSizes,
} from './ClothingEnumContext.jsx';

export {
    BookEnumProvider,
    useBookEnums,
    useBookTypes,
    useBookGenres,
    useBookLanguages,
    useBookFormats,
    useBookConditions,
} from './BookEnumContext.jsx';

export {
    SportEnumProvider,
    useSportEnums,
    useSportDisciplines,
    useSportEquipmentTypes,
    useSportConditions,
} from './SportEnumContext.jsx';

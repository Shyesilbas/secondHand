import { useMemo } from 'react';
import { enumService } from '../services/enumService.js';
import { GeneralEnumProvider } from './GeneralEnumProvider.jsx';
import { VehicleEnumProvider } from './VehicleEnumProvider.jsx';
import { ElectronicsEnumProvider } from './ElectronicsEnumProvider.jsx';
import { RealEstateEnumProvider } from './RealEstateEnumProvider.jsx';
import { ClothingEnumProvider } from './ClothingEnumProvider.jsx';
import { BookEnumProvider } from './BookEnumProvider.jsx';
import { SportEnumProvider } from './SportEnumProvider.jsx';
import { EnumContext } from './EnumContext.jsx';

const initialEnumState = {
    general: {
        listingTypes: [],
        listingStatuses: [],
        orderStatuses: [],
        currencies: [],
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
    },
    vehicle: {
        carBrands: [],
        vehicleTypes: [],
        vehicleModels: [],
        vehicleGenerations: [],
        vehicleEngines: [],
        vehicleTrims: [],
        fuelTypes: [],
        colors: [],
        doors: [],
        gearTypes: [],
        seatCounts: [],
        drivetrains: [],
        bodyTypes: [],
    },
    electronics: {
        electronicTypes: [],
        electronicBrands: [],
        electronicModels: [],
        storageTypes: [],
        electronicConnectionTypes: [],
        processors: [],
        electronicConditions: [],
    },
    realEstate: {
        realEstateTypes: [],
        realEstateAdTypes: [],
        heatingTypes: [],
        ownerTypes: [],
    },
    clothing: {
        clothingBrands: [],
        clothingTypes: [],
        clothingConditions: [],
        clothingGenders: [],
        clothingCategories: [],
        clothingSizes: [],
    },
    book: {
        bookTypes: [],
        bookGenres: [],
        bookLanguages: [],
        bookFormats: [],
        bookConditions: [],
    },
    sport: {
        sportDisciplines: [],
        sportEquipmentTypes: [],
        sportConditions: [],
    },
};

import { useQuery } from '@tanstack/react-query';

export const EnumProvider = ({ children }) => {
    const { data: enums = initialEnumState, isLoading, error, refetch: refreshEnums } = useQuery({
        queryKey: ['enums'],
        queryFn: async () => {
            const allEnumsData = await enumService.getAllEnums();
            return {
                general: {
                    listingTypes: allEnumsData.listingTypes || [],
                    listingStatuses: allEnumsData.listingStatuses || [],
                    orderStatuses: allEnumsData.orderStatuses || [],
                    currencies: allEnumsData.currencies || [],
                    paymentTypes: allEnumsData.paymentTypes || [],
                    shippingStatuses: allEnumsData.shippingStatuses || [],
                    emailTypes: allEnumsData.emailTypes || [],
                    genders: allEnumsData.genders || [],
                    auditEventTypes: allEnumsData.auditEventTypes || [],
                    auditEventStatuses: allEnumsData.auditEventStatuses || [],
                    listingFeeConfig: allEnumsData.listingFeeConfig || null,
                    showcasePricingConfig: allEnumsData.showcasePricingConfig || null,
                    agreementGroups: allEnumsData.agreementGroups || [],
                    agreementTypes: allEnumsData.agreementTypes || [],
                },
                vehicle: {
                    carBrands: allEnumsData.carBrands || [],
                    vehicleTypes: allEnumsData.vehicleTypes || [],
                    vehicleModels: allEnumsData.vehicleModels || [],
                    vehicleGenerations: allEnumsData.vehicleGenerations || [],
                    vehicleEngines: allEnumsData.vehicleEngines || [],
                    vehicleTrims: allEnumsData.vehicleTrims || [],
                    fuelTypes: allEnumsData.fuelTypes || [],
                    colors: allEnumsData.colors || [],
                    doors: allEnumsData.doors || [],
                    gearTypes: allEnumsData.gearTypes || [],
                    seatCounts: allEnumsData.seatCounts || [],
                    drivetrains: allEnumsData.drivetrains || [],
                    bodyTypes: allEnumsData.bodyTypes || [],
                },
                electronics: {
                    electronicTypes: allEnumsData.electronicTypes || [],
                    electronicBrands: allEnumsData.electronicBrands || [],
                    electronicModels: allEnumsData.electronicModels || [],
                    storageTypes: allEnumsData.storageTypes || [],
                    electronicConnectionTypes: allEnumsData.electronicConnectionTypes || [],
                    processors: allEnumsData.processors || [],
                    electronicConditions: allEnumsData.electronicConditions || [],
                },
                realEstate: {
                    realEstateTypes: allEnumsData.realEstateTypes || [],
                    realEstateAdTypes: allEnumsData.realEstateAdTypes || [],
                    heatingTypes: allEnumsData.heatingTypes || [],
                    ownerTypes: allEnumsData.ownerTypes || [],
                },
                clothing: {
                    clothingBrands: allEnumsData.clothingBrands || [],
                    clothingTypes: allEnumsData.clothingTypes || [],
                    clothingConditions: allEnumsData.clothingConditions || [],
                    clothingGenders: allEnumsData.clothingGenders || [],
                    clothingCategories: allEnumsData.clothingCategories || [],
                    clothingSizes: allEnumsData.clothingSizes || [],
                },
                book: {
                    bookTypes: allEnumsData.bookTypes || [],
                    bookGenres: allEnumsData.bookGenres || [],
                    bookLanguages: allEnumsData.bookLanguages || [],
                    bookFormats: allEnumsData.bookFormats || [],
                    bookConditions: allEnumsData.bookConditions || [],
                },
                sport: {
                    sportDisciplines: allEnumsData.sportDisciplines || [],
                    sportEquipmentTypes: allEnumsData.sportEquipmentTypes || [],
                    sportConditions: allEnumsData.sportConditions || [],
                },
            };
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
        refetchOnWindowFocus: false,
    });

    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
            refreshEnums,
        }),
        [enums, isLoading, error, refreshEnums]
    );

    return (
        <EnumContext.Provider value={value}>
            <GeneralEnumProvider enums={enums.general} isLoading={isLoading} error={error}>
                <VehicleEnumProvider enums={enums.vehicle} isLoading={isLoading} error={error}>
                    <ElectronicsEnumProvider enums={enums.electronics} isLoading={isLoading} error={error}>
                        <RealEstateEnumProvider enums={enums.realEstate} isLoading={isLoading} error={error}>
                            <ClothingEnumProvider enums={enums.clothing} isLoading={isLoading} error={error}>
                                <BookEnumProvider enums={enums.book} isLoading={isLoading} error={error}>
                                    <SportEnumProvider enums={enums.sport} isLoading={isLoading} error={error}>
                                        {children}
                                    </SportEnumProvider>
                                </BookEnumProvider>
                            </ClothingEnumProvider>
                        </RealEstateEnumProvider>
                    </ElectronicsEnumProvider>
                </VehicleEnumProvider>
            </GeneralEnumProvider>
        </EnumContext.Provider>
    );
};

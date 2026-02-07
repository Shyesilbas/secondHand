import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {clearEnumCache, getCachedEnums, setCachedEnums} from '../services/storage/enumCache.js';
import {enumService} from '../services/enumService.js';
import {getCarBrandLabel, getColorLabel, getFuelTypeLabel} from '../enums/vehicleEnums.js';
import {getCurrencyLabel, getCurrencySymbol, getListingTypeIcon, getListingTypeLabel} from '../enums/listingEnums.js';

const EnumContext = createContext();

export const useEnumContext = () => {
    const context = useContext(EnumContext);
    if (!context) {
        throw new Error('useEnumContext must be used within an EnumProvider');
    }
    return context;
};

// Split enum state into logical domain sub-objects
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

export const EnumProvider = ({ children }) => {
    const [enums, setEnums] = useState(initialEnumState);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const fetchAllEnums = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const cachedEnums = getCachedEnums();

            // Validate cache structure - ensure it's the new nested structure
            if (cachedEnums && cachedEnums.general && cachedEnums.vehicle) {
                setEnums(cachedEnums);
                setIsLoading(false);
                setIsInitialized(true);
                return;
            }

            // If cache is invalid or old flat structure, clear it and fetch fresh
            if (cachedEnums) {
                clearEnumCache();
            }

            const allEnumsData = await enumService.getAllEnums();

            const fetchedEnums = {
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

            setEnums(fetchedEnums);
            setCachedEnums(fetchedEnums);
            setIsInitialized(true);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while fetching enums.');
            console.error('Error fetching enums:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshEnums = useCallback(async () => {
        clearEnumCache();
        await fetchAllEnums();
    }, [fetchAllEnums]);

    useEffect(() => {
        if (!isInitialized) {
            fetchAllEnums();
        }
    }, [isInitialized, fetchAllEnums]);

    // Label lookup memoizations
    const getListingTypeLabelMemo = useCallback(
        (value) => getListingTypeLabel(value, enums.general.listingTypes),
        [enums.general.listingTypes]
    );

    const getListingTypeIconMemo = useCallback(
        (value) => getListingTypeIcon(value, enums.general.listingTypes),
        [enums.general.listingTypes]
    );

    const getCarBrandLabelMemo = useCallback(
        (value) => getCarBrandLabel(value, enums.vehicle.carBrands),
        [enums.vehicle.carBrands]
    );

    const getFuelTypeLabelMemo = useCallback(
        (value) => getFuelTypeLabel(value, enums.vehicle.fuelTypes),
        [enums.vehicle.fuelTypes]
    );

    const getColorLabelMemo = useCallback(
        (value) => getColorLabel(value, enums.vehicle.colors),
        [enums.vehicle.colors]
    );

    const getCurrencyLabelMemo = useCallback(
        (value) => getCurrencyLabel(value, enums.general.currencies),
        [enums.general.currencies]
    );

    const getCurrencySymbolMemo = useCallback(
        (value) => getCurrencySymbol(value, enums.general.currencies),
        [enums.general.currencies]
    );

    // Context Value Optimization with Backward Compatibility
    const value = useMemo(
        () => ({
            // Flattened enums for backward compatibility + original structured enums
            enums: {
                ...enums, // enums.general, enums.vehicle vb. erişim için
                ...enums.general,
                ...enums.vehicle,
                ...enums.electronics,
                ...enums.realEstate,
                ...enums.clothing,
                ...enums.book,
                ...enums.sport
            },
            isLoading,
            error,
            refreshEnums,
            getListingTypeLabel: getListingTypeLabelMemo,
            getListingTypeIcon: getListingTypeIconMemo,
            getCarBrandLabel: getCarBrandLabelMemo,
            getFuelTypeLabel: getFuelTypeLabelMemo,
            getColorLabel: getColorLabelMemo,
            getCurrencyLabel: getCurrencyLabelMemo,
            getCurrencySymbol: getCurrencySymbolMemo,
        }),
        [
            enums,
            isLoading,
            error,
            refreshEnums,
            getListingTypeLabelMemo,
            getListingTypeIconMemo,
            getCarBrandLabelMemo,
            getFuelTypeLabelMemo,
            getColorLabelMemo,
            getCurrencyLabelMemo,
            getCurrencySymbolMemo,
        ]
    );

    return (
        <EnumContext.Provider value={value}>
            {children}
        </EnumContext.Provider>
    );
};
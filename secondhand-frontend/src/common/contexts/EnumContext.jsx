import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCachedEnums, setCachedEnums, clearEnumCache } from '../services/storage/enumCache.js';
import { enumService } from '../services/enumService.js';
import { getCarBrandLabel, getFuelTypeLabel, getColorLabel } from '../enums/vehicleEnums.js';
import { getListingTypeLabel, getListingTypeIcon, getCurrencyLabel, getCurrencySymbol } from '../enums/listingEnums.js';

const EnumContext = createContext();

export const useEnumContext = () => {
    const context = useContext(EnumContext);
    if (!context) {
        throw new Error('useEnumContext must be used within an EnumProvider');
    }
    return context;
};

const initialEnumState = {
    listingTypes: [],
    listingStatuses: [],
    orderStatuses: [],
    carBrands: [],
    vehicleModels: [],
    fuelTypes: [],
    colors: [],
    doors: [],
    currencies: [],
    gearTypes: [],
    seatCounts: [],
    electronicTypes: [],
    electronicBrands: [],
    electronicModels: [],
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
            if (cachedEnums) {
                setEnums(cachedEnums);
                setIsLoading(false);
                setIsInitialized(true);
                return;
            }
            
            const allEnumsData = await enumService.getAllEnums();
            
            const fetchedEnums = {
                listingTypes: allEnumsData.listingTypes || [],
                listingStatuses: allEnumsData.listingStatuses || [],
                orderStatuses: allEnumsData.orderStatuses || [],
                carBrands: allEnumsData.carBrands || [],
                vehicleModels: allEnumsData.vehicleModels || [],
                fuelTypes: allEnumsData.fuelTypes || [],
                colors: allEnumsData.colors || [],
                doors: allEnumsData.doors || [],
                currencies: allEnumsData.currencies || [],
                gearTypes: allEnumsData.gearTypes || [],
                seatCounts: allEnumsData.seatCounts || [],
                electronicTypes: allEnumsData.electronicTypes || [],
                electronicBrands: allEnumsData.electronicBrands || [],
                electronicModels: allEnumsData.electronicModels || [],
                realEstateTypes: allEnumsData.realEstateTypes || [],
                realEstateAdTypes: allEnumsData.realEstateAdTypes || [],
                heatingTypes: allEnumsData.heatingTypes || [],
                ownerTypes: allEnumsData.ownerTypes || [],
                clothingBrands: allEnumsData.clothingBrands || [],
                clothingTypes: allEnumsData.clothingTypes || [],
                clothingConditions: allEnumsData.clothingConditions || [],
                clothingGenders: allEnumsData.clothingGenders || [],
                clothingCategories: allEnumsData.clothingCategories || [],
                bookGenres: allEnumsData.bookGenres || [],
                bookLanguages: allEnumsData.bookLanguages || [],
                bookFormats: allEnumsData.bookFormats || [],
                bookConditions: allEnumsData.bookConditions || [],
                sportDisciplines: allEnumsData.sportDisciplines || [],
                sportEquipmentTypes: allEnumsData.sportEquipmentTypes || [],
                sportConditions: allEnumsData.sportConditions || [],
                processors: allEnumsData.processors || [],
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
                drivetrains: allEnumsData.drivetrains || [],
                bodyTypes: allEnumsData.bodyTypes || [],
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

    const value = {
        enums,
        isLoading,
        error,
        refreshEnums,
        getListingTypeLabel: (value) => getListingTypeLabel(value, enums.listingTypes),
        getListingTypeIcon: (value) => getListingTypeIcon(value, enums.listingTypes),
        getCarBrandLabel: (value) => getCarBrandLabel(value, enums.carBrands),
        getFuelTypeLabel: (value) => getFuelTypeLabel(value, enums.fuelTypes),
        getColorLabel: (value) => getColorLabel(value, enums.colors),
        getCurrencyLabel: (value) => getCurrencyLabel(value, enums.currencies),
        getCurrencySymbol: (value) => getCurrencySymbol(value, enums.currencies),
    };

    return (
        <EnumContext.Provider value={value}>
            {children}
        </EnumContext.Provider>
    );
};


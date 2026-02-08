import {createContext, useCallback, useContext, useMemo} from 'react';
import {getListingTypeIcon, getListingTypeLabel, getCurrencyLabel, getCurrencySymbol} from '../enums/listingEnums.js';

const GeneralEnumContext = createContext();

export const useGeneralEnums = () => {
    const context = useContext(GeneralEnumContext);
    if (!context) {
        throw new Error('useGeneralEnums must be used within a GeneralEnumProvider');
    }
    return context;
};

export const GeneralEnumProvider = ({ children, enums, isLoading, error }) => {
    const getListingTypeLabelMemo = useCallback(
        (value) => getListingTypeLabel(value, enums.listingTypes),
        [enums.listingTypes]
    );

    const getListingTypeIconMemo = useCallback(
        (value) => getListingTypeIcon(value, enums.listingTypes),
        [enums.listingTypes]
    );

    const getCurrencyLabelMemo = useCallback(
        (value) => getCurrencyLabel(value, enums.currencies),
        [enums.currencies]
    );

    const getCurrencySymbolMemo = useCallback(
        (value) => getCurrencySymbol(value, enums.currencies),
        [enums.currencies]
    );

    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
            getListingTypeLabel: getListingTypeLabelMemo,
            getListingTypeIcon: getListingTypeIconMemo,
            getCurrencyLabel: getCurrencyLabelMemo,
            getCurrencySymbol: getCurrencySymbolMemo,
        }),
        [enums, isLoading, error, getListingTypeLabelMemo, getListingTypeIconMemo, getCurrencyLabelMemo, getCurrencySymbolMemo]
    );

    return (
        <GeneralEnumContext.Provider value={value}>
            {children}
        </GeneralEnumContext.Provider>
    );
};

// Selector hooks for specific enums
export const useListingTypes = () => {
    const { enums } = useGeneralEnums();
    return useMemo(() => enums.listingTypes, [enums.listingTypes]);
};

export const useCurrencies = () => {
    const { enums } = useGeneralEnums();
    return useMemo(() => enums.currencies, [enums.currencies]);
};

export const useOrderStatuses = () => {
    const { enums } = useGeneralEnums();
    return useMemo(() => enums.orderStatuses, [enums.orderStatuses]);
};

export const useListingStatuses = () => {
    const { enums } = useGeneralEnums();
    return useMemo(() => enums.listingStatuses, [enums.listingStatuses]);
};

export const usePaymentTypes = () => {
    const { enums } = useGeneralEnums();
    return useMemo(() => enums.paymentTypes, [enums.paymentTypes]);
};

export const useShippingStatuses = () => {
    const { enums } = useGeneralEnums();
    return useMemo(() => enums.shippingStatuses, [enums.shippingStatuses]);
};

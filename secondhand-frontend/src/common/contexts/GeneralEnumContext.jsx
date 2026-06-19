import {createContext, useContext, useMemo} from 'react';

export const GeneralEnumContext = createContext();

export const useGeneralEnums = () => {
    const context = useContext(GeneralEnumContext);
    if (!context) {
        throw new Error('useGeneralEnums must be used within a GeneralEnumProvider');
    }
    return context;
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


import { useCallback, useMemo } from 'react';
import { getListingTypeIcon, getListingTypeLabel, getCurrencyLabel, getCurrencySymbol } from '../enums/listingEnums.js';
import { GeneralEnumContext } from './GeneralEnumContext.jsx';

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

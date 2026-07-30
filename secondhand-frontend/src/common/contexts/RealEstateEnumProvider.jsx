import { useCallback, useMemo } from 'react';
import {
  getRealEstateTypeLabel,
  getRealEstateAdTypeLabel,
  getHeatingTypeLabel,
  getOwnerTypeLabel
} from '../enums/realEstateEnums.js';
import { RealEstateEnumContext } from './RealEstateEnumContext.jsx';

export const RealEstateEnumProvider = ({ children, enums = {}, isLoading, error }) => {
    const getRealEstateTypeLabelMemo = useCallback(
        (value) => getRealEstateTypeLabel(value, enums?.realEstateTypes || []),
        [enums?.realEstateTypes]
    );

    const getRealEstateAdTypeLabelMemo = useCallback(
        (value) => getRealEstateAdTypeLabel(value, enums?.realEstateAdTypes || []),
        [enums?.realEstateAdTypes]
    );

    const getHeatingTypeLabelMemo = useCallback(
        (value) => getHeatingTypeLabel(value, enums?.heatingTypes || []),
        [enums?.heatingTypes]
    );

    const getOwnerTypeLabelMemo = useCallback(
        (value) => getOwnerTypeLabel(value, enums?.ownerTypes || []),
        [enums?.ownerTypes]
    );

    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
            getRealEstateTypeLabel: getRealEstateTypeLabelMemo,
            getRealEstateAdTypeLabel: getRealEstateAdTypeLabelMemo,
            getHeatingTypeLabel: getHeatingTypeLabelMemo,
            getOwnerTypeLabel: getOwnerTypeLabelMemo,
        }),
        [
            enums,
            isLoading,
            error,
            getRealEstateTypeLabelMemo,
            getRealEstateAdTypeLabelMemo,
            getHeatingTypeLabelMemo,
            getOwnerTypeLabelMemo,
        ]
    );

    return (
        <RealEstateEnumContext.Provider value={value}>
            {children}
        </RealEstateEnumContext.Provider>
    );
};

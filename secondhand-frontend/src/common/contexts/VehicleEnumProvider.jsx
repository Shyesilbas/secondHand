import { useCallback, useMemo } from 'react';
import { getCarBrandLabel, getFuelTypeLabel, getColorLabel } from '../enums/vehicleEnums.js';
import { VehicleEnumContext } from './VehicleEnumContext.jsx';

export const VehicleEnumProvider = ({ children, enums, isLoading, error }) => {
    const getCarBrandLabelMemo = useCallback(
        (value) => getCarBrandLabel(value, enums.carBrands),
        [enums.carBrands]
    );

    const getFuelTypeLabelMemo = useCallback(
        (value) => getFuelTypeLabel(value, enums.fuelTypes),
        [enums.fuelTypes]
    );

    const getColorLabelMemo = useCallback(
        (value) => getColorLabel(value, enums.colors),
        [enums.colors]
    );

    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
            getCarBrandLabel: getCarBrandLabelMemo,
            getFuelTypeLabel: getFuelTypeLabelMemo,
            getColorLabel: getColorLabelMemo,
        }),
        [enums, isLoading, error, getCarBrandLabelMemo, getFuelTypeLabelMemo, getColorLabelMemo]
    );

    return (
        <VehicleEnumContext.Provider value={value}>
            {children}
        </VehicleEnumContext.Provider>
    );
};

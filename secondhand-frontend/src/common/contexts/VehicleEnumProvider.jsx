import { useCallback, useMemo } from 'react';
import {
  getCarBrandLabel,
  getFuelTypeLabel,
  getColorLabel,
  getGearTypeLabel,
  getBodyTypeLabel,
  getDrivetrainLabel,
  getDoorsLabel,
  getSeatCountLabel
} from '../enums/vehicleEnums.js';
import { VehicleEnumContext } from './VehicleEnumContext.jsx';

export const VehicleEnumProvider = ({ children, enums = {}, isLoading, error }) => {
    const getCarBrandLabelMemo = useCallback(
        (value) => getCarBrandLabel(value, enums?.carBrands || []),
        [enums?.carBrands]
    );

    const getFuelTypeLabelMemo = useCallback(
        (value) => getFuelTypeLabel(value, enums?.fuelTypes || []),
        [enums?.fuelTypes]
    );

    const getColorLabelMemo = useCallback(
        (value) => getColorLabel(value, enums?.colors || []),
        [enums?.colors]
    );

    const getGearTypeLabelMemo = useCallback(
        (value) => getGearTypeLabel(value, enums?.gearTypes || []),
        [enums?.gearTypes]
    );

    const getBodyTypeLabelMemo = useCallback(
        (value) => getBodyTypeLabel(value, enums?.bodyTypes || []),
        [enums?.bodyTypes]
    );

    const getDrivetrainLabelMemo = useCallback(
        (value) => getDrivetrainLabel(value, enums?.drivetrains || []),
        [enums?.drivetrains]
    );

    const getDoorsLabelMemo = useCallback(
        (value) => getDoorsLabel(value, enums?.doors || []),
        [enums?.doors]
    );

    const getSeatCountLabelMemo = useCallback(
        (value) => getSeatCountLabel(value, enums?.seatCounts || []),
        [enums?.seatCounts]
    );

    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
            getCarBrandLabel: getCarBrandLabelMemo,
            getFuelTypeLabel: getFuelTypeLabelMemo,
            getColorLabel: getColorLabelMemo,
            getGearTypeLabel: getGearTypeLabelMemo,
            getBodyTypeLabel: getBodyTypeLabelMemo,
            getDrivetrainLabel: getDrivetrainLabelMemo,
            getDoorsLabel: getDoorsLabelMemo,
            getSeatCountLabel: getSeatCountLabelMemo,
        }),
        [
            enums,
            isLoading,
            error,
            getCarBrandLabelMemo,
            getFuelTypeLabelMemo,
            getColorLabelMemo,
            getGearTypeLabelMemo,
            getBodyTypeLabelMemo,
            getDrivetrainLabelMemo,
            getDoorsLabelMemo,
            getSeatCountLabelMemo
        ]
    );

    return (
        <VehicleEnumContext.Provider value={value}>
            {children}
        </VehicleEnumContext.Provider>
    );
};

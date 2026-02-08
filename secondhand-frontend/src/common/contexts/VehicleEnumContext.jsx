import {createContext, useCallback, useContext, useMemo} from 'react';
import {getCarBrandLabel, getFuelTypeLabel, getColorLabel} from '../enums/vehicleEnums.js';

const VehicleEnumContext = createContext();

export const useVehicleEnums = () => {
    const context = useContext(VehicleEnumContext);
    if (!context) {
        throw new Error('useVehicleEnums must be used within a VehicleEnumProvider');
    }
    return context;
};

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

// Selector hooks for specific vehicle enums
export const useCarBrands = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.carBrands, [enums.carBrands]);
};

export const useVehicleTypes = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.vehicleTypes, [enums.vehicleTypes]);
};

export const useVehicleModels = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.vehicleModels, [enums.vehicleModels]);
};

export const useFuelTypes = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.fuelTypes, [enums.fuelTypes]);
};

export const useColors = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.colors, [enums.colors]);
};

export const useDoors = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.doors, [enums.doors]);
};

export const useGearTypes = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.gearTypes, [enums.gearTypes]);
};

export const useSeatCounts = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.seatCounts, [enums.seatCounts]);
};

export const useDrivetrains = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.drivetrains, [enums.drivetrains]);
};

export const useBodyTypes = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.bodyTypes, [enums.bodyTypes]);
};

import {createContext, useContext, useMemo} from 'react';

export const VehicleEnumContext = createContext();

export const useVehicleEnums = () => {
    const context = useContext(VehicleEnumContext);
    if (!context) {
        throw new Error('useVehicleEnums must be used within a VehicleEnumProvider');
    }
    return context;
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

export const useVehicleGenerations = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.vehicleGenerations, [enums.vehicleGenerations]);
};

export const useVehicleEngines = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.vehicleEngines, [enums.vehicleEngines]);
};

export const useVehicleTrims = () => {
    const { enums } = useVehicleEnums();
    return useMemo(() => enums.vehicleTrims, [enums.vehicleTrims]);
};


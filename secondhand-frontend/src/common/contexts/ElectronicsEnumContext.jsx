import {createContext, useContext, useMemo} from 'react';

const ElectronicsEnumContext = createContext();

export const useElectronicsEnums = () => {
    const context = useContext(ElectronicsEnumContext);
    if (!context) {
        throw new Error('useElectronicsEnums must be used within an ElectronicsEnumProvider');
    }
    return context;
};

export const ElectronicsEnumProvider = ({ children, enums, isLoading, error }) => {
    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
        }),
        [enums, isLoading, error]
    );

    return (
        <ElectronicsEnumContext.Provider value={value}>
            {children}
        </ElectronicsEnumContext.Provider>
    );
};

// Selector hooks for specific electronics enums
export const useElectronicTypes = () => {
    const { enums } = useElectronicsEnums();
    return useMemo(() => enums.electronicTypes, [enums.electronicTypes]);
};

export const useElectronicBrands = () => {
    const { enums } = useElectronicsEnums();
    return useMemo(() => enums.electronicBrands, [enums.electronicBrands]);
};

export const useElectronicModels = () => {
    const { enums } = useElectronicsEnums();
    return useMemo(() => enums.electronicModels, [enums.electronicModels]);
};

export const useStorageTypes = () => {
    const { enums } = useElectronicsEnums();
    return useMemo(() => enums.storageTypes, [enums.storageTypes]);
};

export const useElectronicConnectionTypes = () => {
    const { enums } = useElectronicsEnums();
    return useMemo(() => enums.electronicConnectionTypes, [enums.electronicConnectionTypes]);
};

export const useProcessors = () => {
    const { enums } = useElectronicsEnums();
    return useMemo(() => enums.processors, [enums.processors]);
};

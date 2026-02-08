import {createContext, useContext, useMemo} from 'react';

const SportEnumContext = createContext();

export const useSportEnums = () => {
    const context = useContext(SportEnumContext);
    if (!context) {
        throw new Error('useSportEnums must be used within a SportEnumProvider');
    }
    return context;
};

export const SportEnumProvider = ({ children, enums, isLoading, error }) => {
    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
        }),
        [enums, isLoading, error]
    );

    return (
        <SportEnumContext.Provider value={value}>
            {children}
        </SportEnumContext.Provider>
    );
};

// Selector hooks for specific sport enums
export const useSportDisciplines = () => {
    const { enums } = useSportEnums();
    return useMemo(() => enums.sportDisciplines, [enums.sportDisciplines]);
};

export const useSportEquipmentTypes = () => {
    const { enums } = useSportEnums();
    return useMemo(() => enums.sportEquipmentTypes, [enums.sportEquipmentTypes]);
};

export const useSportConditions = () => {
    const { enums } = useSportEnums();
    return useMemo(() => enums.sportConditions, [enums.sportConditions]);
};

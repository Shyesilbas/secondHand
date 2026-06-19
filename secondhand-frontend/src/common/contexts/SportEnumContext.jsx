import {createContext, useContext, useMemo} from 'react';

export const SportEnumContext = createContext();

export const useSportEnums = () => {
    const context = useContext(SportEnumContext);
    if (!context) {
        throw new Error('useSportEnums must be used within a SportEnumProvider');
    }
    return context;
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


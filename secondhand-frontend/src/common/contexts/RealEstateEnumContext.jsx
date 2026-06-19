import {createContext, useContext, useMemo} from 'react';

export const RealEstateEnumContext = createContext();

export const useRealEstateEnums = () => {
    const context = useContext(RealEstateEnumContext);
    if (!context) {
        throw new Error('useRealEstateEnums must be used within a RealEstateEnumProvider');
    }
    return context;
};

// Selector hooks for specific real estate enums
export const useRealEstateTypes = () => {
    const { enums } = useRealEstateEnums();
    return useMemo(() => enums.realEstateTypes, [enums.realEstateTypes]);
};

export const useRealEstateAdTypes = () => {
    const { enums } = useRealEstateEnums();
    return useMemo(() => enums.realEstateAdTypes, [enums.realEstateAdTypes]);
};

export const useHeatingTypes = () => {
    const { enums } = useRealEstateEnums();
    return useMemo(() => enums.heatingTypes, [enums.heatingTypes]);
};

export const useOwnerTypes = () => {
    const { enums } = useRealEstateEnums();
    return useMemo(() => enums.ownerTypes, [enums.ownerTypes]);
};


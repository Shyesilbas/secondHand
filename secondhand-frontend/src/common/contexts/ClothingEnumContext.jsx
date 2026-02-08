import {createContext, useContext, useMemo} from 'react';

const ClothingEnumContext = createContext();

export const useClothingEnums = () => {
    const context = useContext(ClothingEnumContext);
    if (!context) {
        throw new Error('useClothingEnums must be used within a ClothingEnumProvider');
    }
    return context;
};

export const ClothingEnumProvider = ({ children, enums, isLoading, error }) => {
    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
        }),
        [enums, isLoading, error]
    );

    return (
        <ClothingEnumContext.Provider value={value}>
            {children}
        </ClothingEnumContext.Provider>
    );
};

// Selector hooks for specific clothing enums
export const useClothingBrands = () => {
    const { enums } = useClothingEnums();
    return useMemo(() => enums.clothingBrands, [enums.clothingBrands]);
};

export const useClothingTypes = () => {
    const { enums } = useClothingEnums();
    return useMemo(() => enums.clothingTypes, [enums.clothingTypes]);
};

export const useClothingConditions = () => {
    const { enums } = useClothingEnums();
    return useMemo(() => enums.clothingConditions, [enums.clothingConditions]);
};

export const useClothingGenders = () => {
    const { enums } = useClothingEnums();
    return useMemo(() => enums.clothingGenders, [enums.clothingGenders]);
};

export const useClothingCategories = () => {
    const { enums } = useClothingEnums();
    return useMemo(() => enums.clothingCategories, [enums.clothingCategories]);
};

export const useClothingSizes = () => {
    const { enums } = useClothingEnums();
    return useMemo(() => enums.clothingSizes, [enums.clothingSizes]);
};

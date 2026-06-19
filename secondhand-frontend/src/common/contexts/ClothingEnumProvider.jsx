import { useMemo } from 'react';
import { ClothingEnumContext } from './ClothingEnumContext.jsx';

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

import { useMemo } from 'react';
import { RealEstateEnumContext } from './RealEstateEnumContext.jsx';

export const RealEstateEnumProvider = ({ children, enums, isLoading, error }) => {
    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
        }),
        [enums, isLoading, error]
    );

    return (
        <RealEstateEnumContext.Provider value={value}>
            {children}
        </RealEstateEnumContext.Provider>
    );
};

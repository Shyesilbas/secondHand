import { useMemo } from 'react';
import { SportEnumContext } from './SportEnumContext.jsx';

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

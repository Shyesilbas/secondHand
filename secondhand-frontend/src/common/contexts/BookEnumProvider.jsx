import { useMemo } from 'react';
import { BookEnumContext } from './BookEnumContext.jsx';

export const BookEnumProvider = ({ children, enums, isLoading, error }) => {
    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
        }),
        [enums, isLoading, error]
    );

    return (
        <BookEnumContext.Provider value={value}>
            {children}
        </BookEnumContext.Provider>
    );
};

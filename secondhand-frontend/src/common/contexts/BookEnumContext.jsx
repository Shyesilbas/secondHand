import {createContext, useContext, useMemo} from 'react';

const BookEnumContext = createContext();

export const useBookEnums = () => {
    const context = useContext(BookEnumContext);
    if (!context) {
        throw new Error('useBookEnums must be used within a BookEnumProvider');
    }
    return context;
};

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

// Selector hooks for specific book enums
export const useBookTypes = () => {
    const { enums } = useBookEnums();
    return useMemo(() => enums.bookTypes, [enums.bookTypes]);
};

export const useBookGenres = () => {
    const { enums } = useBookEnums();
    return useMemo(() => enums.bookGenres, [enums.bookGenres]);
};

export const useBookLanguages = () => {
    const { enums } = useBookEnums();
    return useMemo(() => enums.bookLanguages, [enums.bookLanguages]);
};

export const useBookFormats = () => {
    const { enums } = useBookEnums();
    return useMemo(() => enums.bookFormats, [enums.bookFormats]);
};

export const useBookConditions = () => {
    const { enums } = useBookEnums();
    return useMemo(() => enums.bookConditions, [enums.bookConditions]);
};

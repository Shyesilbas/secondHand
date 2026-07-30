import { createContext } from 'react';

export const BooksEnumContext = createContext({
    enums: {},
    isLoading: false,
    error: null,
    getBookTypeLabel: (v) => v,
    getBookGenreLabel: (v) => v,
    getBookLanguageLabel: (v) => v,
    getBookFormatLabel: (v) => v,
    getBookConditionLabel: (v) => v,
});

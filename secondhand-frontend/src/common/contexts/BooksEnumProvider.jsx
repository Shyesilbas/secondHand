import { useCallback, useMemo } from 'react';
import {
 getBookTypeLabel,
 getBookGenreLabel,
 getBookLanguageLabel,
 getBookFormatLabel,
 getBookConditionLabel
} from '../enums/booksEnums.js';
import { BooksEnumContext } from './BooksEnumContext.jsx';

export const BooksEnumProvider = ({ children, enums = {}, isLoading, error }) => {
 const getBookTypeLabelMemo = useCallback(
 (value) => getBookTypeLabel(value, enums?.bookTypes || []),
 [enums?.bookTypes]
 );

 const getBookGenreLabelMemo = useCallback(
 (value) => getBookGenreLabel(value, enums?.bookGenres || []),
 [enums?.bookGenres]
 );

 const getBookLanguageLabelMemo = useCallback(
 (value) => getBookLanguageLabel(value, enums?.bookLanguages || []),
 [enums?.bookLanguages]
 );

 const getBookFormatLabelMemo = useCallback(
 (value) => getBookFormatLabel(value, enums?.bookFormats || []),
 [enums?.bookFormats]
 );

 const getBookConditionLabelMemo = useCallback(
 (value) => getBookConditionLabel(value, enums?.bookConditions || []),
 [enums?.bookConditions]
 );

 const value = useMemo(
 () => ({
 enums,
 isLoading,
 error,
 getBookTypeLabel: getBookTypeLabelMemo,
 getBookGenreLabel: getBookGenreLabelMemo,
 getBookLanguageLabel: getBookLanguageLabelMemo,
 getBookFormatLabel: getBookFormatLabelMemo,
 getBookConditionLabel: getBookConditionLabelMemo,
 }),
 [
 enums,
 isLoading,
 error,
 getBookTypeLabelMemo,
 getBookGenreLabelMemo,
 getBookLanguageLabelMemo,
 getBookFormatLabelMemo,
 getBookConditionLabelMemo,
 ]
 );

 return (
 <BooksEnumContext.Provider value={value}>
 {children}
 </BooksEnumContext.Provider>
 );
};

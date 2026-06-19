import {createContext, useContext} from 'react';

export const EnumContext = createContext();

export const useEnumContext = () => {
    const context = useContext(EnumContext);
    if (!context) {
        throw new Error('useEnumContext must be used within an EnumProvider');
    }
    return context;
};
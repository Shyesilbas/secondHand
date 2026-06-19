import { useMemo } from 'react';
import { ElectronicsEnumContext } from './ElectronicsEnumContext.jsx';

export const ElectronicsEnumProvider = ({ children, enums, isLoading, error }) => {
    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
        }),
        [enums, isLoading, error]
    );

    return (
        <ElectronicsEnumContext.Provider value={value}>
            {children}
        </ElectronicsEnumContext.Provider>
    );
};

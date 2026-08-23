import { useCallback, useMemo } from 'react';
import {
 getElectronicTypeLabel,
 getElectronicBrandLabel,
 getProcessorLabel,
 getStorageTypeLabel,
 getElectronicConditionLabel,
 getElectronicConnectionTypeLabel
} from '../enums/electronicsEnums.js';
import { ElectronicsEnumContext } from './ElectronicsEnumContext.jsx';

export const ElectronicsEnumProvider = ({ children, enums = {}, isLoading, error }) => {
 const getElectronicTypeLabelMemo = useCallback(
 (value) => getElectronicTypeLabel(value, enums?.electronicTypes || []),
 [enums?.electronicTypes]
 );

 const getElectronicBrandLabelMemo = useCallback(
 (value) => getElectronicBrandLabel(value, enums?.electronicBrands || []),
 [enums?.electronicBrands]
 );

 const getProcessorLabelMemo = useCallback(
 (value) => getProcessorLabel(value, enums?.processors || []),
 [enums?.processors]
 );

 const getStorageTypeLabelMemo = useCallback(
 (value) => getStorageTypeLabel(value, enums?.storageTypes || []),
 [enums?.storageTypes]
 );

 const getElectronicConditionLabelMemo = useCallback(
 (value) => getElectronicConditionLabel(value, enums?.electronicConditions || []),
 [enums?.electronicConditions]
 );

 const getElectronicConnectionTypeLabelMemo = useCallback(
 (value) => getElectronicConnectionTypeLabel(value, enums?.electronicConnectionTypes || []),
 [enums?.electronicConnectionTypes]
 );

 const value = useMemo(
 () => ({
 enums,
 isLoading,
 error,
 getElectronicTypeLabel: getElectronicTypeLabelMemo,
 getElectronicBrandLabel: getElectronicBrandLabelMemo,
 getProcessorLabel: getProcessorLabelMemo,
 getStorageTypeLabel: getStorageTypeLabelMemo,
 getElectronicConditionLabel: getElectronicConditionLabelMemo,
 getElectronicConnectionTypeLabel: getElectronicConnectionTypeLabelMemo,
 }),
 [
 enums,
 isLoading,
 error,
 getElectronicTypeLabelMemo,
 getElectronicBrandLabelMemo,
 getProcessorLabelMemo,
 getStorageTypeLabelMemo,
 getElectronicConditionLabelMemo,
 getElectronicConnectionTypeLabelMemo,
 ]
 );

 return (
 <ElectronicsEnumContext.Provider value={value}>
 {children}
 </ElectronicsEnumContext.Provider>
 );
};

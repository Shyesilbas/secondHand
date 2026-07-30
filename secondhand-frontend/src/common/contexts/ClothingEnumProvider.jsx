import { useCallback, useMemo } from 'react';
import {
  getClothingBrandLabel,
  getClothingTypeLabel,
  getClothingSizeLabel,
  getClothingConditionLabel,
  getClothingGenderLabel,
  getClothingCategoryLabel
} from '../enums/clothingEnums.js';
import { ClothingEnumContext } from './ClothingEnumContext.jsx';

export const ClothingEnumProvider = ({ children, enums = {}, isLoading, error }) => {
    const getClothingBrandLabelMemo = useCallback(
        (value) => getClothingBrandLabel(value, enums?.clothingBrands || []),
        [enums?.clothingBrands]
    );

    const getClothingTypeLabelMemo = useCallback(
        (value) => getClothingTypeLabel(value, enums?.clothingTypes || []),
        [enums?.clothingTypes]
    );

    const getClothingSizeLabelMemo = useCallback(
        (value) => getClothingSizeLabel(value, enums?.clothingSizes || []),
        [enums?.clothingSizes]
    );

    const getClothingConditionLabelMemo = useCallback(
        (value) => getClothingConditionLabel(value, enums?.clothingConditions || []),
        [enums?.clothingConditions]
    );

    const getClothingGenderLabelMemo = useCallback(
        (value) => getClothingGenderLabel(value, enums?.clothingGenders || []),
        [enums?.clothingGenders]
    );

    const getClothingCategoryLabelMemo = useCallback(
        (value) => getClothingCategoryLabel(value, enums?.clothingCategories || []),
        [enums?.clothingCategories]
    );

    const value = useMemo(
        () => ({
            enums,
            isLoading,
            error,
            getClothingBrandLabel: getClothingBrandLabelMemo,
            getClothingTypeLabel: getClothingTypeLabelMemo,
            getClothingSizeLabel: getClothingSizeLabelMemo,
            getClothingConditionLabel: getClothingConditionLabelMemo,
            getClothingGenderLabel: getClothingGenderLabelMemo,
            getClothingCategoryLabel: getClothingCategoryLabelMemo,
        }),
        [
            enums,
            isLoading,
            error,
            getClothingBrandLabelMemo,
            getClothingTypeLabelMemo,
            getClothingSizeLabelMemo,
            getClothingConditionLabelMemo,
            getClothingGenderLabelMemo,
            getClothingCategoryLabelMemo,
        ]
    );

    return (
        <ClothingEnumContext.Provider value={value}>
            {children}
        </ClothingEnumContext.Provider>
    );
};

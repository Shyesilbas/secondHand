import { useMemo } from 'react';
import { useEnumContext } from '../contexts/EnumContext.jsx';
import { useGeneralEnums } from '../contexts/GeneralEnumContext.jsx';

export const useEnums = () => {
  const enumContext = useEnumContext();
  const generalEnums = useGeneralEnums();
  
  const flattenedEnums = useMemo(() => {
    const { enums } = enumContext;
    if (!enums) return {};
    
    return {
      ...enums.general,
      ...enums.vehicle,
      ...enums.electronics,
      ...enums.realEstate,
      ...enums.clothing,
      ...enums.book,
      ...enums.sport,
    };
  }, [enumContext]);
  
  return {
    ...enumContext,
    ...generalEnums,
    enums: flattenedEnums,
  };
};
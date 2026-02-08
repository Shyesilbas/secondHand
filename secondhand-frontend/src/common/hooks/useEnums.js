import { useEnumContext } from '../contexts/EnumContext.jsx';
import { useGeneralEnums } from '../contexts/GeneralEnumContext.jsx';

export const useEnums = () => {
  const enumContext = useEnumContext();
  const generalEnums = useGeneralEnums();
  
  return {
    ...enumContext,
    ...generalEnums,
  };
};
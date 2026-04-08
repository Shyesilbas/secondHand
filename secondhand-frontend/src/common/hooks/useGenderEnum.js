import { useEnumContext } from '../contexts/EnumContext.jsx';

export const useGenderEnum = () => {
  const { enums, isLoading } = useEnumContext();

  return { 
    genders: enums.general?.genders || [], 
    isLoading 
  };
};

import { useEnums } from './useEnums.js';

export const useGenderEnum = () => {
 const { enums, isLoading } = useEnums();
 return { genders: enums.genders || [], isLoading };
};

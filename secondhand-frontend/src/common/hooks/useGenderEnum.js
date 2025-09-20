import { useState, useEffect } from 'react';
import { enumService } from '../services/enumService.js';

export const useGenderEnum = () => {
  const [genders, setGenders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    enumService.getGenders().then((data) => {
      if (mounted) setGenders(Array.isArray(data) ? data : []);
    }).finally(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { genders, isLoading };
};

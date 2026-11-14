import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { enumService } from '../services/enumService.js';
import { PREFILTER_CATEGORY_COPY } from '../../listing/config/prefilterCopy.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const NO_ENUMS = {};

// The backend returns every enum in one flat object; React Query caches it app-wide.
export const useEnums = (options = {}) => {
  const { t, i18n } = useTranslation();
  const enabled = options.enabled ?? true;
  const { data: enums = NO_ENUMS, isLoading, error } = useQuery({
    queryKey: ['enums'],
    queryFn: enumService.getAllEnums,
    enabled,
    staleTime: DAY_MS,
    gcTime: DAY_MS,
    refetchOnWindowFocus: false,
  });

  const getLabel = useCallback(
    (value) => {
      void i18n.language;
      if (!value) return '';
      const key = `category_${String(value).toLowerCase()}`;
      const translated = t(key);
      if (translated && translated !== key) return translated;
      const copy = PREFILTER_CATEGORY_COPY[value];
      if (copy?.label) return copy.label;
      return enums.listingTypes?.find((t) => t.value === value)?.label || value;
    },
    [enums.listingTypes, t, i18n.language]
  );

  // Verticals that may receive seller campaigns or platform coupons; the backend owns this rule.
  const discountableListingTypes = useMemo(
    () => (enums.listingTypes || []).filter((type) => type.discountable).map((type) => type.value),
    [enums.listingTypes]
  );

  return { enums, isLoading, error, getListingTypeLabel: getLabel, discountableListingTypes };
};

import { useMemo } from 'react';
import { useListingEntityAlias } from '../../common/hooks/useListingEntityAlias.js';
import { createSportsServiceAdapter } from '../../common/services/entityAdapters.js';
import { sportsService } from '../services/sportsService.js';
import { SportsListingDTO } from '../sports.js';

export const useSports = (sportsId = null) => {
  const adapter = useMemo(() => createSportsServiceAdapter(sportsService), []);
  return useListingEntityAlias(adapter, {
    entityId: sportsId,
    defaultData: SportsListingDTO,
    entityName: 'Sports',
    keys: {
      entity: 'sports',
      fetch: 'fetchSports',
      create: 'createSports',
      update: 'updateSports',
      delete: 'deleteSports',
    },
  });
};

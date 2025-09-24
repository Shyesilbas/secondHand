import { useEntity } from '../../common/hooks/useEntity.js';
import { useEntitySearch } from '../../common/hooks/useEntitySearch.js';
import { createSportsServiceAdapter } from '../../common/services/entityAdapters.js';
import { sportsService } from '../services/sportsService.js';
import { SportsListingDTO } from '../sports.js';
import { useMemo } from 'react';

export const useSports = (sportsId = null) => {
  const sportsServiceAdapter = useMemo(() => createSportsServiceAdapter(sportsService), []);
  
  const result = useEntity({
    entityId: sportsId,
    service: sportsServiceAdapter,
    defaultData: SportsListingDTO,
    entityName: 'Sports'
  });

    return {
    ...result,
    sports: result.entity,
    fetchSports: result.fetchEntity,
    createSports: result.createEntity,
    updateSports: result.updateEntity,
    deleteSports: result.deleteEntity
  };
};



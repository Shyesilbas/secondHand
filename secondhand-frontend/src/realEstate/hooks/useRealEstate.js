import { useMemo } from 'react';
import { useEntitySearch } from '../../common/hooks/useEntitySearch.js';
import { useListingEntityAlias } from '../../common/hooks/useListingEntityAlias.js';
import { createRealEstateServiceAdapter } from '../../common/services/entityAdapters.js';
import { realEstateService } from '../services/realEstateService.js';
import { RealEstateListingDTO } from '../realEstates.js';

export const useRealEstate = (realEstateId = null) => {
  const adapter = useMemo(() => createRealEstateServiceAdapter(realEstateService), []);
  return useListingEntityAlias(adapter, {
    entityId: realEstateId,
    defaultData: RealEstateListingDTO,
    entityName: 'Real Estate',
    keys: {
      entity: 'realEstate',
      fetch: 'fetchRealEstate',
      create: 'createRealEstate',
      update: 'updateRealEstate',
      delete: 'deleteRealEstate',
    },
  });
};

export const useRealEstateSearch = () => {
  const realEstateServiceAdapter = useMemo(() => createRealEstateServiceAdapter(realEstateService), []);

  const result = useEntitySearch({
    service: realEstateServiceAdapter,
    entityName: 'Real Estate',
    defaultData: [],
  });

  return {
    ...result,
    realEstates: result.entities,
  };
};

import { useEntity } from '../../common/hooks/useEntity.js';
import { useEntitySearch } from '../../common/hooks/useEntitySearch.js';
import { createRealEstateServiceAdapter } from '../../common/services/entityAdapters.js';
import { realEstateService } from '../services/realEstateService.js';
import { RealEstateListingDTO } from '../realEstates.js';
import { useMemo } from 'react';

export const useRealEstate = (realEstateId = null) => {
  const realEstateServiceAdapter = useMemo(() => createRealEstateServiceAdapter(realEstateService), []);
  
  const result = useEntity({
    entityId: realEstateId,
    service: realEstateServiceAdapter,
    defaultData: RealEstateListingDTO,
    entityName: 'Real Estate'
  });

  return {
    ...result,
    realEstate: result.entity,
    fetchRealEstate: result.fetchEntity,
    createRealEstate: result.createEntity,
    updateRealEstate: result.updateEntity,
    deleteRealEstate: result.deleteEntity
  };
};

// Hook for real estate search operations
export const useRealEstateSearch = () => {
  const realEstateServiceAdapter = useMemo(() => createRealEstateServiceAdapter(realEstateService), []);
  
  const result = useEntitySearch({
    service: realEstateServiceAdapter,
    entityName: 'Real Estate',
    defaultData: []
  });

  // Map entities to realEstates for backward compatibility
  return {
    ...result,
    realEstates: result.entities
  };
};

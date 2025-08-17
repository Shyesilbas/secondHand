import { useEntity } from '../../../hooks/useEntity';
import { useEntitySearch } from '../../../hooks/useEntitySearch';
import { createRealEstateServiceAdapter } from '../../../services/entityAdapters';
import { realEstateService } from '../services/realEstateService';
import { RealEstateListingDTO } from '../../../types/realEstates';
import { useMemo } from 'react';

export const useRealEstate = (realEstateId = null) => {
  const realEstateServiceAdapter = useMemo(() => createRealEstateServiceAdapter(realEstateService), []);
  
  const result = useEntity({
    entityId: realEstateId,
    service: realEstateServiceAdapter,
    defaultData: RealEstateListingDTO,
    entityName: 'Real Estate'
  });

  // Map entity to realEstate for backward compatibility
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

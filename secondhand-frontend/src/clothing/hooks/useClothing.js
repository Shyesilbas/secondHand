import { useEntity } from '../../common/hooks/useEntity.js';
import { useEntitySearch } from '../../common/hooks/useEntitySearch.js';
import { createClothingServiceAdapter } from '../../common/services/entityAdapters.js';
import { clothingService } from '../services/clothingService.js';
import { ClothingListingDTO } from '../clothing.js';
import { useMemo } from 'react';

export const useClothing = (clothingId = null) => {
  const clothingServiceAdapter = useMemo(() => createClothingServiceAdapter(clothingService), []);
  
  const result = useEntity({
    entityId: clothingId,
    service: clothingServiceAdapter,
    defaultData: ClothingListingDTO,
    entityName: 'Clothing'
  });

  // Map entity to clothing for backward compatibility
  return {
    ...result,
    clothing: result.entity,
    fetchClothing: result.fetchEntity,
    createClothing: result.createEntity,
    updateClothing: result.updateEntity,
    deleteClothing: result.deleteEntity,
    // Legacy methods for backward compatibility
    createClothingListing: result.createEntity,
    updateClothingListing: result.updateEntity
  };
};
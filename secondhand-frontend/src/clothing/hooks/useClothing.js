import { useMemo } from 'react';
import { useListingEntityAlias } from '../../common/hooks/useListingEntityAlias.js';
import { createClothingServiceAdapter } from '../../common/services/entityAdapters.js';
import { clothingService } from '../services/clothingService.js';
import { ClothingListingDTO } from '../clothing.js';

export const useClothing = (clothingId = null) => {
  const adapter = useMemo(() => createClothingServiceAdapter(clothingService), []);
  const base = useListingEntityAlias(adapter, {
    entityId: clothingId,
    defaultData: ClothingListingDTO,
    entityName: 'Clothing',
    keys: {
      entity: 'clothing',
      fetch: 'fetchClothing',
      create: 'createClothing',
      update: 'updateClothing',
      delete: 'deleteClothing',
    },
  });
  return {
    ...base,
    createClothingListing: base.createClothing,
    updateClothingListing: base.updateClothing,
  };
};

import { useMemo } from 'react';
import { useEntitySearch } from '../../common/hooks/useEntitySearch.js';
import { useListingEntityAlias } from '../../common/hooks/useListingEntityAlias.js';
import { createElectronicsServiceAdapter } from '../../common/services/entityAdapters.js';
import { electronicService } from '../services/electronicService.js';
import { ElectronicListingDTO } from '../electronics.js';

export const useElectronic = (electronicId = null) => {
  const adapter = useMemo(() => createElectronicsServiceAdapter(electronicService), []);
  return useListingEntityAlias(adapter, {
    entityId: electronicId,
    defaultData: ElectronicListingDTO,
    entityName: 'Electronic',
    keys: {
      entity: 'electronic',
      fetch: 'fetchElectronic',
      create: 'createElectronic',
      update: 'updateElectronic',
      delete: 'deleteElectronic',
    },
  });
};

export const useElectronicSearch = () => {
  const electronicsServiceAdapter = useMemo(() => createElectronicsServiceAdapter(electronicService), []);

  const result = useEntitySearch({
    service: electronicsServiceAdapter,
    entityName: 'Electronic',
    defaultData: [],
  });

  return {
    ...result,
    electronics: result.entities,
    searchByType: result.searchByCriteria,
  };
};

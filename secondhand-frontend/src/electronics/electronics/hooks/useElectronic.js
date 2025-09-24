import { useEntity } from '../../../common/hooks/useEntity.js';
import { useEntitySearch } from '../../../common/hooks/useEntitySearch.js';
import { createElectronicsServiceAdapter } from '../../../common/services/entityAdapters.js';
import { electronicService } from '../services/electronicService.js';
import { ElectronicListingDTO } from '../../electronics.js';
import { useMemo } from 'react';

export const useElectronic = (electronicId = null) => {
  const electronicsServiceAdapter = useMemo(() => createElectronicsServiceAdapter(electronicService), []);
  
  const result = useEntity({
    entityId: electronicId,
    service: electronicsServiceAdapter,
    defaultData: ElectronicListingDTO,
    entityName: 'Electronic'
  });

    return {
    ...result,
    electronic: result.entity,
    fetchElectronic: result.fetchEntity,
    createElectronic: result.createEntity,
    updateElectronic: result.updateEntity,
    deleteElectronic: result.deleteEntity
  };
};

export const useElectronicSearch = () => {
  const electronicsServiceAdapter = useMemo(() => createElectronicsServiceAdapter(electronicService), []);
  
  const result = useEntitySearch({
    service: electronicsServiceAdapter,
    entityName: 'Electronic',
    defaultData: []
  });

    return {
    ...result,
    electronics: result.entities,
    searchByType: result.searchByCriteria
  };
};



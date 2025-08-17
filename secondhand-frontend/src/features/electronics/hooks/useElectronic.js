import { useEntity } from '../../../hooks/useEntity';
import { useEntitySearch } from '../../../hooks/useEntitySearch';
import { createElectronicsServiceAdapter } from '../../../services/entityAdapters';
import { electronicService } from '../services/electronicService';
import { ElectronicListingDTO } from '../../../types/electronics';
import { useMemo } from 'react';

export const useElectronic = (electronicId = null) => {
  const electronicsServiceAdapter = useMemo(() => createElectronicsServiceAdapter(electronicService), []);
  
  const result = useEntity({
    entityId: electronicId,
    service: electronicsServiceAdapter,
    defaultData: ElectronicListingDTO,
    entityName: 'Electronic'
  });

  // Map entity to electronic for backward compatibility
  return {
    ...result,
    electronic: result.entity,
    fetchElectronic: result.fetchEntity,
    createElectronic: result.createEntity,
    updateElectronic: result.updateEntity,
    deleteElectronic: result.deleteEntity
  };
};

// Hook for electronic search operations
export const useElectronicSearch = () => {
  const electronicsServiceAdapter = useMemo(() => createElectronicsServiceAdapter(electronicService), []);
  
  const result = useEntitySearch({
    service: electronicsServiceAdapter,
    entityName: 'Electronic',
    defaultData: []
  });

  // Map entities to electronics for backward compatibility
  return {
    ...result,
    electronics: result.entities,
    searchByType: result.searchByCriteria
  };
};



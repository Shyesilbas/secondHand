import { useMemo, useEffect, useState } from 'react';
import { useListingEntityAlias } from '../../common/hooks/useListingEntityAlias.js';
import { useEntitySearch } from '../../common/hooks/useEntitySearch.js';
import { createVehicleServiceAdapter } from '../../common/services/entityAdapters.js';
import { vehicleService } from '../services/vehicleService.js';
import { VehicleListingDTO } from '../vehicles.js';

export const useVehicle = (vehicleId = null) => {
  const adapter = useMemo(() => createVehicleServiceAdapter(vehicleService), []);
  return useListingEntityAlias(adapter, {
    entityId: vehicleId,
    defaultData: VehicleListingDTO,
    entityName: 'Vehicle',
    keys: {
      entity: 'vehicle',
      fetch: 'fetchVehicle',
      create: 'createVehicle',
      update: 'updateVehicle',
      delete: 'deleteVehicle',
    },
  });
};

export const useVehicleSearch = () => {
  const vehicleServiceAdapter = useMemo(() => createVehicleServiceAdapter(vehicleService), []);

  const result = useEntitySearch({
    service: vehicleServiceAdapter,
    entityName: 'Vehicle',
    defaultData: [],
  });

  return {
    ...result,
    vehicles: result.entities,
    searchByBrandAndModel: result.searchByCriteria,
  };
};

export const useCarBrands = () => {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await vehicleService.getCarBrands();
      setBrands(data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error occurred while fetching car brands. Please try again later.';
      setError(msg);
      console.error('Error fetching car brands:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    isLoading,
    error,
    refetch: fetchBrands,
  };
};

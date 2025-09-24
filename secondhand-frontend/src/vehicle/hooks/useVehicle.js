import { useEntity } from '../../common/hooks/useEntity.js';
import { useEntitySearch } from '../../common/hooks/useEntitySearch.js';
import { createVehicleServiceAdapter } from '../../common/services/entityAdapters.js';
import { vehicleService } from '../services/vehicleService.js';
import { VehicleListingDTO } from '../vehicles.js';
import { useMemo } from 'react';

export const useVehicle = (vehicleId = null) => {
  const vehicleServiceAdapter = useMemo(() => createVehicleServiceAdapter(vehicleService), []);
  
  const result = useEntity({
    entityId: vehicleId,
    service: vehicleServiceAdapter,
    defaultData: VehicleListingDTO,
    entityName: 'Vehicle'
  });

    return {
    ...result,
    vehicle: result.entity,
    fetchVehicle: result.fetchEntity,
    createVehicle: result.createEntity,
    updateVehicle: result.updateEntity,
    deleteVehicle: result.deleteEntity
  };
};

export const useVehicleSearch = () => {
  const vehicleServiceAdapter = useMemo(() => createVehicleServiceAdapter(vehicleService), []);
  
  const result = useEntitySearch({
    service: vehicleServiceAdapter,
    entityName: 'Vehicle',
    defaultData: []
  });

    return {
    ...result,
    vehicles: result.entities,
    searchByBrandAndModel: result.searchByCriteria
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
      setError(err.response?.data?.message || 'Error occurred while fetching car brands. Please try again later.');
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
import { useEntity } from '../../../hooks/useEntity';
import { useEntitySearch } from '../../../hooks/useEntitySearch';
import { createVehicleServiceAdapter } from '../../../services/entityAdapters';
import { vehicleService } from '../services/vehicleService';
import { VehicleListingDTO } from '../../../types/vehicles';
import { useMemo } from 'react';

export const useVehicle = (vehicleId = null) => {
  const vehicleServiceAdapter = useMemo(() => createVehicleServiceAdapter(vehicleService), []);
  
  const result = useEntity({
    entityId: vehicleId,
    service: vehicleServiceAdapter,
    defaultData: VehicleListingDTO,
    entityName: 'Vehicle'
  });

  // Map entity to vehicle for backward compatibility
  return {
    ...result,
    vehicle: result.entity,
    fetchVehicle: result.fetchEntity,
    createVehicle: result.createEntity,
    updateVehicle: result.updateEntity,
    deleteVehicle: result.deleteEntity
  };
};

// Hook for vehicle search operations
export const useVehicleSearch = () => {
  const vehicleServiceAdapter = useMemo(() => createVehicleServiceAdapter(vehicleService), []);
  
  const result = useEntitySearch({
    service: vehicleServiceAdapter,
    entityName: 'Vehicle',
    defaultData: []
  });

  // Map entities to vehicles for backward compatibility
  return {
    ...result,
    vehicles: result.entities,
    searchByBrandAndModel: result.searchByCriteria
  };
};

// Hook for car brands
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
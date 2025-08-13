import { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService';

export const useVehicle = (vehicleId = null) => {
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicle = async (id = vehicleId) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await vehicleService.getVehicleById(id);
      setVehicle(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Araç bilgileri yüklenirken bir hata oluştu');
      console.error('Error fetching vehicle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createVehicle = async (vehicleData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await vehicleService.createVehicleListing(vehicleData);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'İlan oluşturulurken bir hata oluştu');
      console.error('Error creating vehicle:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateVehicle = async (id, vehicleData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await vehicleService.updateVehicleListing(id, vehicleData);
      // Refresh vehicle data after update
      await fetchVehicle(id);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'İlan güncellenirken bir hata oluştu');
      console.error('Error updating vehicle:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  return {
    vehicle,
    isLoading,
    error,
    fetchVehicle,
    createVehicle,
    updateVehicle,
    refetch: () => fetchVehicle(vehicleId),
  };
};

// Hook for vehicle search operations
export const useVehicleSearch = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchByBrandAndModel = async (brand, model) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await vehicleService.findVehiclesByBrandAndModel(brand, model);
      setVehicles(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Araç arama sırasında bir hata oluştu');
      console.error('Error searching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchWithFilters = async (filters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await vehicleService.searchVehicles(filters);
      setVehicles(data.content || data); // Handle paginated vs non-paginated responses
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Araç filtreleme sırasında bir hata oluştu');
      console.error('Error filtering vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vehicles,
    isLoading,
    error,
    searchByBrandAndModel,
    searchWithFilters,
    clearResults: () => setVehicles([]),
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
      setError(err.response?.data?.message || 'Araç markaları yüklenirken bir hata oluştu');
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
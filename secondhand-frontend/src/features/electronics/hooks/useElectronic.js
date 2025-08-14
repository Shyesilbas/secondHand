import { useEffect, useState } from 'react';
import { electronicService } from '../services/electronicService';

export const useElectronic = (electronicId = null) => {
  const [electronic, setElectronic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchElectronic = async (id = electronicId) => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await electronicService.getElectronicById(id);
      setElectronic(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Elektronik ilan yüklenirken bir hata oluştu');
      // eslint-disable-next-line no-console
      console.error('Error fetching electronic:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createElectronic = async (payload) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await electronicService.createElectronicListing(payload);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Elektronik ilan oluşturulurken bir hata oluştu');
      // eslint-disable-next-line no-console
      console.error('Error creating electronic:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateElectronic = async (id, payload) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await electronicService.updateElectronicListing(id, payload);
      setElectronic(prev => ({ ...prev, ...(payload || {}) }));
      fetchElectronic(id);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Elektronik ilan güncellenirken bir hata oluştu');
      // eslint-disable-next-line no-console
      console.error('Error updating electronic:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (electronicId) fetchElectronic();
  }, [electronicId]);

  return {
    electronic,
    isLoading,
    error,
    fetchElectronic,
    createElectronic,
    updateElectronic,
    refetch: () => fetchElectronic(electronicId),
  };
};



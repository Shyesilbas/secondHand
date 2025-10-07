import { useEffect, useState, useCallback } from 'react';
import { userService } from '../services/userService.js';

const useAddresses = (options = {}) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const enabled = options.enabled ?? true;

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAddresses();
      setAddresses(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchAddresses();
    }
  }, [fetchAddresses, enabled]);

  const addAddress = async (address) => {
    const newAddress = await userService.addAddress(address);
    setAddresses((prev) => [...prev, newAddress]);
    return newAddress;
  };

  const updateAddress = async (id, address) => {
    const updated = await userService.updateAddress(id, address);
    setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  };

  const deleteAddress = async (id) => {
    await userService.deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const selectMainAddress = async (id) => {
    await userService.selectMainAddress(id);
    await fetchAddresses();
  };

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    selectMainAddress,
  };
};

export default useAddresses;

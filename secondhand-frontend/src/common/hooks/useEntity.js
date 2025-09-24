import { useState, useEffect, useCallback } from 'react';

export const useEntity = (config) => {
  const { entityId = null, service, defaultData = null, entityName = 'Entity' } = config;
  
  const [entity, setEntity] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntity = useCallback(async (id = entityId) => {
    if (!id || !service.getEntityById) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await service.getEntityById(id);
      setEntity(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Error occurred while fetching ${entityName.toLowerCase()}. Please try again later.`;
      setError(errorMessage);
      console.error(`Error fetching ${entityName.toLowerCase()}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, entityName, entityId]);

  const createEntity = useCallback(async (entityData) => {
    if (!service.createEntity) {
      throw new Error(`Create method not implemented for ${entityName}`);
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await service.createEntity(entityData);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Error occurred while creating ${entityName.toLowerCase()}. Please try again later.`;
      setError(errorMessage);
      console.error(`Error creating ${entityName.toLowerCase()}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, entityName]);

  const updateEntity = useCallback(async (id, entityData) => {
    if (!service.updateEntity) {
      throw new Error(`Update method not implemented for ${entityName}`);
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await service.updateEntity(id, entityData);
      
            setEntity(prev => ({ ...prev, ...(entityData || {}) }));
      
            fetchEntity(id);
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Error occurred while updating ${entityName.toLowerCase()}. Please try again later.`;
      setError(errorMessage);
      console.error(`Error updating ${entityName.toLowerCase()}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, entityName, fetchEntity]);

  const deleteEntity = useCallback(async (id) => {
    if (!service.deleteEntity) {
      throw new Error(`Delete method not implemented for ${entityName}`);
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await service.deleteEntity(id);
      setEntity(null);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Error occurred while deleting ${entityName.toLowerCase()}. Please try again later.`;
      setError(errorMessage);
      console.error(`Error deleting ${entityName.toLowerCase()}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, entityName]);

  const refetch = useCallback(() => {
    return fetchEntity(entityId);
  }, [fetchEntity, entityId]);

  const reset = useCallback(() => {
    setEntity(defaultData);
    setError(null);
    setIsLoading(false);
  }, [defaultData]);

  useEffect(() => {
    if (entityId) {
      fetchEntity();
    }
  }, [entityId, fetchEntity]);

  return {
    entity,
    isLoading,
    error,
    fetchEntity,
    createEntity,
    updateEntity,
    deleteEntity,
    refetch,
    reset,
    setEntity,
    setError
  };
};

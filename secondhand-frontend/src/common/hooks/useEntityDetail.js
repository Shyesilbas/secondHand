import {useCallback, useEffect, useMemo, useState} from 'react';
import {useAuth} from '../../auth/AuthContext.jsx';
import logger from '../utils/logger.js';

export const useEntityDetail = (config) => {
  const { entityId, service, entityName = 'Entity', ownerField = 'sellerId' } = config;
  const { authState: { user, isAuthenticated } } = useAuth();
  
  const [entity, setEntity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
      const errorMessage = err.response?.data?.message || `An error occurred while fetching the ${entityName.toLowerCase()}. Please try again later.`;
      setError(errorMessage);
      logger.error(`Error fetching ${entityName.toLowerCase()}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [entityId, service, entityName]);

  const refetch = useCallback(() => {
    return fetchEntity(entityId);
  }, [fetchEntity, entityId]);

  const reset = useCallback(() => {
    setEntity(null);
    setError(null);
    setIsLoading(true);
  }, []);

    const isOwner = useMemo(() => {
    return isAuthenticated && user?.id === entity?.[ownerField];
  }, [isAuthenticated, user?.id, entity, ownerField]);

  useEffect(() => {
    if (entityId) {
      fetchEntity();
    }
  }, [entityId, fetchEntity]);

  return {
    entity,
    isLoading,
    error,
    isOwner,
    user,
    fetchEntity,
    refetch,
    reset,
    setEntity,
    setError
  };
};

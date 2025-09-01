import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';

/**
 * Generic Entity Detail Hook for detail page operations
 * @param {Object} config - Detail configuration
 * @param {string} config.entityId - Entity ID
 * @param {Object} config.service - Service object with getEntityById method
 * @param {string} config.entityName - Human readable entity name for error messages
 * @param {string} config.ownerField - Field name to check ownership (default: 'sellerId')
 * @returns {Object} - Detail state and operations
 */
export const useEntityDetail = (config) => {
  const { entityId, service, entityName = 'Entity', ownerField = 'sellerId' } = config;
  const { user, isAuthenticated } = useAuth();
  
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
      console.error(`Error fetching ${entityName.toLowerCase()}:`, err);
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

  // Check if current user is the owner
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

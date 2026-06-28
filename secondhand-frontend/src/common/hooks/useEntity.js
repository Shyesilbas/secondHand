import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import logger from '../utils/logger.js';

export const useEntity = (config) => {
  const { entityId = null, service, defaultData = null, entityName = 'Entity' } = config;
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => [entityName, entityId], [entityName, entityId]);

  const { data: entity, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!entityId || !service.getEntityById) return defaultData;
      try {
        return await service.getEntityById(entityId);
      } catch (err) {
        logger.error(`Error fetching ${entityName.toLowerCase()}:`, err);
        throw err;
      }
    },
    enabled: !!entityId && !!service.getEntityById,
    initialData: defaultData || undefined,
  });

  const createMutation = useMutation({
    mutationFn: async (entityData) => {
      if (!service.createEntity) {
        throw new Error(`Create method not implemented for ${entityName}`);
      }
      try {
        return await service.createEntity(entityData);
      } catch (err) {
        logger.error(`Error creating ${entityName.toLowerCase()}:`, err);
        throw err;
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (entityData) => {
      if (!service.updateEntity) {
        throw new Error(`Update method not implemented for ${entityName}`);
      }
      try {
        return await service.updateEntity(entityId, entityData);
      } catch (err) {
        logger.error(`Error updating ${entityName.toLowerCase()}:`, err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!service.deleteEntity) {
        throw new Error(`Delete method not implemented for ${entityName}`);
      }
      try {
        return await service.deleteEntity(id);
      } catch (err) {
        logger.error(`Error deleting ${entityName.toLowerCase()}:`, err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const fetchEntity = useCallback(async (id = entityId) => {
    if (!id || !service.getEntityById) return;
    return refetch();
  }, [entityId, service.getEntityById, refetch]);

  const createEntity = useCallback(async (entityData) => {
    return createMutation.mutateAsync(entityData);
  }, [createMutation]);

  const updateEntity = useCallback(async (id, entityData) => {
    return updateMutation.mutateAsync(entityData);
  }, [updateMutation]);

  const deleteEntity = useCallback(async (id) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const reset = useCallback(() => {
    queryClient.resetQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    entity: entity ?? defaultData,
    isLoading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: error ? (error.response?.data?.detail || error.response?.data?.message || error.message) : null,
    fetchEntity,
    createEntity,
    updateEntity,
    deleteEntity,
    refetch,
    reset,
    setEntity: (data) => queryClient.setQueryData(queryKey, data),
    setError: () => {}
  };
};

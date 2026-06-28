import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import logger from '../utils/logger.js';

export const useEntitySearch = (config) => {
  const { service, entityName = 'Entity', defaultData = [] } = config;

  const [queryParams, setQueryParams] = useState({ type: null, params: null });

  const queryKey = useMemo(() => [entityName, 'search', queryParams], [entityName, queryParams]);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!queryParams.type) return { content: defaultData, totalElements: 0, totalPages: 0 };
      try {
        if (queryParams.type === 'filters') {
          if (!service.filterEntities) {
            throw new Error(`Filter method not implemented for ${entityName}`);
          }
          return await service.filterEntities(queryParams.params);
        } else if (queryParams.type === 'criteria') {
          if (!service.searchByCriteria) {
            throw new Error(`Search by criteria method not implemented for ${entityName}`);
          }
          const res = await service.searchByCriteria(queryParams.params);
          return Array.isArray(res) ? { content: res } : res;
        }
      } catch (err) {
        logger.error(`Error searching/filtering ${entityName.toLowerCase()}s:`, err);
        throw err;
      }
      return { content: defaultData };
    },
    enabled: queryParams.type !== null,
  });

  const searchWithFilters = useCallback(async (filters) => {
    setQueryParams({ type: 'filters', params: filters });
  }, []);

  const searchByCriteria = useCallback(async (criteria) => {
    setQueryParams({ type: 'criteria', params: criteria });
  }, []);

  const clearResults = useCallback(() => {
    setQueryParams({ type: null, params: null });
  }, []);

  const responseContent = data?.content || (Array.isArray(data) ? data : defaultData);
  
  const pagination = useMemo(() => {
    if (!data) return { totalElements: 0, totalPages: 0, number: 0, size: 20, numberOfElements: 0, first: false, last: false, empty: true };
    return {
      totalElements: data.totalElements || responseContent.length,
      totalPages: data.totalPages || 1,
      number: data.number || 0,
      size: data.size || 20,
      numberOfElements: data.numberOfElements || responseContent.length,
      first: data.first || false,
      last: data.last || false,
      empty: data.empty || responseContent.length === 0
    };
  }, [data, responseContent]);

  return {
    entities: responseContent,
    isLoading,
    error: error ? (error.response?.data?.message || error.message) : null,
    pagination,
    searchWithFilters,
    searchByCriteria,
    clearResults,
    setEntities: () => {},
    setError: () => {}
  };
};

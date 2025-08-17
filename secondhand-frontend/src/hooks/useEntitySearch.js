import { useState, useCallback } from 'react';

/**
 * Generic Entity Search Hook for search and filter operations
 * @param {Object} config - Search configuration
 * @param {Object} config.service - Service object with search methods
 * @param {string} config.entityName - Human readable entity name for error messages
 * @param {Array} config.defaultData - Default data array
 * @returns {Object} - Search state and operations
 */
export const useEntitySearch = (config) => {
  const { service, entityName = 'Entity', defaultData = [] } = config;
  
  const [entities, setEntities] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 20,
    numberOfElements: 0,
    first: false,
    last: false,
    empty: false
  });

  const searchWithFilters = useCallback(async (filters) => {
    if (!service.filterEntities) {
      throw new Error(`Filter method not implemented for ${entityName}`);
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await service.filterEntities(filters);
      
      // Handle both paginated and non-paginated responses
      const content = response.content || response;
      const paginationData = response.content ? {
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        number: response.number || 0,
        size: response.size || 20,
        numberOfElements: response.numberOfElements || 0,
        first: response.first || false,
        last: response.last || false,
        empty: response.empty || false
      } : {
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 20,
        numberOfElements: 0,
        first: false,
        last: false,
        empty: false
      };

      setEntities(content);
      setPagination(paginationData);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Error occurred while filtering ${entityName.toLowerCase()}s. Please try again later.`;
      setError(errorMessage);
      console.error(`Error filtering ${entityName.toLowerCase()}s:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, entityName]);

  const searchByCriteria = useCallback(async (criteria) => {
    if (!service.searchByCriteria) {
      throw new Error(`Search by criteria method not implemented for ${entityName}`);
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await service.searchByCriteria(criteria);
      setEntities(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Error occurred while searching ${entityName.toLowerCase()}s. Please try again later.`;
      setError(errorMessage);
      console.error(`Error searching ${entityName.toLowerCase()}s:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [service, entityName]);

  const clearResults = useCallback(() => {
    setEntities(defaultData);
    setPagination({
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 20,
      numberOfElements: 0,
      first: false,
      last: false,
      empty: false
    });
    setError(null);
  }, [defaultData]);

  const setEntitiesData = useCallback((data) => {
    setEntities(data);
  }, []);

  return {
    entities,
    isLoading,
    error,
    pagination,
    searchWithFilters,
    searchByCriteria,
    clearResults,
    setEntities: setEntitiesData,
    setError
  };
};

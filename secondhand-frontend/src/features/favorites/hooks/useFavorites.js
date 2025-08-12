import { useState, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService';
import { useToast } from '../../../context/ToastContext';
import { 
  FavoriteDTO, 
  FavoriteStatsDTO,
  FavoriteFilterDTO,
  PaginatedResponse 
} from '../../../types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ ...PaginatedResponse });
  const { showToast } = useToast();

  const fetchFavorites = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await favoriteService.getMyFavorites(params);
      setFavorites(response.content || []);
      setPagination({
        ...PaginatedResponse,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        number: response.number || 0,
        size: response.size || 20,
        numberOfElements: response.numberOfElements || 0,
        first: response.first || false,
        last: response.last || false,
        empty: response.empty || false
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch favorites');
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (listingId) => {
    try {
      await favoriteService.addToFavorites(listingId);
      showToast('Favorilere eklendi!', 'success');
      // Don't refresh favorites when adding (user may not be on favorites page)
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add to favorites';
      showToast(message, 'error');
      console.error('Error adding to favorites:', err);
      return false;
    }
  };

  const removeFromFavorites = async (listingId) => {
    try {
      await favoriteService.removeFromFavorites(listingId);
      showToast('Favorilerden kaldırıldı', 'success');
      // Refresh favorites when item is removed
      if (favorites.length > 0) {
        fetchFavorites({ page: pagination.number });
      }
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove from favorites';
      showToast(message, 'error');
      console.error('Error removing from favorites:', err);
      return false;
    }
  };

  const toggleFavorite = async (listingId) => {
    try {
      const response = await favoriteService.toggleFavorite(listingId);
      const message = response.isFavorited ? 'Favorilere eklendi!' : 'Favorilerden kaldırıldı';
      showToast(message, 'success');
      // Refresh favorites only if the item was removed from favorites
      if (favorites.length > 0 && !response.isFavorited) {
        fetchFavorites({ page: pagination.number });
      }
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to toggle favorite';
      showToast(message, 'error');
      console.error('Error toggling favorite:', err);
      return null;
    }
  };

  const loadPage = (page) => {
    fetchFavorites({ page });
  };

  return {
    favorites,
    isLoading,
    error,
    pagination,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    loadPage
  };
};

export const useFavoriteStats = () => {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getFavoriteStats = async (listingId) => {
    try {
      setIsLoading(true);
      const response = await favoriteService.getFavoriteStats(listingId);
      setStats(prev => ({ ...prev, [listingId]: response }));
      return response;
    } catch (err) {
      console.error('Error fetching favorite stats:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getBulkFavoriteStats = async (listingIds) => {
    try {
      setIsLoading(true);
      const response = await favoriteService.getBulkFavoriteStats(listingIds);
      setStats(prev => ({ ...prev, ...response }));
      return response;
    } catch (err) {
      console.error('Error fetching bulk favorite stats:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    isLoading,
    getFavoriteStats,
    getBulkFavoriteStats
  };
};
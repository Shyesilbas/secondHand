import { useState } from 'react';
import { favoriteService } from '../services/favoriteService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [pagination, setPagination] = useState({ number: 0, size: 20, totalPages: 0, totalElements: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const notification = useNotification();

  const fetchFavorites = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await favoriteService.getMyFavorites(params);

      setFavorites(response.content || []);
      setPagination({
        number: response.number || 0,
        size: response.size || 20,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load favorites');
      console.error('Favorites fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPage = (page) => {
    fetchFavorites({ page });
  };

  const toggleFavorite = async (listing) => {
    try {
      setIsLoading(true);
      const response = await favoriteService.toggleFavorite(listing.id);

      notification.showSuccess(
          'Success',
          response.isFavorited ? 'Added to favorites' : 'Removed from favorites'
      );

      listing.favoriteStats.isFavorited = response.isFavorited;
      listing.favoriteStats.favoriteCount = response.favoriteCount;

      setFavorites((prev) => prev.map(fav => fav.listing.id === listing.id ? { ...fav, listing } : fav));

      return listing.favoriteStats;
    } catch (err) {
      notification.showError('Error', err.response?.data?.message || 'Failed to toggle favorite');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    favorites,
    pagination,
    isLoading,
    error,
    fetchFavorites,
    loadPage,
    toggleFavorite,
  };
};

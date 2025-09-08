import { useState } from 'react';
import { favoriteService } from '../services/favoriteService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

export const useFavorites = () => {
  const [isLoading, setIsLoading] = useState(false);
  const notification = useNotification();

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

      return listing.favoriteStats;
    } catch (err) {
      notification.showError('Error', err.response?.data?.message || 'Failed to toggle favorite');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    toggleFavorite,
  };
};

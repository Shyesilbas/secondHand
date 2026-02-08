import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '../services/favoriteService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useAuthState } from '../../auth/AuthContext.jsx';

export const useFavorites = (page = 0, size = 20) => {
  const { user, isAuthenticated } = useAuthState();
  const [currentPage, setCurrentPage] = useState(page);
  const notification = useNotification();
  const queryClient = useQueryClient();

  useEffect(() => {
    setCurrentPage(0);
  }, [user?.id]);

  const {
    data: favoritesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['favorites', user?.id, currentPage, size],
    queryFn: () => favoriteService.getMyFavorites({ page: currentPage, size }),
    enabled: !!(isAuthenticated && user?.id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData
  });

  const favorites = favoritesData?.content || [];
  const pagination = {
    number: favoritesData?.number || 0,
    size: favoritesData?.size || 20,
    totalPages: favoritesData?.totalPages || 0,
    totalElements: favoritesData?.totalElements || 0
  };

  const loadPage = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const toggleFavoriteMutation = useMutation({
    mutationFn: (listing) => favoriteService.toggleFavorite(listing.id),
    onSuccess: (response, listing) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      
      notification.showSuccess(
          'Success',
          response.isFavorited ? 'Added to favorites' : 'Removed from favorites'
      );
      
      return {
          ...listing.favoriteStats,
          isFavorited: response.isFavorited,
          favoriteCount: response.favoriteCount
      };
    },
    onError: (err) => {
      notification.showError('Error', err.response?.data?.message || 'Failed to toggle favorite');
    }
  });

  const toggleFavorite = (listing) => {
    return toggleFavoriteMutation.mutateAsync(listing);
  };

  return {
    favorites,
    pagination,
    isLoading,
    error: error?.response?.data?.message || error?.message,
    fetchFavorites: refetch, // Alias for backward compatibility
    loadPage,
    toggleFavorite,
  };
};

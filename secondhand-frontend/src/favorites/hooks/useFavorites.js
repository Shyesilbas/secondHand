import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '../services/favoriteService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { FAVORITE_DEFAULTS, FAVORITE_MESSAGES } from '../favoriteConstants.js';

export const useFavorites = (page = FAVORITE_DEFAULTS.PAGE, size = FAVORITE_DEFAULTS.PAGE_SIZE) => {
  const { user, isAuthenticated } = useAuthState();
  const [currentPage, setCurrentPage] = useState(page);
  const notification = useNotification();
  const queryClient = useQueryClient();

  useEffect(() => {
    setCurrentPage(FAVORITE_DEFAULTS.PAGE);
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
    staleTime: FAVORITE_DEFAULTS.STALE_TIME_MS,
    gcTime: FAVORITE_DEFAULTS.GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData
  });

  const favorites = favoritesData?.content || [];
  const pagination = {
    number: favoritesData?.number ?? FAVORITE_DEFAULTS.PAGE,
    size: favoritesData?.size ?? size,
    totalPages: favoritesData?.totalPages ?? 0,
    totalElements: favoritesData?.totalElements ?? 0,
  };

  const loadPage = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const toggleFavoriteMutation = useMutation({
    mutationFn: (listing) => favoriteService.toggleFavorite(listing.id),
    onSuccess: (response, listing) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      
      notification.showSuccess(
          FAVORITE_MESSAGES.SUCCESS_TITLE,
          response.isFavorited ? FAVORITE_MESSAGES.ADDED_TO_FAVORITES : FAVORITE_MESSAGES.REMOVED_FROM_FAVORITES
      );
      
      return {
          ...listing.favoriteStats,
          isFavorited: response.isFavorited,
          favoriteCount: response.favoriteCount
      };
    },
    onError: (err) => {
      notification.showError(
        FAVORITE_MESSAGES.ERROR_TITLE,
        err.response?.data?.message || FAVORITE_MESSAGES.TOGGLE_FAVORITE_FAILED
      );
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

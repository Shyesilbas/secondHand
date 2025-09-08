import React, { useState, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { FavoriteStatsDTO } from '../favorites.js';

const FavoriteButton = ({
                          listingId,
                          sellerId = null,
                          listing = null,
                          initialIsFavorited = false,
                          initialCount = 0,
                          onToggle,
                          size = 'md',
                          showCount = true,
                          className = ''
                        }) => {

  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [isFavorited, setIsFavorited] = useState(
      listing?.favoriteStats?.isFavorited ?? listing?.favoriteStats?.favorited ?? initialIsFavorited
  );
  const [favoriteCount, setFavoriteCount] = useState(
      listing?.favoriteStats?.favoriteCount ?? initialCount
  );
  const [isLoading, setIsLoading] = useState(false);

  const sizeConfig = {
    sm: { button: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-xs' },
    md: { button: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { button: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-base' }
  };
  const config = sizeConfig[size] || sizeConfig.md;

  const actualSellerId = sellerId || listing?.sellerId || null;
  const isCurrentUserSeller = user && actualSellerId &&
      (user.id === actualSellerId || user.id === String(actualSellerId) || String(user.id) === String(actualSellerId));

  if (!isAuthenticated || isCurrentUserSeller) return null;

  const handleToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      showWarning('Authentication required', 'Login to add favorite listings');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await favoriteService.toggleFavorite(listingId);
      const statsDto = {
        ...FavoriteStatsDTO,
        listingId: response.listingId,
        favoriteCount: response.favoriteCount,
        isFavorited: response.isFavorited ?? response.favorited
      };

      setIsFavorited(statsDto.isFavorited);
      setFavoriteCount(statsDto.favoriteCount);

      showSuccess(
          'Success',
          statsDto.isFavorited ? 'Added to Favorites!' : 'Removed from Favorites!'
      );

      if (onToggle) onToggle(statsDto);

    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update favorites';
      showError('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={`flex items-center gap-1 ${className}`}>
        <button
            onClick={handleToggle}
            className={`${config.button} rounded-full flex items-center justify-center 
          ${isFavorited ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'} 
          hover:bg-primary-50 hover:text-primary-600 transition-colors`}
            disabled={isLoading}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
              className={`${config.icon} ${isLoading ? 'animate-pulse' : ''}`}
              fill={isFavorited ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
          >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={isFavorited ? 0 : 1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
        {showCount && (
            <span className={`${config.text} text-gray-600`}>
          {favoriteCount}
        </span>
        )}
      </div>
  );
};

export default FavoriteButton;

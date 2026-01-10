import React, { useState, useEffect, useRef } from 'react';
import { favoriteService } from '../services/favoriteService.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { FavoriteStatsDTO } from '../favorites.js';
import { ROUTES } from '../../common/constants/routes.js';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const { showSuccess, showError, showWarning, addNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const notificationShown = useRef(false);
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

  if (isCurrentUserSeller) return null;

  const handleToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      if (!notificationShown.current) {
        notificationShown.current = true;
        addNotification({
          type: 'info',
          title: 'Authentication Required',
          message: 'Please Log In',
          autoClose: false,
          showCloseButton: false,
          actions: [
            {
              label: 'Cancel',
              primary: false,
              onClick: () => {
                notificationShown.current = false;
              }
            },
            {
              label: 'OK',
              primary: true,
              onClick: () => {
                navigate(ROUTES.LOGIN, { 
                  state: { from: location },
                  replace: true 
                });
                notificationShown.current = false;
              }
            }
          ]
        });
      }
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

  const defaultButtonClass = size === 'sm' 
    ? `bg-background-primary/90 backdrop-blur hover:bg-background-primary border-none h-7 w-7 rounded-full shadow-sm flex items-center justify-center transition-colors ${
        isFavorited 
          ? 'text-status-error-DEFAULT hover:text-status-error-600' 
          : 'text-text-secondary hover:text-status-error-DEFAULT'
      }`
    : `${config.button} rounded-full flex items-center justify-center transition-colors ${
        isFavorited 
          ? 'bg-status-error-50 text-status-error-DEFAULT hover:bg-status-error-100' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`;

  const buttonClass = className || defaultButtonClass;

  const ButtonContent = (
    <button
        onClick={handleToggle}
        className={buttonClass}
        disabled={isLoading}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
          className={`${size === 'sm' ? 'w-3.5 h-3.5' : config.icon} ${isLoading ? 'animate-pulse' : ''}`}
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
  );

  if (showCount) {
    return (
      <div className="flex items-center gap-1">
        {ButtonContent}
        <span className={`${config.text} text-gray-600`}>
          {favoriteCount}
        </span>
      </div>
    );
  }

  return ButtonContent;
};

export default FavoriteButton;

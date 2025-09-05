import React, { useState, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { FavoriteStatsDTO } from '../favorites.js';

const FavoriteButton = ({ 
  listingId, 
  sellerId = null,
  listing = null, // Alternative to sellerId - can pass full listing object
  initialIsFavorited = false, 
  initialCount = 0,
  onToggle,
  size = 'md',
  showCount = true,
  className = ''
}) => {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [favoriteCount, setFavoriteCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  const notification = useNotification();

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-xs'
    },
    md: {
      button: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-sm'
    },
    lg: {
      button: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  useEffect(() => {
    if (isAuthenticated && listingId) {
      loadFavoriteStats();
    }
  }, [listingId, isAuthenticated]);

  const loadFavoriteStats = async () => {
    try {
      const response = await favoriteService.getFavoriteStats(listingId);

      // Use DTO structure to parse response safely
      const statsDto = {
        ...FavoriteStatsDTO,
        listingId: response.listingId,
        favoriteCount: response.favoriteCount,
        isFavorited: response.isFavorited !== undefined ? response.isFavorited : response.favorited
      };
      
      setIsFavorited(statsDto.isFavorited);
      setFavoriteCount(statsDto.favoriteCount);
    } catch (error) {
    }
  };

  const handleToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isAuthenticated) {
      notification.showWarning('Authentication required', 'Login to add favorite listings');
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
        isFavorited: response.isFavorited !== undefined ? response.isFavorited : response.favorited
      };
      
      setIsFavorited(statsDto.isFavorited);
      setFavoriteCount(statsDto.favoriteCount);

      const message = statsDto.isFavorited ? 'Added to Favorites!' : 'Removed from Favorites!';
      notification.showSuccess('Success', message);
      
      if (onToggle) {
        onToggle(response);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update favorites';
      notification.showError('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const actualSellerId = sellerId || (listing && listing.sellerId) || null;
  
  const isCurrentUserSeller = user && actualSellerId &&
    (user.id === actualSellerId || user.id === String(actualSellerId) || String(user.id) === String(actualSellerId));
  
  if (!isAuthenticated || isCurrentUserSeller) {
    return null; // Don't show favorite button for unauthenticated users or listing owners
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          ${config.button}
          flex items-center justify-center
          rounded-full
          transition-all duration-200
          border-2
          ${isFavorited 
            ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 shadow-lg' 
            : 'bg-white border-slate-300 text-slate-400 hover:border-red-400 hover:text-red-400 hover:bg-red-50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
        `}
        title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
      >
        {isLoading ? (
          <svg className={`${config.icon} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg 
            className={config.icon} 
            fill={isFavorited ? 'currentColor' : 'none'} 
            stroke={isFavorited ? 'none' : 'currentColor'} 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={isFavorited ? 0 : 2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        )}
      </button>
      
      {showCount && favoriteCount > 0 && (
        <span className={`${config.text} text-slate-500 font-medium`}>
          {favoriteCount}
        </span>
      )}
    </div>
  );
};

export default FavoriteButton;
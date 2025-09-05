import React, { useState, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService.js';
import { FavoriteStatsDTO } from '../favorites.js';

const FavoriteStats = ({ 
  listingId,
  showIcon = true,
  showText = true,
  size = 'sm',
  className = ''
}) => {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Size configurations
  const sizeConfig = {
    xs: {
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    sm: {
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    md: {
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size] || sizeConfig.sm;

  useEffect(() => {
    if (listingId) {
      loadFavoriteStats();
    }
  }, [listingId]);

  const loadFavoriteStats = async () => {
    try {
      setIsLoading(true);
      const response = await favoriteService.getFavoriteStats(listingId);
      
      // Use DTO structure to parse response safely
      const statsDto = {
        ...FavoriteStatsDTO,
        listingId: response.listingId,
        favoriteCount: response.favoriteCount,
        isFavorited: response.isFavorited !== undefined ? response.isFavorited : response.favorited
      };
      
      setFavoriteCount(statsDto.favoriteCount);
    } catch (error) {
      console.error('Failed to load favorite stats:', error);
      setFavoriteCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && (
          <svg className={`${config.icon} animate-pulse text-text-muted`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
        {showText && <span className={`${config.text} text-text-muted`}>...</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && (
        <svg 
          className={`${config.icon} text-text-muted`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      )}
      {showText && (
        <span className={`${config.text} text-text-muted`}>
          {favoriteCount} {favoriteCount === 1 ? 'Favorite' : 'Favorite'}
        </span>
      )}
    </div>
  );
};

export default FavoriteStats;
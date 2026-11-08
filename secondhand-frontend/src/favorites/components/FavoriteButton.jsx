import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { favoriteService } from '../services/favoriteService.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { FavoriteStatsDTO } from '../favorites.js';
import { FAVORITE_MESSAGES } from '../favoriteConstants.js';
import { useLoginPrompt } from '../../auth/hooks/useLoginPrompt.js';

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

 const queryClient = useQueryClient();
 const { isAuthenticated, user } = useAuthState();
 const { showSuccess, showError } = useNotification();
 const promptLogin = useLoginPrompt();
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
 promptLogin();
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

 // Invalidate React Query caches so all listing cards and detail pages sync immediately
 queryClient.invalidateQueries({ queryKey: ['favorites'] });
 queryClient.invalidateQueries({ queryKey: ['listings'] });
 queryClient.invalidateQueries({ queryKey: ['listing', listingId] });

 showSuccess(
 FAVORITE_MESSAGES.SUCCESS_TITLE,
 statsDto.isFavorited ? FAVORITE_MESSAGES.BUTTON_ADDED : FAVORITE_MESSAGES.BUTTON_REMOVED
 );

 if (onToggle) onToggle(statsDto);

 } catch (error) {
 const message = error.response?.data?.message || FAVORITE_MESSAGES.UPDATE_FAVORITES_FAILED;
 showError(FAVORITE_MESSAGES.ERROR_TITLE, message);
 } finally {
 setIsLoading(false);
 }
 };

 const defaultButtonClass = size === 'sm'
 ? `h-8 w-8 rounded border border-border bg-background-primary flex items-center justify-center transition-colors duration-150 ${
 isFavorited
 ? 'text-status-error hover:border-card-border-hover'
 : 'text-text-secondary hover:text-status-error hover:border-card-border-hover'
 }`
 : `${config.button} rounded border border-border flex items-center justify-center transition-colors duration-150 ${
 isFavorited
 ? 'bg-background-secondary text-status-error'
 : 'bg-background-primary text-text-secondary hover:text-status-error hover:border-card-border-hover'
 }`;

 const buttonClass = className || defaultButtonClass;

 const ButtonContent = (
 <button
 type="button"
 onClick={handleToggle}
 className={buttonClass}
 disabled={isLoading}
 aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
 title={isFavorited ? "Remove from favorites" : "Add to favorites"}
 >
 <Heart
 className={`${size === 'sm' ? 'w-4 h-4' : config.icon} ${isFavorited ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`}
 strokeWidth={1.5}
 />
 </button>
 );

 if (showCount) {
 return (
 <div className="flex items-center gap-1">
 {ButtonContent}
 <span className={`${config.text} text-text-secondary tabular-nums`}>
 {favoriteCount}
 </span>
 </div>
 );
 }

 return ButtonContent;
};

export default FavoriteButton;

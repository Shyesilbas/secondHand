import { memo } from 'react';
import { Scale } from 'lucide-react';
import { useComparison } from '../hooks/useComparison.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';

const CompareButton = memo(({ listing, size = 'sm', className = '', variant = 'round' }) => {
 const { addToComparison, removeFromComparison, isInComparison, category, itemCount, maxItems } = useComparison();
 const { showWarning, showInfo } = useNotification();
 const { getListingTypeLabel } = useEnums();

 if (!listing) return null;

 const isAdded = isInComparison(listing.id);

 const handleClick = (e) => {
 e.preventDefault();
 e.stopPropagation();

 if (isAdded) {
 removeFromComparison(listing.id);
 return;
 }

 const result = addToComparison(listing);

 if (!result.success) {
 switch (result.error) {
 case 'category_mismatch':
 showWarning(
 'Category Mismatch',
 `You can only compare items from the same category. Current: ${getListingTypeLabel(result.currentCategory)}`
 );
 break;
 case 'limit_reached':
 showWarning(
 'Limit Reached',
 `You can compare up to ${result.limit} items at a time.`
 );
 break;
 case 'already_added':
 showInfo('Already Added', 'This item is already in comparison.');
 break;
 default:
 break;
 }
 }
 };

 const sizeClasses = {
 sm: 'h-7 w-7',
 md: 'h-8 w-8',
 lg: 'h-9 w-9'
 };

 const iconSizes = {
 sm: 'w-3.5 h-3.5',
 md: 'w-4 h-4',
 lg: 'w-5 h-5'
 };

 const isDisabled = !isAdded && category && category !== listing.type;
 const isLimitReached = !isAdded && itemCount >= maxItems;

 return (
 <button
 type="button"
 aria-label={isAdded ? 'Remove from comparison' : 'Add to compare'}
 aria-pressed={isAdded}
 onClick={handleClick}
 disabled={isDisabled || isLimitReached}
 className={`${variant === 'square' ? 'h-10 w-10 rounded' : `${sizeClasses[size]} rounded-full`}
 flex items-center justify-center transition-colors duration-150
 ${isAdded
 ? 'bg-primary text-white'
 : variant === 'square'
 ? 'border border-border bg-background-primary text-text-secondary hover:bg-background-secondary hover:text-text-primary'
 : 'bg-background-primary border border-border-light hover:border-primary text-text-secondary hover:text-primary'
 }
 ${(isDisabled || isLimitReached) && !isAdded ? 'opacity-50 cursor-not-allowed' : ''}
 ${className}
 `}
 title={
 isAdded 
 ? 'Remove from comparison' 
 : isDisabled 
 ? `Can only compare ${getListingTypeLabel(category)} items`
 : isLimitReached
 ? `Maximum ${maxItems} items`
 : 'Add to compare'
 }
 >
 <Scale className={variant === 'square' ? 'h-4 w-4' : iconSizes[size]} strokeWidth={1.5} aria-hidden />
 </button>
 );
});

CompareButton.displayName = 'CompareButton';

export default CompareButton;


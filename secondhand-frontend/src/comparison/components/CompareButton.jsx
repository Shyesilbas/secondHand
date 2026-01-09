import React, { memo } from 'react';
import { Scale } from 'lucide-react';
import { useComparison } from '../hooks/useComparison.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';

const CompareButton = memo(({ listing, size = 'sm', className = '' }) => {
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
            onClick={handleClick}
            disabled={isDisabled || isLimitReached}
            className={`
                ${sizeClasses[size]}
                rounded-full flex items-center justify-center transition-all duration-200
                ${isAdded
                    ? 'bg-accent-indigo-600 text-white shadow-md'
                    : 'bg-background-primary/90 backdrop-blur hover:bg-background-primary text-text-secondary hover:text-accent-indigo-600 shadow-sm'
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
            <Scale className={iconSizes[size]} />
        </button>
    );
});

CompareButton.displayName = 'CompareButton';

export default CompareButton;


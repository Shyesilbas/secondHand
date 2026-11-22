import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import { useComparison } from '../hooks/useComparison.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';

const CompareButton = memo(({ listing, size = 'sm', className = '', variant = 'round' }) => {
  const { t } = useTranslation();
  const { addToComparison, removeFromComparison, isInComparison, category, itemCount, maxItems } = useComparison();
  const { showWarning, showInfo } = useNotification();
  const { getListingTypeLabel } = useEnums();

  if (!listing) return null;

  const isAdded = isInComparison(listing.id);
  // 'ghost': borderless 40px square for action rows inside a card (listing detail).
  const isGhost = variant === 'ghost';

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
            t('category_mismatch_title', 'Category Mismatch'),
            t('category_mismatch_desc', {
              defaultValue: 'You can only compare items from the same category. Current: {{category}}',
              category: getListingTypeLabel(result.currentCategory),
            })
          );
          break;
        case 'limit_reached':
          showWarning(
            t('limit_reached_title', 'Limit Reached'),
            t('limit_reached_desc', {
              defaultValue: 'You can compare up to {{limit}} items at a time.',
              limit: result.limit,
            })
          );
          break;
        case 'already_added':
          showInfo(
            t('already_added_title', 'Already Added'),
            t('already_added_desc', 'This item is already in comparison.')
          );
          break;
        default:
          break;
      }
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isDisabled = !isAdded && category && category !== listing.type;
  const isLimitReached = !isAdded && itemCount >= maxItems;

  const buttonTitle = isAdded
    ? t('remove_from_comparison', 'Remove from comparison')
    : isDisabled
      ? t('can_only_compare_category', {
        defaultValue: 'Can only compare {{category}} items',
        category: getListingTypeLabel(category),
      })
      : isLimitReached
        ? t('maximum_items', { defaultValue: 'Maximum {{count}} items', count: maxItems })
        : t('add_to_compare', 'Add to compare');

  return (
    <button
      type="button"
      aria-label={buttonTitle}
      aria-pressed={isAdded}
      onClick={handleClick}
      disabled={isDisabled || isLimitReached}
      className={`${isGhost ? 'h-10 w-10' : sizeClasses[size]} rounded flex items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${isGhost
          ? (isAdded ? 'bg-accent-teal-50 text-accent-teal-800' : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary')
          : isAdded
            ? 'border border-accent-teal bg-accent-teal-50 text-accent-teal-800'
            : 'border border-border bg-background-primary text-text-secondary hover:border-card-border-hover hover:text-text-primary'
        } ${(isDisabled || isLimitReached) && !isAdded ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      title={buttonTitle}
    >
      <Scale className={isGhost ? 'h-4 w-4' : iconSizes[size]} strokeWidth={1.5} aria-hidden />
    </button>
  );
});

CompareButton.displayName = 'CompareButton';

export default CompareButton;

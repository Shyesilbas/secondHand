import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import ListingCard from '../../listing/components/ListingCard.jsx';
import { Button, Card, EmptyState, SkeletonGrid } from '../../common/components/ui/index.js';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_MESSAGES } from '../cartConstants.js';

const EmptyCartView = ({
  isAuthenticated,
  favoritesLoading,
  favoriteListings,
  userId
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 pb-12">
      <Card shadow={false} className="overflow-hidden">
        <EmptyState
          icon={ShoppingBag}
          title={CART_MESSAGES.EMPTY_CART_TITLE}
          description={CART_MESSAGES.EMPTY_CART_DESCRIPTION}
        >
          <div className="mt-6 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
            <Button onClick={() => navigate(ROUTES.LISTINGS)}>{t('browse_listings')}</Button>
            {isAuthenticated ? (
              <Link to={ROUTES.FAVORITES} className={buttonClasses('secondary')}>
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Heart className="h-4 w-4 text-text-secondary" strokeWidth={1.75} />
                  {t('favorites')}
                </span>
              </Link>
            ) : (
              <Link to={ROUTES.LOGIN} className={buttonClasses('secondary')}>
                {CART_MESSAGES.EMPTY_CART_SIGN_IN}
              </Link>
            )}
          </div>
        </EmptyState>
      </Card>

      {isAuthenticated ? (
        <Card as="section" shadow={false} className="overflow-hidden">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {CART_MESSAGES.EMPTY_CART_FAVORITES_TITLE}
              </h2>
              <p className="mt-0.5 text-sm text-text-secondary">
                {CART_MESSAGES.EMPTY_CART_FAVORITES_SUB}
              </p>
            </div>
            <Link to={ROUTES.FAVORITES} className="text-sm font-medium text-text-primary hover:underline">
              {CART_MESSAGES.EMPTY_CART_SEE_ALL_FAVORITES} →
            </Link>
          </div>
          {favoritesLoading ? (
            <SkeletonGrid count={4} columns="grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4" />
          ) : favoriteListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
              {favoriteListings.map((listing, index) => (
                <div key={listing.id} className="min-w-0 max-w-full">
                  <ListingCard
                    listing={listing}
                    isOwner={userId === listing.sellerId}
                    currentUserId={userId}
                    priorityImage={index < 4}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded border border-dashed border-border-light py-8 text-center text-sm text-text-secondary">
              {t('no_favorites_yet_tap_the_heart_on_a_list')}
            </p>
          )}
        </Card>
      ) : (
        <Card shadow={false} className="flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">{CART_MESSAGES.EMPTY_CART_GUEST_FAVORITES}</p>
          <Link to={ROUTES.LOGIN} className={`${buttonClasses()} shrink-0`}>
            {CART_MESSAGES.EMPTY_CART_SIGN_IN}
          </Link>
        </Card>
      )}
    </div>
  );
};

export default EmptyCartView;

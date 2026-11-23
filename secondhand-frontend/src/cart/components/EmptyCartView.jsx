import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import ListingCard from '../../listing/components/ListingCard.jsx';
import { Card, EmptyState, ErrorState, SkeletonCard } from '../../common/components/ui/index.js';
import { LISTING_GRID_GAP, LISTING_ROW_COLUMNS, LISTING_ROW_SIZE, listingRowItemClass } from '../../listing/components/listingGridLayout.js';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_MESSAGES } from '../cartConstants.js';

const EmptyCartView = ({
  isAuthenticated,
  favoritesLoading,
  favoritesError,
  onRetryFavorites,
  favoriteListings,
  userId
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const showFavoritesSection = isAuthenticated && (favoritesLoading || Boolean(favoritesError) || favoriteListings.length > 0);

  return (
    <div className="space-y-10 pb-8">
      <EmptyState
        icon={ShoppingBag}
        titleAs="h2"
        title={t('empty_cart_title', CART_MESSAGES.EMPTY_CART_TITLE)}
        description={t('empty_cart_description', CART_MESSAGES.EMPTY_CART_DESCRIPTION)}
        primaryAction={{
          label: t('browse_listings', 'İlanlara Gözat'),
          onClick: () => navigate(ROUTES.LISTINGS)
        }}
        className="shadow-sm"
      />

      {showFavoritesSection ? (
        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                {t('empty_cart_favorites_title', CART_MESSAGES.EMPTY_CART_FAVORITES_TITLE)}
              </h2>
              <p className="mt-0.5 text-sm text-text-secondary">
                {t('empty_cart_favorites_sub', CART_MESSAGES.EMPTY_CART_FAVORITES_SUB)}
              </p>
            </div>
            <Link
              to={ROUTES.FAVORITES}
              className="inline-flex shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            >
              <span>{t('empty_cart_see_all_favorites', CART_MESSAGES.EMPTY_CART_SEE_ALL_FAVORITES)}</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Link>
          </div>

          {favoritesLoading ? (
            <div className={`grid ${LISTING_ROW_COLUMNS} ${LISTING_GRID_GAP}`}>
              {Array.from({ length: LISTING_ROW_SIZE }, (_, i) => (
                <div key={i} className={listingRowItemClass(i)}>
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : favoritesError ? (
            <ErrorState
              size="compact"
              title={t('favorites_load_failed', 'Favoriler yüklenemedi')}
              description={favoritesError}
              onRetry={onRetryFavorites}
            />
          ) : (
            <div className={`grid ${LISTING_ROW_COLUMNS} ${LISTING_GRID_GAP}`}>
              {favoriteListings.slice(0, LISTING_ROW_SIZE).map((listing, index) => (
                <div key={listing.id} className={`min-w-0 max-w-full ${listingRowItemClass(index)}`}>
                  <ListingCard
                    listing={listing}
                    isOwner={userId === listing.sellerId}
                    currentUserId={userId}
                    priorityImage={index < 4}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : !isAuthenticated ? (
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            {t('empty_cart_guest_favorites', CART_MESSAGES.EMPTY_CART_GUEST_FAVORITES)}
          </p>
          <Link to={ROUTES.LOGIN} className={`${buttonClasses()} shrink-0`}>
            {t('empty_cart_sign_in', CART_MESSAGES.EMPTY_CART_SIGN_IN)}
          </Link>
        </Card>
      ) : null}
    </div>
  );
};

export default EmptyCartView;

import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../common/constants/routes.js';
import { listingService } from '../../listing/services/listingService.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import ErrorState from '../../common/components/ui/ErrorState.jsx';
import HomeSection from './HomeSection.jsx';
import { HOME_GRID_COLUMNS, HOME_GRID_GAP, HOME_GRID_SIZE } from './homeLayout.js';

// The viewer is part of the key: cards carry per-user favorite state and blocked sellers are left out.
const homeBestSellersQueryKey = (userId) => ['listings', 'home', 'bestSellers', HOME_GRID_SIZE, userId ?? 'guest'];

/** Active listings with the most units sold, across all categories. Hidden when nothing has sold yet. */
const BestSellersSection = () => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const { data: listings = [], isLoading, isError, refetch } = useQuery({
    queryKey: homeBestSellersQueryKey(user?.id),
    queryFn: async () => {
      const result = await listingService.getBestSellers(HOME_GRID_SIZE);
      return Array.isArray(result) ? result : [];
    },
    // The backend ranking is cached for minutes, so refetching more often would only repeat it.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  if (!isLoading && !isError && listings.length === 0) return null;

  let content;
  if (isLoading) {
    content = <HomeSection.Skeleton />;
  } else if (isError) {
    content = (
      <ErrorState title={t('home_best_sellers_load_failed', 'Çok satan ilanlar yüklenemedi')} onRetry={refetch} />
    );
  } else {
    content = (
      <div className={`grid ${HOME_GRID_GAP} ${HOME_GRID_COLUMNS}`}>
        {listings.map(listing => (
          <ListingCard
            key={listing.id}
            listing={listing}
            showActions={false}
            isOwner={user?.id === listing.sellerId}
            currentUserId={user?.id}
          />
        ))}
      </div>
    );
  }

  return (
    <HomeSection
      title={t('home_best_sellers_title', 'Çok satanlar')}
      linkTo={ROUTES.LISTINGS}
      linkLabel={t('see_all', 'Tümünü gör')}
    >
      {content}
    </HomeSection>
  );
};

export default BestSellersSection;

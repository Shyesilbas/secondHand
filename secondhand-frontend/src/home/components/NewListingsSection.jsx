import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../common/constants/routes.js';
import { listingService } from '../../listing/services/listingService.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import Button from '../../common/components/ui/Button.jsx';
import HomeSection from './HomeSection.jsx';
import { HOME_GRID_COLUMNS, HOME_GRID_SIZE } from './homeLayout.js';

const HOME_NEWEST_QUERY_KEY = ['listings', 'home', 'newest', HOME_GRID_SIZE];

/** Newest active listings: always has content, unlike the showcase. Hidden when there are none. */
const NewListingsSection = () => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const { data: listings = [], isLoading, isError, refetch } = useQuery({
    queryKey: HOME_NEWEST_QUERY_KEY,
    queryFn: async () => {
      const page = await listingService.filterListings({
        status: 'ACTIVE',
        page: 0,
        size: HOME_GRID_SIZE,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      });
      return Array.isArray(page?.content) ? page.content : [];
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false
  });

  if (!isLoading && !isError && listings.length === 0) return null;

  let content;
  if (isLoading) {
    content = <HomeSection.Skeleton />;
  } else if (isError) {
    content = (
      <Alert
        type="error"
        message={t('home_newest_load_failed', 'Yeni ilanlar yüklenemedi.')}
        action={<Button variant="secondary" size="sm" onClick={() => refetch()}>{t('try_again', 'Tekrar dene')}</Button>}
      />
    );
  } else {
    content = (
      <div className={`grid gap-4 ${HOME_GRID_COLUMNS}`}>
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
      title={t('home_newest_title', 'Yeni eklenenler')}
      linkTo={ROUTES.LISTINGS}
      linkLabel={t('see_all', 'Tümünü gör')}
    >
      {content}
    </HomeSection>
  );
};

export default NewListingsSection;

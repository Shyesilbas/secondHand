import { useTranslation } from 'react-i18next';
import { Store } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import ListingCard from '../../listing/components/ListingCard.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import Button from '../../common/components/ui/Button.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import HomeSection from './HomeSection.jsx';
import { HOME_GRID_COLUMNS, HOME_GRID_SIZE } from './homeLayout.js';

const ShowcaseSection = () => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const { showcases, loading, error, refetch } = useShowcaseQueries({ enabled: true, page: 0, size: HOME_GRID_SIZE });

  let content;
  if (loading) {
    content = <HomeSection.Skeleton />;
  } else if (error) {
    content = (
      <Alert
        type="error"
        message={t('home_showcase_load_failed', 'Vitrin ilanları yüklenemedi.')}
        action={<Button variant="secondary" size="sm" onClick={() => refetch()}>{t('try_again', 'Tekrar dene')}</Button>}
      />
    );
  } else if (showcases.length === 0) {
    content = (
      <EmptyState
        icon={Store}
        size="compact"
        title={t('home_showcase_empty', 'Vitrinde şu an ilan yok')}
        description={t('home_showcase_empty_desc', 'Öne çıkarılan ilanlar burada görünür.')}
      />
    );
  } else {
    content = (
      <div className={`grid gap-4 ${HOME_GRID_COLUMNS}`}>
        {showcases.map(showcase => (
          <ListingCard
            key={showcase.id}
            listing={showcase.listing}
            showActions={false}
            isOwner={user?.id === showcase.listing?.sellerId}
            currentUserId={user?.id}
          />
        ))}
      </div>
    );
  }

  return (
    <HomeSection
      title={t('featured_listings', 'Vitrin')}
      description={t('home_showcase_desc', 'Satıcıların öne çıkardığı ilanlar.')}
      linkTo={ROUTES.LISTINGS}
      linkLabel={t('see_all', 'Tümünü gör')}
    >
      {content}
    </HomeSection>
  );
};

export default ShowcaseSection;

import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthState } from '../../auth/AuthContext.jsx';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import RecentlyViewedSection from '../../listing/components/RecentlyViewedSection.jsx';
import HeroSection from '../components/HeroSection.jsx';
import HomeSection from '../components/HomeSection.jsx';

const ShowcaseSection = lazy(() => import('../components/ShowcaseSection.jsx'));
const BestSellersSection = lazy(() => import('../components/BestSellersSection.jsx'));

// Lazy sections fall back to the same grid skeleton they show while loading, so nothing jumps.
const SectionFallback = () => (
  <PageContainer>
    <HomeSection.Skeleton />
  </PageContainer>
);

const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthState();

  return (
    <div className="flex min-h-screen flex-col bg-background-page">
      {/* Guests get the value proposition; signed-in users go straight to listings, while the page keeps an h1. */}
      {isAuthenticated
        ? <h1 className="sr-only">{t('hero.title', 'Doğrudan alıcı ve satıcıdan ikinci el.')}</h1>
        : <HeroSection />}

      <div className="flex flex-col gap-16 py-12">
        <PageContainer className="w-full empty:hidden">
          <RecentlyViewedSection />
        </PageContainer>

        <Suspense fallback={<SectionFallback />}>
          <ShowcaseSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <BestSellersSection />
        </Suspense>
      </div>
    </div>
  );
};

export default HomePage;

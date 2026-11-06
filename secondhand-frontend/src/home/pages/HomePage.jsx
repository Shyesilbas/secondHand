import { lazy, Suspense } from 'react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import RecentlyViewedSection from '../../listing/components/RecentlyViewedSection.jsx';
import HeroSection from '../components/HeroSection.jsx';
import TrustBand from '../components/TrustBand.jsx';
import HomeSection from '../components/HomeSection.jsx';

const ShowcaseSection = lazy(() => import('../components/ShowcaseSection.jsx'));
const NewListingsSection = lazy(() => import('../components/NewListingsSection.jsx'));

// Lazy sections fall back to the same grid skeleton they show while loading, so nothing jumps.
const SectionFallback = () => (
  <PageContainer>
    <HomeSection.Skeleton />
  </PageContainer>
);

const HomePage = () => (
  <div className="flex min-h-screen flex-col bg-background-primary">
    <HeroSection />

    <div className="flex flex-col gap-12 py-10">
      <PageContainer className="empty:hidden">
        <RecentlyViewedSection />
      </PageContainer>

      <Suspense fallback={<SectionFallback />}>
        <ShowcaseSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <NewListingsSection />
      </Suspense>
    </div>

    <TrustBand />
  </div>
);

export default HomePage;

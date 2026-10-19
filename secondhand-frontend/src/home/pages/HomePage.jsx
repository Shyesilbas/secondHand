import { lazy, Suspense } from 'react';
import { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';
import RecentlyViewedSection from '../../listing/components/RecentlyViewedSection.jsx';
import HeroSection from '../components/HeroSection.jsx';
import TrustBand from '../components/TrustBand.jsx';
import SellerCtaSection from '../components/SellerCtaSection.jsx';

const ShowcaseSection = lazy(() => import('../components/ShowcaseSection.jsx'));

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      {/* 1. Minimal Editorial Hero Section */}
      <HeroSection />

      {/* 2. Hairline Trust Band */}
      <TrustBand />

      {/* 3. Main Discovery & Showcase Flow */}
      <div className="flex flex-col gap-10 py-10">
        {/* Son Gezilen İlanlar (Eğer gezilen ilan varsa gösterilir) */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full">
          <RecentlyViewedSection />
        </div>

        {/* Vitrin / Featured Showcase Listings */}
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
              <div className="h-6 bg-background-tertiary rounded w-1/4 mb-6" />
              <SkeletonGrid count={6} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" />
            </div>
          }
        >
          <ShowcaseSection />
        </Suspense>

        {/* Satış Yapma Çağrısı (Seller Callout) */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full">
          <SellerCtaSection />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
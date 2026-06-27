import { useTranslation } from "react-i18next";
import React, { lazy, Suspense } from 'react';
import { usePageTheme } from '../../common/theme/usePageTheme.js';
import { HomePageTheme } from '../themes/index.js';
import { HeroSection, TrustBand } from '../components/index.js';
import { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';

// Lazy loaded components for code splitting & better initial load performance
const CategoryHub = lazy(() => import('../components/CategoryHub.jsx'));
const MarketplaceStatsSection = lazy(() => import('../components/MarketplaceStatsSection.jsx'));
const ShowcaseSection = lazy(() => import('../components/ShowcaseSection.jsx'));
const GreatSellersSection = lazy(() => import('../components/GreatSellersSection.jsx'));
const TrustExperienceSection = lazy(() => import('../components/TrustExperienceSection.jsx'));
const PremiumBanner = lazy(() => import('../components/PremiumBanner.jsx'));

const HomePage = () => {
  const { t } = useTranslation();
  usePageTheme(HomePageTheme);

  return (
    <div className="min-h-screen bg-page-canvas flex flex-col gap-12 pb-16">
      {/* Above the fold - eagerly loaded for performance */}
      <div>
        <HeroSection />
        <TrustBand />
      </div>

      {/* Below the fold sections - lazy loaded with skeletons */}
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 animate-pulse">
          <div className="h-24 bg-slate-100 rounded-xl w-full" />
        </div>
      }>
        <CategoryHub />
      </Suspense>

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
          <SkeletonGrid count={4} columns="grid-cols-2 lg:grid-cols-4" />
        </div>
      }>
        <MarketplaceStatsSection />
      </Suspense>

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="h-10 bg-slate-100 rounded w-1/4 mb-6 animate-pulse" />
          <SkeletonGrid count={6} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" />
        </div>
      }>
        <ShowcaseSection />
      </Suspense>

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="h-10 bg-slate-100 rounded w-1/4 mb-6 animate-pulse" />
          <SkeletonGrid count={4} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
        </div>
      }>
        <GreatSellersSection />
      </Suspense>

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 animate-pulse">
          <div className="h-48 bg-slate-100 rounded-xl w-full" />
        </div>
      }>
        <TrustExperienceSection />
      </Suspense>

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 animate-pulse">
          <div className="h-48 bg-slate-100 rounded-3xl w-full" />
        </div>
      }>
        <PremiumBanner />
      </Suspense>
    </div>
  );
};

export default HomePage;
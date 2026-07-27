import { useTranslation } from "react-i18next";
import React, { lazy, Suspense } from 'react';
import { usePageTheme } from '../../common/theme/usePageTheme.js';
import { HomePageTheme } from '../themes/index.js';
import { HeroSection } from '../components/index.js';
import { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';

// Lazy loaded components for optimized page load & clean structure
const CategoryHub = lazy(() => import('../components/CategoryHub.jsx'));
const ShowcaseSection = lazy(() => import('../components/ShowcaseSection.jsx'));
const GreatSellersSection = lazy(() => import('../components/GreatSellersSection.jsx'));

const HomePage = () => {
  const { t } = useTranslation();
  usePageTheme(HomePageTheme);

  return (
    <div className="min-h-screen bg-white flex flex-col gap-8 pb-16">
      {/* 1. Hero Section (Search & Showcase Stage) */}
      <HeroSection />

      {/* 2. Category Hub */}
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 animate-pulse">
          <div className="h-20 bg-slate-100 rounded-2xl w-full" />
        </div>
      }>
        <CategoryHub />
      </Suspense>

      {/* 3. Vitrin / Featured Showcase Listings */}
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <div className="h-8 bg-slate-100 rounded-lg w-1/4 mb-6 animate-pulse" />
          <SkeletonGrid count={6} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" />
        </div>
      }>
        <ShowcaseSection />
      </Suspense>

      {/* 4. Great Vetted Sellers */}
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <div className="h-8 bg-slate-100 rounded-lg w-1/4 mb-6 animate-pulse" />
          <SkeletonGrid count={4} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
        </div>
      }>
        <GreatSellersSection />
      </Suspense>
    </div>
  );
};

export default HomePage;
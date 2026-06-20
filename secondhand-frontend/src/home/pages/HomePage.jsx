import { useTranslation } from "react-i18next";
import React, { lazy, Suspense } from 'react';
import { usePageTheme } from '../../common/theme/usePageTheme.js';
import { HomePageTheme } from '../themes/index.js';
const HeroSection = lazy(() => import('../components/HeroSection.jsx'));
const CategoryHub = lazy(() => import('../components/CategoryHub.jsx'));
const MarketplaceStatsSection = lazy(() => import('../components/MarketplaceStatsSection.jsx'));
const ShowcaseSection = lazy(() => import('../components/ShowcaseSection.jsx'));
const GreatSellersSection = lazy(() => import('../components/GreatSellersSection.jsx'));
const TrustExperienceSection = lazy(() => import('../components/TrustExperienceSection.jsx'));
const TrustBand = lazy(() => import('../components/TrustBand.jsx'));
const HomePage = () => {
  const {
    t
  } = useTranslation();
  usePageTheme(HomePageTheme);
  return <div className="min-h-screen bg-page-canvas">
      <Suspense fallback={<div className="py-10 text-center text-sm text-text-muted">{t("loading")}</div>}>
        <HeroSection />
        <TrustBand />
        <MarketplaceStatsSection />
        <CategoryHub />
        <ShowcaseSection />
        <GreatSellersSection />
        <TrustExperienceSection />
      </Suspense>
    </div>;
};
export default HomePage;
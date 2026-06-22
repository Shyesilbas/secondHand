import {useTranslation} from "react-i18next";
import React from 'react';
import {usePageTheme} from '../../common/theme/usePageTheme.js';
import {HomePageTheme} from '../themes/index.js';
import {HeroSection, PremiumBanner, ShowcaseSection, TrustBand} from '../components/index.js';

const HomePage = () => {
  const {
    t
  } = useTranslation();
  usePageTheme(HomePageTheme);
  return <div className="min-h-screen bg-page-canvas">
        <HeroSection />
        <TrustBand />
        <PremiumBanner />
        <ShowcaseSection />
    </div>;
};
export default HomePage;
import React, { Suspense, lazy } from 'react';
import {usePageTheme} from '../../common/theme/usePageTheme.js';
import {HomePageTheme} from '../themes/index.js';

const HeroSection = lazy(() => import('../components/HeroSection.jsx'));
const ShowcaseSection = lazy(() => import('../components/ShowcaseSection.jsx'));
const TrustBand = lazy(() => import('../components/TrustBand.jsx'));

const HomePage = () => {
  usePageTheme(HomePageTheme);

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="py-10 text-center text-[13px] text-gray-400">Loading…</div>}>
        <HeroSection />
        <ShowcaseSection />
        <TrustBand />
      </Suspense>
    </div>
  );
};

export default HomePage;

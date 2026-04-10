import React, { Suspense, lazy } from 'react';
import {usePageTheme} from '../../common/theme/usePageTheme.js';
import {HomePageTheme} from '../themes/index.js';

const HeroSection = lazy(() => import('../components/HeroSection.jsx'));
const ShowcaseSection = lazy(() => import('../components/ShowcaseSection.jsx'));

const HomePage = () => {
  usePageTheme(HomePageTheme);

  return (
    <div className="min-h-screen bg-white pb-10">
      <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading homepage sections...</div>}>
        <HeroSection />
        <ShowcaseSection />
      </Suspense>
    </div>
  );
};

export default HomePage;

import React, { Suspense, lazy } from 'react';
import {usePageTheme} from '../../common/theme/usePageTheme.js';
import {HomePageTheme} from '../themes/index.js';

const ShowcaseSection = lazy(() => import('../components/ShowcaseSection.jsx'));
const CategoriesSection = lazy(() => import('../components/CategoriesSection.jsx'));
const MostFavoritedSection = lazy(() => import('../components/MostFavoritedSection.jsx'));

const HomePage = () => {
  usePageTheme(HomePageTheme);

  return (
    <div className="min-h-screen bg-white pb-10">
      <Suspense fallback={<div className="flex items-center justify-center p-10"><span className="text-gray-500">Bölümler Yükleniyor...</span></div>}>
        <ShowcaseSection />
        <CategoriesSection />
        <MostFavoritedSection />
      </Suspense>
    </div>
  );
};

export default HomePage;

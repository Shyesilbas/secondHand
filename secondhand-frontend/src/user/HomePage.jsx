import React from 'react';
import { usePageTheme } from '../common/theme/usePageTheme.js';
import { HomePageTheme } from '../home/themes/HomePage.theme.js';
import {
  ShowcaseSection,
  MostFavoritedSection
} from '../home/components/index.js';

const HomePage = () => {
  usePageTheme(HomePageTheme);

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: 'var(--page-page-background, #f8fafc)' 
      }}
    >
      <ShowcaseSection />
      <MostFavoritedSection />
    </div>
  );
};

export default HomePage;

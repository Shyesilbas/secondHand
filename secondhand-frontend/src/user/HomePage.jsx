import React from 'react';
import {
  HeroSection,
  ShowcaseSection,
  CategoriesSection
} from '../home/components/index.js';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ShowcaseSection />
      <CategoriesSection />
    </div>
  );
};

export default HomePage;

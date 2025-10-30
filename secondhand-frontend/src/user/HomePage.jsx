import React from 'react';
import {
  ShowcaseSection,
  CategoriesSection
} from '../home/components/index.js';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <ShowcaseSection />
      <CategoriesSection />
    </div>
  );
};

export default HomePage;

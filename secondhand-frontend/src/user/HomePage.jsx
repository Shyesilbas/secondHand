import React from 'react';
import {
  ShowcaseSection,
  RecentListingsSection
} from '../home/components/index.js';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <ShowcaseSection />
      <RecentListingsSection />
    </div>
  );
};

export default HomePage;

import React from 'react';
import {useTranslation} from "react-i18next";
import {usePageTheme} from '../../common/theme/usePageTheme.js';
import {HomePageTheme} from '../themes/index.js';
import {GreatSellersSection, MarketplaceStatsSection, TrustExperienceSection} from '../components/index.js';

const AboutPage = () => {
  const { t } = useTranslation();
  usePageTheme(HomePageTheme);

  return (
    <div className="min-h-screen bg-page-canvas">
      {/* Header section for About Page */}
      <div className="bg-background-secondary border-b border-border-light py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-4">
            {t("about_secondhand_title", "About SecondHand")}
          </h1>
          <p className="text-lg text-text-secondary font-medium max-w-3xl leading-relaxed">
            {t("about_secondhand_subtitle", "We prioritize real, working technology and community trust over marketing promises. Explore how our marketplace empowers safe and transparent trades.")}
          </p>
        </div>
      </div>

      <MarketplaceStatsSection />
      <TrustExperienceSection />
      <GreatSellersSection />
    </div>
  );
};

export default AboutPage;

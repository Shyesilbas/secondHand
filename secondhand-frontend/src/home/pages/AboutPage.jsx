import { useTranslation } from "react-i18next";
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import { GreatSellersSection, MarketplaceStatsSection, TrustExperienceSection } from '../components/index.js';

// Same shell as the home page: one canvas, sections separated by space (gap-16), not by bands and borders.
const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-page">
      <div className="flex flex-col gap-16 py-12">
        <PageContainer>
          <header className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              {t("about_secondhand_title")}
            </h1>
            <p className="mt-4 text-lg text-text-secondary">{t("about_secondhand_subtitle")}</p>
          </header>
        </PageContainer>

        <MarketplaceStatsSection />
        <TrustExperienceSection />
        <GreatSellersSection />
      </div>
    </div>
  );
};

export default AboutPage;

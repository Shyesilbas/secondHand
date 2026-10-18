import {useTranslation} from "react-i18next";
import {GreatSellersSection, MarketplaceStatsSection, TrustExperienceSection} from '../components/index.js';

const AboutPage = () => {
 const { t } = useTranslation();

 return (
 <div className="min-h-screen bg-background-secondary">
 {/* Header section for About Page */}
 <div className="bg-background-secondary border-b border-border-light py-16">
 <div className="max-w-7xl mx-auto px-6 sm:px-8">
 <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight mb-4">
 {t("about_secondhand_title")}
 </h1>
 <p className="text-lg text-text-secondary font-medium max-w-3xl leading-relaxed">
 {t("about_secondhand_subtitle")}
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

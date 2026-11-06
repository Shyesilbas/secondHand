import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import { ROUTES } from '../../common/constants/routes.js';

const HeroSection = () => {
  const { t } = useTranslation();
  return (
    <section className="border-b border-border-light">
      <PageContainer className="py-10 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl">
            {t('hero.title', 'Doğrudan alıcı ve satıcıdan ikinci el.')}
          </h1>
          <p className="mt-3 text-base text-text-secondary sm:text-lg">
            {t('hero.subtitle_short', 'Ödemen, ürünü teslim aldığını onaylayana kadar güvencede kalır.')}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={ROUTES.LISTINGS} className={buttonClasses('primary')}>
              {t('browse_listings', 'İlanları incele')}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Link>
            <Link to={ROUTES.LISTINGS_PREFILTER_CREATE} className={buttonClasses('secondary')}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {t('create_listing', 'İlan ver')}
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default HeroSection;

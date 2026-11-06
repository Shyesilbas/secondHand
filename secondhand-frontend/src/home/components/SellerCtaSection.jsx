import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import { ROUTES } from '../../common/constants/routes.js';

const SellerCtaSection = () => {
  const { t } = useTranslation();
  return (
    <section>
      <PageContainer>
        <div className="flex flex-col gap-4 rounded border border-border bg-background-secondary p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-text-primary">
              {t('seller_cta.title', 'Satmak istediğin bir ürün mü var?')}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t('seller_cta.subtitle', 'Fotoğraflarını yükle, fiyatını belirle ve alıcılarla doğrudan buluş.')}
            </p>
          </div>
          <Link to={ROUTES.LISTINGS_PREFILTER_CREATE} className={`${buttonClasses('primary')} shrink-0`}>
            <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            {t('create_listing', 'İlan ver')}
          </Link>
        </div>
      </PageContainer>
    </section>
  );
};

export default SellerCtaSection;

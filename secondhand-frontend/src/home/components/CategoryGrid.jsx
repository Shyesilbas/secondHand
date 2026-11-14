import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { getListingTypeOptions } from '../../listing/config/listingConfig.js';
import { PREFILTER_CATEGORY_COPY } from '../../listing/config/prefilterCopy.js';
import HomeSection from './HomeSection.jsx';

/** One tile per listing category; each opens the listings page filtered to that category. */
const CategoryGrid = () => {
  const { t } = useTranslation();
  const categories = getListingTypeOptions();

  return (
    <HomeSection
      title={t('home_categories_title', 'Kategoriler')}
      linkTo={ROUTES.LISTINGS_PREFILTER}
      linkLabel={t('all_categories', 'Tüm kategoriler')}
    >
      <ul className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
        {categories.map(({ value, icon: Icon, label }) => (
          <li key={value}>
            <Link
              to={`${ROUTES.LISTINGS}?category=${value}`}
              className="flex h-full flex-col items-center gap-3 rounded border border-border bg-background-primary px-3 py-5 text-center shadow-sm transition-all duration-200 hover:border-card-border-hover hover:shadow"
            >
              {Icon && (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background-tertiary text-text-secondary">
                  <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                </span>
              )}
              <span className="text-sm font-medium text-text-primary">
                {t(`category_${value.toLowerCase()}`, PREFILTER_CATEGORY_COPY[value]?.label || label)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
};

export default CategoryGrid;

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import PageContainer from '../PageContainer.jsx';
import { ROUTES } from '../../../constants/routes.js';
import { getListingTypeOptions } from '../../../../listing/config/listingConfig.js';
import { PREFILTER_CATEGORY_COPY } from '../../../../listing/config/prefilterCopy.js';

// Browsing pages only; checkout, inbox, profile and the listing form have no use for category links.
const isBrowsingPage = (pathname) => {
  if (pathname === ROUTES.HOME || pathname === ROUTES.LISTINGS) return true;
  const detail = matchPath('/listings/:id', pathname);
  return Boolean(detail && !['prefilter', 'create'].includes(detail.params.id));
};

/**
 * One row of category links under the header. Each opens the listing page for that category;
 * deeper narrowing (type, brand, model) lives in the category flow and the listing filters.
 */
const CategorySubHeader = () => {
  const { t, i18n } = useTranslation();
  const { pathname, search } = useLocation();
  const categories = useMemo(() => {
    void i18n.language;
    return getListingTypeOptions().map(o => {
      const key = `category_${o.value.toLowerCase()}`;
      const translated = t(key);
      const label = (translated && translated !== key)
        ? translated
        : (PREFILTER_CATEGORY_COPY[o.value]?.label || o.label);
      return {
        value: o.value,
        icon: o.icon,
        label
      };
    });
  }, [t, i18n.language]);

  if (!isBrowsingPage(pathname)) return null;

  const activeCategory = pathname === ROUTES.LISTINGS ? new URLSearchParams(search).get('category') : null;
  const linkClass = (active) => `inline-flex shrink-0 items-center gap-1.5 border-b-2 px-1 py-2.5 text-sm transition-colors duration-150 ${active ? 'border-primary font-medium text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
    }`;

  return (
    <nav className="border-t border-border-light bg-background-primary" aria-label={t('categories', 'Kategoriler')}>
      <PageContainer>
        <ul className="-mb-px flex items-center gap-5 overflow-x-auto">
          {categories.map(({ value, icon: Icon, label }) => {
            const active = activeCategory === value;
            return (
              <li key={value}>
                <Link
                  to={`${ROUTES.LISTINGS}?category=${value}`}
                  aria-current={active ? 'page' : undefined}
                  className={linkClass(active)}
                >
                  {Icon && <Icon className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />}
                  {label}
                </Link>
              </li>
            );
          })}
          <li className="ml-auto">
            <Link to={ROUTES.LISTINGS_PREFILTER} className={linkClass(false)}>
              <LayoutGrid className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              {t('all_categories', 'Tüm kategoriler')}
            </Link>
          </li>
        </ul>
      </PageContainer>
    </nav>
  );
};

export default CategorySubHeader;

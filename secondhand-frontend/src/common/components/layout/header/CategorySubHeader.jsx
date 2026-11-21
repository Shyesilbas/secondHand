import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
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
 * Category tabs under the main header on browsing routes, on the same white surface as the header.
 * Aligns with Header's and PageContainer's max-w-7xl container so edges stay flush across viewports.
 */
const CategorySubHeader = () => {
  const { t, i18n } = useTranslation();
  const { pathname, search } = useLocation();
  const categories = useMemo(() => {
    void i18n.language;
    return getListingTypeOptions().map((o) => {
      const key = `category_${o.value.toLowerCase()}`;
      const translated = t(key);
      const label = (translated && translated !== key)
        ? translated
        : (PREFILTER_CATEGORY_COPY[o.value]?.label || o.label);
      return {
        value: o.value,
        icon: o.icon,
        label,
      };
    });
  }, [t, i18n.language]);

  if (!isBrowsingPage(pathname)) return null;

  const activeCategory = pathname === ROUTES.LISTINGS ? new URLSearchParams(search).get('category') : null;
  // Tabs on the header's own white surface; the active one draws a teal underline over the header's bottom line.
  const itemClass = (active) =>
    `group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus ${
      active
        ? 'border-accent-teal font-medium text-text-primary'
        : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary'
    }`;

  return (
    <nav className="border-t border-border-light bg-background-primary" aria-label={t('categories', 'Kategoriler')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="-mb-px flex items-center gap-5 overflow-x-auto">
          <li className="shrink-0">
            <Link
              to={ROUTES.LISTINGS_PREFILTER}
              className={`${itemClass(false)} font-medium text-text-primary`}
            >
              <LayoutGrid className="h-4 w-4 shrink-0 text-text-secondary transition-colors duration-150 group-hover:text-text-primary" strokeWidth={1.5} aria-hidden />
              {t('all_categories', 'Tüm Kategoriler')}
            </Link>
          </li>
          <li aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
          {categories.map(({ value, icon: Icon, label }) => {
            const active = activeCategory === value;
            return (
              <li key={value} className="shrink-0">
                <Link
                  to={`${ROUTES.LISTINGS}?category=${value}`}
                  aria-current={active ? 'page' : undefined}
                  className={itemClass(active)}
                >
                  {Icon && (
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors duration-150 ${
                        active ? 'text-accent-teal' : 'text-text-tertiary group-hover:text-text-secondary'
                      }`}
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  )}
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default CategorySubHeader;

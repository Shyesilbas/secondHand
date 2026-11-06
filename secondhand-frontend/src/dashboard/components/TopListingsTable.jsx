import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency } from '../../common/formatters.js';
import { optimizeCloudinaryUrl } from '../../common/utils/imageOptimizer.js';
import { CardEmpty } from './DashboardUi.jsx';
import { DASHBOARD_CURRENCY } from '../dashboardConstants.js';

/** Best-selling listings in the period: rank, photo, title, sales and revenue. */
const TopListingsTable = ({ listings = [] }) => {
  const { t } = useTranslation();

  if (!listings.length) {
    return <CardEmpty>{t('dash_no_sales', 'Bu dönemde satış yok.')}</CardEmpty>;
  }

  return (
    <ol className="divide-y divide-border-light">
      {listings.map((listing, index) => (
        <li key={listing.listingId}>
          <Link
            to={ROUTES.LISTING_DETAIL(listing.listingId)}
            className="-mx-2 flex items-center gap-3 rounded px-2 py-2.5 transition-colors duration-150 hover:bg-background-secondary"
          >
            <span className="w-4 shrink-0 text-right text-xs tabular-nums text-text-tertiary">{index + 1}</span>
            {listing.mainImageUrl ? (
              <img
                src={optimizeCloudinaryUrl(listing.mainImageUrl, { width: 80, height: 80, crop: 'fill' })}
                alt=""
                className="h-10 w-10 shrink-0 rounded object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-background-tertiary">
                <Package className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-text-primary">{listing.title}</p>
              <p className="text-xs tabular-nums text-text-tertiary">
                {t('dash_sale_count', { defaultValue: '{{count}} satış', count: listing.orderCount || 0 })}
                {listing.averageRating > 0 && ` · ${listing.averageRating.toFixed(1)} puan`}
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums text-text-primary">
              {formatCurrency(listing.revenue, DASHBOARD_CURRENCY)}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
};

export default TopListingsTable;

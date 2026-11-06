import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/common/constants/routes';
import { formatCurrency } from '@/common/formatters';
import { optimizeCloudinaryUrl } from '@/common/utils/imageOptimizer.js';
import { DASHBOARD_CURRENCY } from '../dashboardConstants.js';

/** Favorited listings that are on a campaign now; each tile opens the listing. */
const PriceDropWatchlist = ({ priceDrops = [] }) => {
  const { t } = useTranslation();

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {priceDrops.map((item) => (
        <li key={item.listingId}>
          <Link to={ROUTES.LISTING_DETAIL(item.listingId)} className="group block">
            <img
              src={optimizeCloudinaryUrl(item.imageUrl, { width: 300, height: 300, crop: 'fill' })}
              alt=""
              className="aspect-square w-full rounded bg-background-tertiary object-cover"
            />
            <p className="mt-2 truncate text-sm text-text-primary group-hover:underline">{item.title}</p>
            <p className="text-sm font-medium tabular-nums text-text-primary">{formatCurrency(item.currentPrice, DASHBOARD_CURRENCY)}</p>
            <p className="truncate text-xs text-status-success-text">{item.campaignName || t('dash_on_campaign', 'Kampanyada')}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default PriceDropWatchlist;

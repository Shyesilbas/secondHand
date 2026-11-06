import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { ROUTES } from '@/common/constants/routes';
import { formatCurrency } from '@/common/formatters';
import { optimizeCloudinaryUrl } from '@/common/utils/imageOptimizer.js';
import { DASHBOARD_CURRENCY, ORDER_STATUS_ROWS } from '../dashboardConstants.js';

const statusRow = (status) => ORDER_STATUS_ROWS.find(r => r.key === status) || ORDER_STATUS_ROWS[1];

/** Orders on their way to the buyer; each row opens its shipment page. */
const ActiveDeliveriesTracker = ({ activeDeliveries = [] }) => {
  const { t } = useTranslation();

  return (
    <ul className="divide-y divide-border-light">
      {activeDeliveries.map((delivery) => {
        const status = statusRow(delivery.status);
        return (
          <li key={delivery.orderId || delivery.orderNumber}>
            <Link
              to={delivery.orderId ? ROUTES.PROFILE_ORDER_SHIPMENT(delivery.orderId) : ROUTES.MY_ORDERS}
              className="-mx-2 flex items-center gap-3 rounded px-2 py-2.5 transition-colors duration-150 hover:bg-background-secondary"
            >
              {delivery.listingImageUrl ? (
                <img
                  src={optimizeCloudinaryUrl(delivery.listingImageUrl, { width: 96, height: 96, crop: 'fill' })}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-background-tertiary">
                  <Package className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text-primary">{delivery.listingTitle}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-tertiary">
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
                  <span className="text-text-secondary">{t(`dash_status_${status.key.toLowerCase()}`, status.label)}</span>
                  {delivery.sellerName && <span className="truncate">· {delivery.sellerName}</span>}
                </p>
              </div>
              <span className="shrink-0 text-sm tabular-nums text-text-primary">{formatCurrency(delivery.price, DASHBOARD_CURRENCY)}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default ActiveDeliveriesTracker;

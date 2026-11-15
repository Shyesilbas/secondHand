import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import Alert from '@/common/components/ui/Alert';
import Button, { buttonClasses } from '@/common/components/ui/Button';
import Skeleton from '@/common/components/ui/Skeleton';
import { Badge, Card, EmptyState } from '../../../common/components/ui/index.js';
import { ROUTES } from '../../../common/constants/routes.js';
import { formatCurrency, formatLongDate } from '../../../common/formatters.js';
import { getOrderStatusBadgeVariant } from '../../../order/utils/statusPresentation.js';

const AccountHubRecentOrders = ({
  ordersLoading,
  ordersError,
  recentOrders,
  refetchOrders,
  trEn
}) => {
  const { t } = useTranslation();

  return (
    <Card as="section" shadow={false} className="flex flex-col lg:col-span-2">
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-border-light pb-3">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('recent_orders', 'Recent Orders')}
        </h2>
        <Link
          to={ROUTES.MY_ORDERS}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <span>{t('view_all', 'View All')}</span>
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </Link>
      </div>

      {ordersLoading ? (
        <div className="space-y-3">
          {['a', 'b', 'c'].map((k) => (
            <Skeleton key={k} className="h-14" />
          ))}
        </div>
      ) : ordersError ? (
        <Alert
          type="error"
          message={trEn(
            'Siparişler yüklenirken bir hata oluştu.',
            'Failed to load recent orders.'
          )}
          action={
            <Button variant="secondary" size="sm" onClick={() => refetchOrders()}>
              {trEn('Tekrar Dene', 'Retry')}
            </Button>
          }
        />
      ) : recentOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t('your_shopping_bag_is_waiting')}
          description={t('explore_our_second_hand_listings_to_find')}
          className="flex-1 py-8"
          action={
            <Link to={ROUTES.LISTINGS} className={buttonClasses('secondary', 'sm')}>
              {t('explore_listings')}
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-border-light">
          {recentOrders.map((order) => {
            const items = order.orderItems || order.items || [];
            const firstItem = items[0];
            const listing = firstItem?.listing;
            const thumbUrl = listing?.imageUrl || firstItem?.imageUrl;
            const lineTitle = listing?.title || firstItem?.title;
            const statusLabel =
              {
                COMPLETED: t('completed', 'Completed'),
                DELIVERED: trEn('Teslim Edildi', 'Delivered'),
                SHIPPED: trEn('Kargoya Verildi', 'Shipped'),
                IN_TRANSIT: trEn('Kargoda', 'In Transit'),
                PROCESSING: trEn('Hazırlanıyor', 'Processing'),
                CANCELLED: trEn('İptal Edildi', 'Cancelled')
              }[order.status] || order.status?.replace(/_/g, ' ');

            return (
              <li key={order.id}>
                <Link
                  to={ROUTES.MY_ORDERS}
                  className="-mx-2 flex items-center justify-between gap-4 rounded px-2 py-3 transition-colors duration-150 hover:bg-background-secondary"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-secondary">
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ShoppingBag
                          className="h-4 w-4 text-text-muted"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-text-primary">
                        {order.name || lineTitle || trEn('Siparişiniz', 'Your Order')}
                      </h3>
                      {order.createdAt ? (
                        <time
                          dateTime={order.createdAt}
                          className="mt-0.5 block text-xs tabular-nums text-text-tertiary"
                        >
                          {formatLongDate(order.createdAt)}
                        </time>
                      ) : null}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-text-primary">
                      {formatCurrency(
                        order.totalAmount ?? order.total ?? 0,
                        order.currency || 'TRY'
                      )}
                    </p>
                    <Badge
                      variant={getOrderStatusBadgeVariant(order.status)}
                      dot
                      size="sm"
                      className="mt-1"
                    >
                      {statusLabel}
                    </Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default AccountHubRecentOrders;

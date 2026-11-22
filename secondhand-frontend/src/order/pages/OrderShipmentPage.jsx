import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Copy, Package } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';
import { ROUTES } from '../../common/constants/routes.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';
import { ORDER_TIME } from '../constants/orderUiConstants.js';
import { orderService } from '../services/orderService.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';
import { getOrderStatusBadgeVariant, getOrderStatusLabel } from '../utils/statusPresentation.js';
import { ShippingDetailsSection } from '../components/orderDetails/ShippingDetailsSection.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '../../common/components/ui/index.js';

const Panel = ({ children, className = '' }) => (
  <Card className={className}>{children}</Card>
);

/** Uygulama içi sipariş kargo özeti (/profile/orders/... veya /profile/i-sold/... altında kullanılabilir.) */
const OrderShipmentPage = () => {
  const { t } = useTranslation();
  const { enums } = useEnums();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  const isSellerView = location.pathname.includes(`${ROUTES.I_SOLD}/`);
  const scope = isSellerView ? 'seller' : 'buyer';

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ORDER_QUERY_KEYS.orderShipment(scope, orderId),
    queryFn: () => (isSellerView ? orderService.getSellerOrderById(orderId) : orderService.getById(orderId)),
    enabled: Boolean(orderId),
    staleTime: ORDER_TIME.ORDERS_LIST_STALE_MS
  });

  const backPath = isSellerView ? ROUTES.I_SOLD : ROUTES.MY_ORDERS;
  const formattedOrderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';
  const title =
    order?.name ||
    order?.orderItems?.[0]?.listing?.title ||
    formattedOrderDate ||
    t('shipment_tracking', 'Kargo takibi');

  const copyTracking = () => {
    const n = order?.shipping?.trackingNumber;
    if (!n) return;
    navigator.clipboard
      .writeText(String(n))
      .then(() => {
        notification.showSuccess(t('copied', 'Kopyalandı'), t('tracking_number_copied', 'Takip numarası panoya kopyalandı.'));
      })
      .catch(() => {
        notification.showWarning(t('clipboard', 'Pano'), t('copy_failed_manual', 'Kopyalanamadı — numarayı elle seçin.'));
      });
  };

  const errorMessage = useMemo(() => {
    if (!error) return null;
    return getErrorMessage(error, t('od_load_failed', 'Sipariş detayları yüklenemedi.'));
  }, [error, t]);

  return (
    <div className="min-h-screen bg-background-page pb-16">
      <PageContainer narrow className="space-y-6 pt-8 sm:pt-10">
        <PageHeader
          back={
            <Button variant="ghost" size="sm" onClick={() => navigate(backPath)}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>{t('back_to_orders', 'Siparişlere dön')}</span>
            </Button>
          }
          title={t('shipment_tracking', 'Kargo takibi')}
          subtitle={title}
          badge={
            order?.status ? (
              <Badge variant={getOrderStatusBadgeVariant(order.status)} dot>
                {getOrderStatusLabel(t, enums, order.status)}
              </Badge>
            ) : null
          }
        />

        {isLoading ? (
          <Card className="space-y-4" aria-busy="true" aria-label={t('loading_shipment', 'Kargo bilgileri yükleniyor')}>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ) : null}

        {errorMessage && !isLoading ? (
          <ErrorState
            title={t('od_load_failed', 'Sipariş detayları yüklenemedi')}
            description={errorMessage}
            onRetry={refetch}
          />
        ) : null}

        {order && !isLoading ? (
          <>
            {order.orderItems?.length ? (
              <Card>
                <h2 className="mb-3 text-base font-semibold text-text-primary">{t('items', 'Ürünler')}</h2>
                <ul className="divide-y divide-border-light">
                  {order.orderItems.map((item) => (
                    <li
                      key={item.id ?? `${item.listing?.id}-${item.quantity}`}
                      className="flex justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
                    >
                      <span className="line-clamp-2 font-medium text-text-primary">{item.listing?.title || '—'}</span>
                      <span className="whitespace-nowrap tabular-nums text-text-secondary">
                        {formatCurrency(item.totalPrice, order.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {order.shipping ? (
              <ShippingDetailsSection
                shipping={order.shipping}
                deliveryAddress={order.shippingAddress}
                CardComponent={Panel}
              />
            ) : (
              <EmptyState
                icon={Package}
                title={t('no_shipment_yet', 'Henüz kargo bilgisi yok')}
                description={t('shipping_details_appear_after_the_seller', 'Kargo detayları satıcı ürünü gönderdikten sonra görünür.')}
              />
            )}

            {order.shipping?.trackingNumber ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" size="sm" onClick={copyTracking}>
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                  <span>{t('copy_tracking_number', 'Takip numarasını kopyala')}</span>
                </Button>
              </div>
            ) : null}

            <div className="border-t border-border-light pt-4 text-center">
              <Link to={backPath} className="text-sm font-medium text-text-link hover:text-text-linkHover hover:underline">
                {t('view_full_order', 'Siparişlere dön')}
              </Link>
              {order.updatedAt && (
                <>
                  <span className="mx-2 text-text-tertiary" aria-hidden>·</span>
                  <span className="text-sm tabular-nums text-text-tertiary">
                    {t('last_updated', 'Son güncelleme')}: {formatDateTime(order.updatedAt)}
                  </span>
                </>
              )}
            </div>
          </>
        ) : null}
      </PageContainer>
    </div>
  );
};

export default OrderShipmentPage;

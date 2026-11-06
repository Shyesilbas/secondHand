import { useTranslation } from 'react-i18next';
import { useState, lazy, Suspense } from 'react';
import { useSellerDashboard } from '../hooks/useDashboard.js';
import { usePendingEscrowAmount } from '../../order/hooks/useOrderFlow.js';
import { useSellerToShipCount } from '../../order/hooks/useSellerToShipCount.js';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency } from '../../common/formatters.js';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import MetricCard from '../components/MetricCard.jsx';
import TopListingsTable from '../components/TopListingsTable.jsx';
import RatingDistribution from '../components/RatingDistribution.jsx';
import CategoryBreakdown from '../components/CategoryBreakdown.jsx';
import OrderStatusBreakdown from '../components/OrderStatusBreakdown.jsx';
import ConversionFunnel from '../components/ConversionFunnel.jsx';
import OfferAnalyticsCard from '../components/OfferAnalyticsCard.jsx';
import {
  CardLink, DashboardCard, DashboardError, DashboardShell, DashboardSkeleton
} from '../components/DashboardUi.jsx';
import { DASHBOARD_CURRENCY } from '../dashboardConstants.js';

const RevenueChart = lazy(() => import('../components/RevenueChart.jsx'));

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const SellerDashboardPage = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(() => daysAgo(30));
  const [endDate, setEndDate] = useState(() => new Date());
  const { data: dashboard, isLoading, isError, refetch } = useSellerDashboard(startDate, endDate);
  const { pendingEscrowAmount } = usePendingEscrowAmount();
  const toShipCount = useSellerToShipCount();

  const range = {
    startDate,
    endDate,
    onStartDateChange: setStartDate,
    onEndDateChange: setEndDate,
    onPresetSelect: (start, end) => { setStartDate(start); setEndDate(end); }
  };

  let content;
  if (isLoading) content = <DashboardSkeleton />;
  else if (isError || !dashboard) content = <DashboardError onRetry={refetch} />;
  else {
    const revenueTrend = dashboard.revenueGrowth != null ? parseFloat(dashboard.revenueGrowth) : null;
    content = (
      <>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            title={t('dash_revenue', 'Gelir')}
            value={formatCurrency(dashboard.totalRevenue || 0, DASHBOARD_CURRENCY)}
            trend={revenueTrend}
          />
          <MetricCard
            title={t('dash_sales', 'Satış')}
            value={dashboard.totalOrders || 0}
            subtitle={t('dash_completed_count', { defaultValue: '{{count}} tamamlandı', count: dashboard.completedOrders || 0 })}
          />
          <MetricCard
            title={t('dash_to_ship', 'Kargolanacak')}
            value={toShipCount}
            subtitle={toShipCount > 0 ? t('dash_to_ship_hint', '72 saat içinde kargola') : t('dash_to_ship_none', 'Bekleyen sipariş yok')}
            emphasis={toShipCount > 0}
            to={ROUTES.I_SOLD}
          />
          <MetricCard
            title={t('dash_pending_escrow', 'Emanette bekleyen')}
            value={formatCurrency(pendingEscrowAmount || 0, DASHBOARD_CURRENCY)}
            subtitle={t('dash_pending_escrow_hint', 'Alıcı onayından sonra cüzdana geçer')}
          />
        </div>

        <DashboardCard title={t('dash_revenue_trend', 'Gelir')}>
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <RevenueChart data={dashboard.revenueTrend || []} label={t('dash_revenue', 'Gelir')} />
          </Suspense>
        </DashboardCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardCard title={t('dash_orders_by_status', 'Siparişler')} action={<CardLink to={ROUTES.I_SOLD}>{t('dash_sold_link', 'Sattıklarım')}</CardLink>}>
            <OrderStatusBreakdown data={dashboard.ordersByStatus || {}} />
          </DashboardCard>
          <DashboardCard title={t('dash_revenue_by_category', 'Kategoriye göre gelir')}>
            <CategoryBreakdown data={dashboard.categoryRevenue || {}} label={t('dash_total_revenue', 'Toplam gelir')} />
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {dashboard.funnel && (
            <DashboardCard
              title={t('dash_funnel', 'İlanlardan satışa')}
              description={t('dash_funnel_desc', 'Bu dönemde ilanlarını görenlerin ne kadarı satın aldı.')}
            >
              <ConversionFunnel funnel={dashboard.funnel} />
            </DashboardCard>
          )}
          {dashboard.offerStats && (
            <DashboardCard title={t('dash_offers', 'Teklifler')} action={<CardLink to={ROUTES.OFFERS}>{t('dash_manage_offers', 'Teklifleri yönet')}</CardLink>}>
              <OfferAnalyticsCard offerStats={dashboard.offerStats} />
            </DashboardCard>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DashboardCard title={t('dash_top_listings', 'En çok kazandıran ilanlar')} className="lg:col-span-2">
            <TopListingsTable listings={dashboard.topListings || []} />
          </DashboardCard>
          <DashboardCard title={t('dash_ratings', 'Değerlendirmeler')}>
            <RatingDistribution
              ratingDistribution={dashboard.ratingDistribution || {}}
              averageRating={dashboard.averageRating || 0}
              totalReviews={dashboard.totalReviews || 0}
            />
          </DashboardCard>
        </div>
      </>
    );
  }

  return (
    <DashboardShell
      title={t('dash_seller_title', 'Satış paneli')}
      subtitle={dashboard ? t('dash_seller_subtitle', {
        defaultValue: '{{active}} aktif ilan · {{total}} ilan toplam',
        active: dashboard.activeListings || 0,
        total: dashboard.totalListings || 0
      }) : null}
      range={range}
    >
      {content}
    </DashboardShell>
  );
};

export default SellerDashboardPage;

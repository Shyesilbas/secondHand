import { useTranslation } from 'react-i18next';
import { useState, lazy, Suspense } from 'react';
import { useBuyerDashboard } from '../hooks/useDashboard.js';
import { ROUTES } from '@/common/constants/routes';
import { formatCurrency } from '../../common/formatters.js';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import MetricCard from '../components/MetricCard.jsx';
import CategoryBreakdown from '../components/CategoryBreakdown.jsx';
import OrderStatusBreakdown from '../components/OrderStatusBreakdown.jsx';
import OfferAnalyticsCard from '../components/OfferAnalyticsCard.jsx';
import ActiveDeliveriesTracker from '../components/ActiveDeliveriesTracker.jsx';
import PriceDropWatchlist from '../components/PriceDropWatchlist.jsx';
import {
  CardEmpty, CardLink, DashboardCard, DashboardError, DashboardShell, DashboardSkeleton
} from '../components/DashboardUi.jsx';
import { DASHBOARD_CURRENCY } from '../dashboardConstants.js';

const RevenueChart = lazy(() => import('../components/RevenueChart.jsx'));

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const BuyerDashboardPage = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(() => daysAgo(30));
  const [endDate, setEndDate] = useState(() => new Date());
  const { data: dashboard, isLoading, isError, refetch } = useBuyerDashboard(startDate, endDate);

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
    const deliveries = dashboard.activeDeliveries || [];
    const priceDrops = dashboard.priceDropAlerts || [];
    const spendingTrend = dashboard.spendingGrowth != null ? parseFloat(dashboard.spendingGrowth) : null;

    content = (
      <>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            title={t('dash_spending', 'Harcama')}
            value={formatCurrency(dashboard.totalSpending || 0, DASHBOARD_CURRENCY)}
            trend={spendingTrend}
          />
          <MetricCard
            title={t('dash_orders', 'Sipariş')}
            value={dashboard.totalOrders || 0}
            subtitle={t('dash_completed_count', { defaultValue: '{{count}} tamamlandı', count: dashboard.completedOrders || 0 })}
          />
          <MetricCard
            title={t('dash_avg_order', 'Ortalama sipariş')}
            value={formatCurrency(dashboard.averageOrderValue || 0, DASHBOARD_CURRENCY)}
          />
          <MetricCard
            title={t('dash_on_the_way', 'Yolda')}
            value={deliveries.length}
            subtitle={deliveries.length > 0 ? t('dash_on_the_way_hint', 'Hazırlanan veya kargodaki') : t('dash_on_the_way_none', 'Bekleyen teslimat yok')}
            to={ROUTES.MY_ORDERS}
          />
        </div>

        {deliveries.length > 0 && (
          <DashboardCard title={t('dash_deliveries', 'Yoldaki siparişler')} action={<CardLink to={ROUTES.MY_ORDERS}>{t('dash_my_orders', 'Siparişlerim')}</CardLink>}>
            <ActiveDeliveriesTracker activeDeliveries={deliveries} />
          </DashboardCard>
        )}

        <DashboardCard title={t('dash_spending_trend', 'Harcama')}>
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <RevenueChart data={dashboard.spendingTrend || []} label={t('dash_spending', 'Harcama')} />
          </Suspense>
        </DashboardCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardCard title={t('dash_orders_by_status', 'Siparişler')} action={<CardLink to={ROUTES.MY_ORDERS}>{t('dash_my_orders', 'Siparişlerim')}</CardLink>}>
            <OrderStatusBreakdown data={dashboard.ordersByStatus || {}} />
          </DashboardCard>
          <DashboardCard title={t('dash_spending_by_category', 'Kategoriye göre harcama')}>
            <CategoryBreakdown data={dashboard.categorySpending || {}} label={t('dash_total_spending', 'Toplam harcama')} />
          </DashboardCard>
        </div>

        <DashboardCard title={t('dash_my_offers', 'Tekliflerin')} action={<CardLink to={ROUTES.OFFERS}>{t('dash_view_offers', 'Teklifleri gör')}</CardLink>}>
          {dashboard.offerStats
            ? <OfferAnalyticsCard offerStats={dashboard.offerStats} />
            : <CardEmpty>{t('dash_no_offers', 'Henüz teklif göndermedin.')}</CardEmpty>}
        </DashboardCard>

        {priceDrops.length > 0 && (
          <DashboardCard
            title={t('dash_price_drops', 'Favorilerinde kampanya')}
            description={t('dash_price_drops_desc', 'Favoriye eklediğin ve şu an kampanyada olan ilanlar.')}
            action={<CardLink to={ROUTES.FAVORITES}>{t('dash_favorites', 'Favoriler')}</CardLink>}
          >
            <PriceDropWatchlist priceDrops={priceDrops} />
          </DashboardCard>
        )}
      </>
    );
  }

  return (
    <DashboardShell
      title={t('dash_buyer_title', 'Alışverişlerim')}
      subtitle={t('dash_buyer_subtitle', 'Seçtiğin dönemdeki harcama ve siparişlerin.')}
      range={range}
    >
      {content}
    </DashboardShell>
  );
};

export default BuyerDashboardPage;

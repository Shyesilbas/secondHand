import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useState, lazy, Suspense } from 'react';
import { useBuyerDashboard } from '../hooks/useDashboard.js';
import TimeRangeSelector from '../components/TimeRangeSelector.jsx';
import MetricCard from '../components/MetricCard.jsx';
import QuickStatusSummary from '../components/QuickStatusSummary.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { motion } from 'framer-motion';
const RevenueChart = lazy(() => import('../components/RevenueChart.jsx'));
import CategoryBreakdown from '../components/CategoryBreakdown.jsx';
import OrderStatusBreakdown from '../components/OrderStatusBreakdown.jsx';
import ActiveDeliveriesTracker from '../components/ActiveDeliveriesTracker.jsx';
import PriceDropWatchlist from '../components/PriceDropWatchlist.jsx';
import { DollarSign, ShoppingBag, TrendingUp, Heart, Sparkles, Tag, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/common/constants/routes';

const ChartCard = ({
  children,
  title,
  action,
  delay = 0
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-background-primary rounded border border-border p-5"
  >
    {title && (
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-text-primary">{title}</h3>
        {action}
      </div>
    )}
    {children}
  </motion.div>
);

const BuyerDashboardPage = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const {
    data: dashboard,
    isLoading,
    error
  } = useBuyerDashboard(startDate, endDate);

  const handlePresetSelect = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background-secondary flex items-center justify-center p-4"
      >
        <div className="text-center p-8 bg-background-primary rounded border border-border max-w-sm">
          <ShoppingBag className="mx-auto mb-4 block h-5 w-5 shrink-0 text-status-error-text" strokeWidth={1.5} aria-hidden />
          <p className="text-lg font-semibold text-text-primary mb-1">{t("error_loading_dashboard")}</p>
          <p className="text-text-muted text-sm">{error.message}</p>
        </div>
      </motion.div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <div className="bg-background-primary border-b border-border">
        <PageContainer className="py-6 px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-semibold text-text-primary">{t("my_purchases")}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs text-text-muted font-medium">{t("track_your_spending_orders")}</p>
                {dashboard.totalFavorites > 0 && (
                  <>
                    <span className="text-text-muted">·</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-text-muted" />
                      <span className="text-xs text-text-muted font-medium tabular-nums">
                        {dashboard.totalFavorites} {t("favorites_saved")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <TimeRangeSelector
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onPresetSelect={handlePresetSelect}
              />
            </motion.div>
          </div>
        </PageContainer>
      </div>

      {/* Content */}
      <PageContainer className="py-6 px-6 space-y-6">
        {/* Active Deliveries Shipment Tracker */}
        {dashboard.activeDeliveries && dashboard.activeDeliveries.length > 0 && (
          <ActiveDeliveriesTracker activeDeliveries={dashboard.activeDeliveries} />
        )}

        {/* Primary KPIs — 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            index={0}
            title={t("total_spending")}
            value={formatCurrency(dashboard.totalSpending || 0, 'TRY')}
            icon={DollarSign}
            trend={dashboard.spendingGrowth ? parseFloat(dashboard.spendingGrowth) : null}
            trendLabel="vs previous period"
          />
          <MetricCard
            index={1}
            title={t("orders")}
            value={dashboard.totalOrders || 0}
            icon={ShoppingBag}
            subtitle={`${dashboard.completedOrders || 0} completed`}
          />
          <MetricCard
            index={2}
            title={t("avg_order_value")}
            value={formatCurrency(dashboard.averageOrderValue || 0, 'TRY')}
            icon={TrendingUp}
            subtitle="Per order"
          />
          <MetricCard
            index={3}
            title={t("smart_savings", "Akıllı Tasarruf")}
            value={formatCurrency(dashboard.totalSavings || 0, 'TRY')}
            icon={Sparkles}
            subtitle="İndirim & İkinci El Kazancı"
          />
        </div>

        {/* Outgoing Offers & Quick Actions Hub */}
        {dashboard.offerStats && (
          <div className="bg-background-primary rounded border border-border p-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
              <div>
                <h4 className="text-xs font-semibold text-text-primary">{t("my_sent_offers", "Yaptığınız Pazarlık Teklifleri")}</h4>
                <p className="text-xs text-text-tertiary mt-0.5">
                  <span className="tabular-nums">{dashboard.offerStats.totalOffersSent || 0}</span> teklif gönderildi · <span className="font-semibold text-status-warning-text tabular-nums">{dashboard.offerStats.pendingOffers || 0} bekliyor</span> · <span className="font-semibold text-status-success-text tabular-nums">{dashboard.offerStats.acceptedOffers || 0} kabul edildi</span>
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.OFFERS}
              className="inline-flex items-center justify-center gap-1.5 rounded text-xs font-medium transition-colors bg-primary text-white hover:bg-primary-hover h-8 px-3"
            >
              <span>{t("view_my_offers", "Tekliflerimi Gör")}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Price Drops Watchlist */}
        {dashboard.priceDropAlerts && dashboard.priceDropAlerts.length > 0 && (
          <PriceDropWatchlist priceDrops={dashboard.priceDropAlerts} />
        )}

        {/* Quick Status Summary */}
        <QuickStatusSummary ordersByStatus={dashboard.ordersByStatus || {}} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="animate-pulse h-80 bg-background-primary rounded border border-border" />}>
            <ChartCard title={t("spending_trend")} delay={0.2}>
              <RevenueChart data={dashboard.spendingTrend || []} title={t("spending_trend")} label={t("spending")} />
            </ChartCard>
          </Suspense>
          <ChartCard title={t("spending_by_category")} delay={0.25}>
            <CategoryBreakdown data={dashboard.categorySpending || {}} label={t("total_spending")} />
          </ChartCard>
        </div>

        {/* Order Status Breakdown & Quick Access */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title={t("orders_by_status")}
            action={
              <Link
                to={ROUTES.MY_ORDERS}
                className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
              >
                <span>{t("my_orders")}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            }
            delay={0.3}
          >
            <OrderStatusBreakdown data={dashboard.ordersByStatus || {}} />
          </ChartCard>

          <ChartCard title={t("buyer_protection", "Güvenli Alışveriş & Destek")} delay={0.35}>
            <div className="space-y-4">
              <div className="rounded border border-border-light bg-background-secondary p-3.5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-text-primary mt-0.5" strokeWidth={1.5} />
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary">
                      {t("escrow_protection", "Havuz Hesap Güvencesi")}
                    </h4>
                    <p className="text-xs text-text-tertiary mt-0.5 leading-relaxed">
                      {t("escrow_desc", "Ödemeleriniz ürün elinize ulaşıp siz onaylayana kadar güvendedir.")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to={ROUTES.MY_ORDERS}
                  className="flex items-center justify-between p-3 rounded bg-background-secondary hover:bg-background-tertiary border border-border-light text-xs font-medium text-text-primary transition-colors"
                >
                  <span>{t("all_orders", "Tüm Siparişlerim")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
                </Link>
                <Link
                  to={ROUTES.FAVORITES}
                  className="flex items-center justify-between p-3 rounded bg-background-secondary hover:bg-background-tertiary border border-border-light text-xs font-medium text-text-primary transition-colors"
                >
                  <span>{t("favorites", "Favorilerim")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
                </Link>
                <Link
                  to={ROUTES.INBOX}
                  className="flex items-center justify-between p-3 rounded bg-background-secondary hover:bg-background-tertiary border border-border-light text-xs font-medium text-text-primary transition-colors"
                >
                  <span>{t("inbox", "Mesajlarım")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
                </Link>
                <Link
                  to={ROUTES.OFFERS}
                  className="flex items-center justify-between p-3 rounded bg-background-secondary hover:bg-background-tertiary border border-border-light text-xs font-medium text-text-primary transition-colors"
                >
                  <span>{t("offers", "Tekliflerim")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
                </Link>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Spacer */}
        <div className="pb-8" />
      </PageContainer>
    </div>
  );
};

export default BuyerDashboardPage;
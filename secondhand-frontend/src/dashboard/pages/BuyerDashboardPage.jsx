import { useTranslation } from "react-i18next";
import React, { useState, lazy, Suspense } from 'react';
import { useBuyerDashboard } from '../hooks/useDashboard.js';
import TimeRangeSelector from '../components/TimeRangeSelector.jsx';
import MetricCard from '../components/MetricCard.jsx';
import QuickStatusSummary from '../components/QuickStatusSummary.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { motion } from 'framer-motion';
const RevenueChart = lazy(() => import('../components/RevenueChart.jsx'));
import CategoryBreakdown from '../components/CategoryBreakdown.jsx';
import OrderStatusBreakdown from '../components/OrderStatusBreakdown.jsx';
import { DollarSign, ShoppingBag, TrendingUp, Heart, Tag } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
const ChartCard = ({
  children,
  title,
  delay = 0
}) => <motion.div initial={{
  opacity: 0,
  y: 16
}} animate={{
  opacity: 1,
  y: 0
}} transition={{
  delay,
  duration: 0.4
}} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
    {title && <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>}
    {children}
  </motion.div>;
const BuyerDashboardPage = () => {
  const {
    t
  } = useTranslation();
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
    return <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <LoadingIndicator />
      </div>;
  }
  if (error) {
    return <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <p className="text-lg font-bold text-slate-900 mb-1">{t("error_loading_dashboard")}</p>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </motion.div>;
  }
  if (!dashboard) return null;
  return <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <motion.div initial={{
            opacity: 0,
            x: -16
          }} animate={{
            opacity: 1,
            x: 0
          }}>
              <h1 className="text-xl font-bold text-white tracking-tight">{t("my_purchases")}</h1>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs text-emerald-300/70 font-medium">{t("track_your_spending_orders")}</p>
                {dashboard.totalFavorites > 0 && <>
                    <span className="text-emerald-800">·</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-pink-400/70" />
                      <span className="text-[11px] text-slate-400 font-medium">{dashboard.totalFavorites}{t("favorites_saved")}</span>
                    </div>
                  </>}
              </div>
            </motion.div>
            <motion.div initial={{
            opacity: 0,
            x: 16
          }} animate={{
            opacity: 1,
            x: 0
          }}>
              <TimeRangeSelector startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onPresetSelect={handlePresetSelect} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Primary KPIs — 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard index={0} title={t("total_spending")} value={formatCurrency(dashboard.totalSpending || 0, 'TRY')} icon={DollarSign} trend={dashboard.spendingGrowth ? parseFloat(dashboard.spendingGrowth) : null} trendLabel="vs previous period" color="blue" />
          <MetricCard index={1} title={t("orders")} value={dashboard.totalOrders || 0} icon={ShoppingBag} subtitle={`${dashboard.completedOrders || 0} completed`} color="green" />
          <MetricCard index={2} title={t("avg_order_value")} value={formatCurrency(dashboard.averageOrderValue || 0, 'TRY')} icon={TrendingUp} subtitle="Per order" color="purple" />
          <MetricCard index={3} title={t("savings")} value={(dashboard.cancelledOrders || 0) + (dashboard.refundedOrders || 0) > 0 ? `${dashboard.cancelledOrders || 0} cancelled · ${dashboard.refundedOrders || 0} refunded` : '—'} icon={Tag} subtitle="Cancels & refunds" color="amber" />
        </div>

        {/* Quick Status Summary */}
        <QuickStatusSummary ordersByStatus={dashboard.ordersByStatus || {}} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="animate-pulse h-80 bg-white rounded-2xl border border-slate-100" />}>
            <ChartCard title={t("spending_trend")} delay={0.2}>
              <RevenueChart data={dashboard.spendingTrend || []} title={t("spending_trend")} label={t("spending")} />
            </ChartCard>
          </Suspense>
          <ChartCard title={t("spending_by_category")} delay={0.25}>
            <CategoryBreakdown data={dashboard.categorySpending || {}} label={t("total_spending")} />
          </ChartCard>
        </div>

        {/* Order Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title={t("orders_by_status")} delay={0.3}>
            <OrderStatusBreakdown data={dashboard.ordersByStatus || {}} />
          </ChartCard>
          
          {/* Optional: Add a placeholder or future feature card here to keep grid balance */}
          <div className="hidden lg:block" />
        </div>

        {/* Spacer */}
        <div className="pb-8" />
      </div>
    </div>;
};
export default BuyerDashboardPage;
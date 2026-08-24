import PageContainer from '@/common/components/layout/PageContainer';
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
import ActiveDeliveriesTracker from '../components/ActiveDeliveriesTracker.jsx';
import PriceDropWatchlist from '../components/PriceDropWatchlist.jsx';
import { DollarSign, ShoppingBag, TrendingUp, Heart, Sparkles, Tag, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/common/constants/routes';
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
}} className="bg-background-primary rounded-2xl border border-border-light p-5 shadow-sm">
 {title && <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider mb-4">{title}</h3>}
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
 return <div className="min-h-screen bg-background-secondary flex items-center justify-center">
 <LoadingIndicator />
 </div>;
 }
 if (error) {
 return <motion.div initial={{
 opacity: 0
 }} animate={{
 opacity: 1
 }} className="min-h-screen bg-background-secondary flex items-center justify-center">
 <div className="text-center p-8 bg-background-primary rounded-2xl border border-border-light shadow-sm max-w-sm">
 <div className="w-14 h-14 bg-status-error-bg text-status-error rounded-xl flex items-center justify-center mx-auto mb-4">
 <ShoppingBag className="w-7 h-7" />
 </div>
 <p className="text-lg font-bold text-text-primary mb-1">{t("error_loading_dashboard")}</p>
 <p className="text-slate-400 text-sm">{error.message}</p>
 </div>
 </motion.div>;
 }
 if (!dashboard) return null;
 return <div className="min-h-screen bg-background-secondary">
 {/* Header */}
 <div className="bg-background-dark border-b border-border-dark">
 <PageContainer className="py-6 px-6">
 <div className="flex items-center justify-between flex-wrap gap-4">
 <motion.div initial={{
 opacity: 0,
 x: -16
 }} animate={{
 opacity: 1,
 x: 0
 }}>
 <h1 className="text-2xl font-semibold text-white tracking-tight">{t("my_purchases")}</h1>
 <div className="flex items-center gap-3 mt-0.5">
 <p className="text-xs text-text-muted font-medium">{t("track_your_spending_orders")}</p>
 {dashboard.totalFavorites > 0 && <>
 <span className="text-text-muted">·</span>
 <div className="flex items-center gap-1">
 <Heart className="w-3 h-3 text-text-muted" />
 <span className="text-caption text-text-muted font-medium">{dashboard.totalFavorites} {t("favorites_saved")}</span>
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
 <MetricCard index={0} title={t("total_spending")} value={formatCurrency(dashboard.totalSpending || 0, 'TRY')} icon={DollarSign} trend={dashboard.spendingGrowth ? parseFloat(dashboard.spendingGrowth) : null} trendLabel="vs previous period" color="blue" />
 <MetricCard index={1} title={t("orders")} value={dashboard.totalOrders || 0} icon={ShoppingBag} subtitle={`${dashboard.completedOrders || 0} completed`} color="green" />
 <MetricCard index={2} title={t("avg_order_value")} value={formatCurrency(dashboard.averageOrderValue || 0, 'TRY')} icon={TrendingUp} subtitle="Per order" color="purple" />
 <MetricCard index={3} title={t("smart_savings", "Akıllı Tasarruf")} value={formatCurrency(dashboard.totalSavings || 0, 'TRY')} icon={Sparkles} subtitle="İndirim & İkinci El Kazancı" color="amber" />
 </div>

 {/* Outgoing Offers & Quick Actions Hub */}
 {dashboard.offerStats && (
   <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
     <div className="flex items-center gap-3">
       <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-200">
         <Tag className="w-5 h-5" />
       </div>
       <div>
         <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t("my_sent_offers", "Yaptığınız Pazarlık Teklifleri")}</h4>
         <p className="text-xs text-slate-500 mt-0.5">
           {dashboard.offerStats.totalOffersSent || 0} teklif gönderildi · <span className="font-bold text-amber-600">{dashboard.offerStats.pendingOffers || 0} bekliyor</span> · <span className="font-bold text-emerald-600">{dashboard.offerStats.acceptedOffers || 0} kabul edildi</span>
         </p>
       </div>
     </div>
     <Link
       to={ROUTES.OFFERS}
       className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
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
 <Suspense fallback={<div className="animate-pulse h-80 bg-background-primary rounded-2xl border border-border-light" />}>
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
 </div>

 {/* Spacer */}
 <div className="pb-8" />
 </PageContainer>
 </div>;
};
export default BuyerDashboardPage;
import React, { useState, lazy, Suspense, useMemo } from 'react';
import { useSellerDashboard } from '../hooks/useDashboard.js';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../order/services/orderService.js';
import TimeRangeSelector from '../components/TimeRangeSelector.jsx';
import MetricCard from '../components/MetricCard.jsx';
import TopListingsTable from '../components/TopListingsTable.jsx';
import RatingDistribution from '../components/RatingDistribution.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { motion } from 'framer-motion';

const RevenueChart = lazy(() => import('../components/RevenueChart.jsx'));
import CategoryBreakdown from '../components/CategoryBreakdown.jsx';
import OrderStatusBreakdown from '../components/OrderStatusBreakdown.jsx';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Star, 
  Percent,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';

const ChartCard = ({ children, title, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
  >
    {title && (
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>
    )}
    {children}
  </motion.div>
);

const SellerDashboardPage = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  const { data: dashboard, isLoading, error } = useSellerDashboard(startDate, endDate);

  const { data: escrowData } = useQuery({
    queryKey: ['pendingEscrow'],
    queryFn: () => orderService.getPendingEscrowAmount(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handlePresetSelect = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const conversionRate = useMemo(() => {
    if (!dashboard) return null;
    const views = dashboard.totalViews || 0;
    const orders = dashboard.totalOrders || 0;
    if (views === 0) return 0;
    return ((orders / views) * 100).toFixed(1);
  }, [dashboard]);

  const pendingEscrow = escrowData?.amount || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen bg-[#f8f9fb] flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" />
          </div>
          <p className="text-lg font-bold text-slate-900 mb-1">Error loading dashboard</p>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </motion.div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-xl font-bold text-white tracking-tight">Seller Dashboard</h1>
              <p className="text-xs text-indigo-300/70 font-medium mt-0.5">Analytics & insights for your sales</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
              <TimeRangeSelector
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onPresetSelect={handlePresetSelect}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Primary KPIs — 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            index={0}
            title="Revenue"
            value={formatCurrency(dashboard.totalRevenue || 0, 'TRY')}
            icon={DollarSign}
            trend={dashboard.revenueGrowth ? parseFloat(dashboard.revenueGrowth) : null}
            trendLabel="vs previous period"
            color="green"
          />
          <MetricCard
            index={1}
            title="Orders"
            value={dashboard.totalOrders || 0}
            icon={ShoppingBag}
            subtitle={`${dashboard.completedOrders || 0} completed`}
            color="blue"
          />
          <MetricCard
            index={2}
            title="Active Listings"
            value={dashboard.activeListings || 0}
            icon={Package}
            subtitle={`${dashboard.totalListings || 0} total`}
            color="purple"
            badge="Live"
          />
          <MetricCard
            index={3}
            title="Rating"
            value={dashboard.averageRating ? dashboard.averageRating.toFixed(1) + ' ★' : 'N/A'}
            icon={Star}
            subtitle={`${dashboard.totalReviews || 0} reviews`}
            color="amber"
          />
        </div>

        {/* Secondary KPIs — 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            index={4}
            title="Conversion Rate"
            value={conversionRate !== null ? conversionRate + '%' : '—'}
            icon={Percent}
            subtitle={`${dashboard.totalViews || 0} views → ${dashboard.totalOrders || 0} orders`}
            color="cyan"
          />
          <MetricCard
            index={5}
            title="Pending Escrow"
            value={formatCurrency(pendingEscrow, 'TRY')}
            icon={Wallet}
            subtitle="Awaiting order completion"
            color="amber"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div className="animate-pulse h-80 bg-white rounded-2xl border border-slate-100" />}>
            <ChartCard title="Revenue Trend" delay={0.2}>
              <RevenueChart
                data={dashboard.revenueTrend || []}
                title="Revenue Trend"
                label="Revenue"
              />
            </ChartCard>
          </Suspense>
          <ChartCard title="Revenue by Category" delay={0.25}>
            <CategoryBreakdown
              data={dashboard.categoryRevenue || {}}
              label="Total Revenue"
            />
          </ChartCard>
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Orders by Status" delay={0.3}>
            <OrderStatusBreakdown
              data={dashboard.ordersByStatus || {}}
            />
          </ChartCard>
          <ChartCard title="Rating Distribution" delay={0.35}>
            <RatingDistribution
              ratingDistribution={dashboard.ratingDistribution || {}}
              averageRating={dashboard.averageRating || 0}
              totalReviews={dashboard.totalReviews || 0}
            />
          </ChartCard>
        </div>

        {/* Top Listings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-8"
        >
          <TopListingsTable
            listings={dashboard.topListings || []}
            title="Top 10 Listings by Revenue"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;

import React, { useState, lazy, Suspense } from 'react';
import { useBuyerDashboard } from '../hooks/useDashboard.js';
import TimeRangeSelector from '../components/TimeRangeSelector.jsx';
import MetricCard from '../components/MetricCard.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { motion } from 'framer-motion';

const RevenueChart = lazy(() => import('../components/RevenueChart.jsx'));
const CategoryDistributionChart = lazy(() => import('../components/CategoryDistributionChart.jsx'));
const OrderStatusChart = lazy(() => import('../components/OrderStatusChart.jsx'));
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Star, 
  Heart
} from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';

const BuyerDashboardPage = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  const { data: dashboard, isLoading, error } = useBuyerDashboard(startDate, endDate);

  const handlePresetSelect = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50/50 flex items-center justify-center"
      >
        <div className="text-center p-8 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white shadow-xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[20px] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">Error loading dashboard</p>
          <p className="text-gray-500 text-sm font-medium">{error.message}</p>
        </div>
      </motion.div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8f9fa] relative overflow-x-hidden"
    >
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      <div className="bg-white/60 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Buyer Dashboard</h1>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Track your purchases and spending</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <TimeRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onPresetSelect={handlePresetSelect}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            index={0}
            title="Total Spending"
            value={formatCurrency(dashboard.totalSpending || 0, 'TRY')}
            icon={DollarSign}
            trend={dashboard.spendingGrowth ? parseFloat(dashboard.spendingGrowth) : null}
            trendLabel="vs previous period"
            color="blue"
          />
          <MetricCard
            index={1}
            title="Total Orders"
            value={dashboard.totalOrders || 0}
            icon={ShoppingBag}
            subtitle={`${dashboard.completedOrders || 0} completed`}
            color="green"
          />
          <MetricCard
            index={2}
            title="Average Order Value"
            value={formatCurrency(dashboard.averageOrderValue || 0, 'TRY')}
            icon={TrendingUp}
            subtitle="Per order"
            color="purple"
          />
          <MetricCard
            index={3}
            title="Reviews Given"
            value={dashboard.reviewsGiven || 0}
            icon={Star}
            subtitle="To sellers"
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MetricCard
            index={4}
            title="Favorites"
            value={dashboard.totalFavorites || 0}
            icon={Heart}
            subtitle="Saved listings"
            color="pink"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Suspense fallback={<div className="animate-pulse h-80 bg-white/50 backdrop-blur-md rounded-[24px] border border-gray-100" />}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-xl p-6">
              <RevenueChart
                data={dashboard.spendingTrend || []}
                title="Spending Trend"
                label="Spending"
              />
            </motion.div>
          </Suspense>
          <Suspense fallback={<div className="animate-pulse h-80 bg-white/50 backdrop-blur-md rounded-[24px] border border-gray-100" />}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-xl p-6">
              <CategoryDistributionChart
                data={dashboard.categorySpending || {}}
                title="Spending by Category"
              />
            </motion.div>
          </Suspense>
        </div>

        <div className="mb-12">
          <Suspense fallback={<div className="animate-pulse h-80 bg-white/50 backdrop-blur-md rounded-[24px] border border-gray-100" />}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="max-w-2xl bg-white/70 backdrop-blur-xl rounded-[24px] border border-white shadow-xl p-6">
              <OrderStatusChart
                data={dashboard.ordersByStatus || {}}
                title="Orders by Status"
              />
            </motion.div>
          </Suspense>
        </div>
      </div>
    </motion.div>
  );
};

export default BuyerDashboardPage;

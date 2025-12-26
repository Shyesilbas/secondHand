import React, { useState } from 'react';
import { useBuyerDashboard } from '../hooks/useDashboard.js';
import TimeRangeSelector from '../components/TimeRangeSelector.jsx';
import MetricCard from '../components/MetricCard.jsx';
import RevenueChart from '../components/RevenueChart.jsx';
import CategoryDistributionChart from '../components/CategoryDistributionChart.jsx';
import OrderStatusChart from '../components/OrderStatusChart.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Star, 
  Heart,
  MessageSquare
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-gray-500 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Track your purchases and spending</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <TimeRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onPresetSelect={handlePresetSelect}
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Spending"
            value={formatCurrency(dashboard.totalSpending || 0, 'TRY')}
            icon={DollarSign}
            trend={dashboard.spendingGrowth ? parseFloat(dashboard.spendingGrowth) : null}
            trendLabel="vs previous period"
            color="blue"
          />
          <MetricCard
            title="Total Orders"
            value={dashboard.totalOrders || 0}
            icon={ShoppingBag}
            subtitle={`${dashboard.completedOrders || 0} completed`}
            color="green"
          />
          <MetricCard
            title="Average Order Value"
            value={formatCurrency(dashboard.averageOrderValue || 0, 'TRY')}
            icon={TrendingUp}
            subtitle="Per order"
            color="purple"
          />
          <MetricCard
            title="Reviews Given"
            value={dashboard.reviewsGiven || 0}
            icon={Star}
            subtitle="To sellers"
            color="amber"
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <MetricCard
            title="Favorites"
            value={dashboard.totalFavorites || 0}
            icon={Heart}
            subtitle="Saved listings"
            color="pink"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RevenueChart
            data={dashboard.spendingTrend || []}
            title="Spending Trend"
            label="Spending"
          />
          <CategoryDistributionChart
            data={dashboard.categorySpending || {}}
            title="Spending by Category"
          />
        </div>

        {/* Order Status Chart */}
        <div className="mb-6">
          <OrderStatusChart
            data={dashboard.ordersByStatus || {}}
            title="Orders by Status"
          />
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboardPage;


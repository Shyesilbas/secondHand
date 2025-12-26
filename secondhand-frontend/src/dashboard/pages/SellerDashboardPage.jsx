import React, { useState, useEffect } from 'react';
import { useSellerDashboard } from '../hooks/useDashboard.js';
import TimeRangeSelector from '../components/TimeRangeSelector.jsx';
import MetricCard from '../components/MetricCard.jsx';
import RevenueChart from '../components/RevenueChart.jsx';
import CategoryDistributionChart from '../components/CategoryDistributionChart.jsx';
import OrderStatusChart from '../components/OrderStatusChart.jsx';
import TopListingsTable from '../components/TopListingsTable.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Star, 
  Heart,
  Eye
} from 'lucide-react';
import { formatCurrency } from '../../common/formatters.js';

const SellerDashboardPage = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  const { data: dashboard, isLoading, error } = useSellerDashboard(startDate, endDate);

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
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Analytics and insights for your listings and sales</p>
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
            title="Total Revenue"
            value={formatCurrency(dashboard.totalRevenue || 0, 'TRY')}
            icon={DollarSign}
            trend={dashboard.revenueGrowth ? parseFloat(dashboard.revenueGrowth) : null}
            trendLabel="vs previous period"
            color="green"
          />
          <MetricCard
            title="Total Orders"
            value={dashboard.totalOrders || 0}
            icon={ShoppingBag}
            subtitle={`${dashboard.completedOrders || 0} completed`}
            color="blue"
          />
          <MetricCard
            title="Active Listings"
            value={dashboard.activeListings || 0}
            icon={Package}
            subtitle={`${dashboard.totalListings || 0} total`}
            color="purple"
          />
          <MetricCard
            title="Average Rating"
            value={dashboard.averageRating ? dashboard.averageRating.toFixed(1) : 'N/A'}
            icon={Star}
            subtitle={`${dashboard.totalReviews || 0} reviews`}
            color="amber"
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Total Favorites"
            value={dashboard.totalFavorites || 0}
            icon={Heart}
            subtitle="On your listings"
            color="pink"
          />
          <MetricCard
            title="Total Views"
            value={dashboard.totalViews || 0}
            icon={Eye}
            subtitle="Estimated from favorites"
            color="gray"
          />
          <MetricCard
            title="Sold Listings"
            value={dashboard.soldListings || 0}
            icon={TrendingUp}
            subtitle="In this period"
            color="green"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RevenueChart
            data={dashboard.revenueTrend || []}
            title="Revenue Trend"
            label="Revenue"
          />
          <CategoryDistributionChart
            data={dashboard.categoryRevenue || {}}
            title="Revenue by Category"
          />
        </div>

        {/* Order Status and Top Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <OrderStatusChart
            data={dashboard.ordersByStatus || {}}
            title="Orders by Status"
          />
          <TopListingsTable
            listings={dashboard.topListings || []}
            title="Top 10 Listings by Revenue"
          />
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;


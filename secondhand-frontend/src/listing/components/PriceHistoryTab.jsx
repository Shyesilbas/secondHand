import React from 'react';
import PriceStatistics from './PriceStatistics.jsx';
import PriceChart from './PriceChart.jsx';
import PriceHistoryTable from './PriceHistoryTable.jsx';

const PriceHistoryTab = ({ priceHistory, loading, error, currency }) => {
  if (error) {
    return (
      <div className="text-sm text-red-600 mb-3">Failed to load price history</div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">Loading...</div>
    );
  }

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">No price history available</div>
    );
  }

  return (
    <div className="space-y-6">
      <PriceStatistics priceHistory={priceHistory} currency={currency} />
      <PriceChart priceHistory={priceHistory} currency={currency} />
      <PriceHistoryTable priceHistory={priceHistory} />
    </div>
  );
};

export default PriceHistoryTab;

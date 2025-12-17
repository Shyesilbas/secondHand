import React from 'react';
import PriceStatistics from './PriceStatistics.jsx';
import PriceChart from './PriceChart.jsx';
import PriceHistoryTable from './PriceHistoryTable.jsx';
import { Clock, TrendingUp } from 'lucide-react';

const PriceHistoryTab = ({ priceHistory, loading, error, currency }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-red-600 font-medium">Unable to load price history</p>
        <p className="text-gray-500 text-sm mt-1">Please try again later</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Analyzing market data...</p>
      </div>
    );
  }

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-bold text-gray-900">No Price History</h4>
        <p className="text-gray-500 text-sm mt-1 max-w-xs">
          This listing hasn't had any price changes yet. The current price is the initial price.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
        <PriceStatistics priceHistory={priceHistory} currency={currency} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-h-[300px]">
          <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Price Trend
          </h4>
          <div className="h-64">
            <PriceChart priceHistory={priceHistory} currency={currency} />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-bold text-gray-900">Change Log</h4>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <PriceHistoryTable priceHistory={priceHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryTab;

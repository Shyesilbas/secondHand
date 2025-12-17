import React from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { TrendingUp, TrendingDown, Minus, DollarSign, Clock } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, trend }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-xl font-bold text-gray-900 tracking-tight">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-red-50 text-red-600' : trend === 'down' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

const PriceStatistics = ({ priceHistory, currency }) => {
  if (!priceHistory || priceHistory.length === 0) return null;

  const latest = priceHistory[0];
  const oldest = priceHistory[priceHistory.length - 1];
  const base = (oldest.oldPrice != null ? oldest.oldPrice : oldest.newPrice);
  const currentVal = latest.newPrice;
  const currencyCode = latest.currency || currency;
  const diff = (base != null && currentVal != null) ? (currentVal - base) : null;
  const pct = (base && diff != null) ? (diff / base) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Current Price"
        value={formatCurrency(currentVal, currencyCode)}
        icon={DollarSign}
        trend={null}
      />
      
      <StatCard
        title="Initial Price"
        value={formatCurrency(base, currencyCode)}
        subtext="Starting point"
        icon={Clock}
        trend={null}
      />
      
      <StatCard
        title="Total Change"
        value={`${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`}
        subtext={diff != null ? `${diff > 0 ? '+' : ''}${formatCurrency(Math.abs(diff), currencyCode)}` : null}
        icon={pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus}
        trend={pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral'}
      />
    </div>
  );
};

export default PriceStatistics;

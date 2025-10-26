import React from 'react';
import { formatCurrency } from '../../common/formatters.js';

const PriceStatistics = ({ priceHistory, currency }) => {
  if (!priceHistory || priceHistory.length === 0) return null;

  const latest = priceHistory[0];
  const oldest = priceHistory[priceHistory.length - 1];
  const base = (oldest.oldPrice != null ? oldest.oldPrice : oldest.newPrice);
  const currentVal = latest.newPrice;
  const currencyCode = latest.currency || currency;
  const diff = (base != null && currentVal != null) ? (currentVal - base) : null;
  const pct = (base && diff != null) ? (diff / base) * 100 : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm font-medium text-blue-800 mb-1">Current Price</div>
        <div className="text-lg font-semibold text-blue-900">
          {formatCurrency(currentVal, currencyCode)}
        </div>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="text-sm font-medium text-gray-800 mb-1">Initial Price</div>
        <div className="text-lg font-semibold text-gray-900">
          {formatCurrency(base, currencyCode)}
        </div>
      </div>
      
      <div className={`border rounded-lg p-3 ${
        pct > 0 
          ? 'bg-red-50 border-red-200' 
          : pct < 0
          ? 'bg-green-50 border-green-200'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className={`text-sm font-medium mb-1 ${
          pct > 0 ? 'text-red-800' : pct < 0 ? 'text-green-800' : 'text-gray-800'
        }`}>
          Total Change
        </div>
        <div className={`text-lg font-semibold ${
          pct > 0 ? 'text-red-900' : pct < 0 ? 'text-green-900' : 'text-gray-900'
        }`}>
          {pct != null ? `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%` : '—'}
          {diff != null && (
            <div className="text-sm">
              ({diff > 0 ? '+' : ''}{formatCurrency(Math.abs(diff), currencyCode)})
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceStatistics;

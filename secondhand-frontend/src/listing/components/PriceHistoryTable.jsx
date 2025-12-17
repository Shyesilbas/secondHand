import React from 'react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

const PriceHistoryTable = ({ priceHistory }) => {
  if (!priceHistory || priceHistory.length === 0) return null;

  return (
    <table className="min-w-full divide-y divide-gray-100">
      <thead className="bg-gray-50/50 sticky top-0 backdrop-blur-sm">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {priceHistory.map((entry, index) => (
          <tr key={entry.id ?? index} className="group hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-xs text-gray-500 font-medium">
              {formatDateTime(entry.changeDate, 'tr-TR').split(' ')[0]}
            </td>
            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
              {formatCurrency(entry.newPrice, entry.currency)}
            </td>
            <td className="px-4 py-3 text-right">
              {entry.percentageChange ? (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  entry.percentageChange > 0 
                    ? 'bg-red-50 text-red-600' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {entry.percentageChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(entry.percentageChange).toFixed(1)}%
                </span>
              ) : (
                <span className="text-gray-300">
                  <Minus className="w-3 h-3 ml-auto" />
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PriceHistoryTable;

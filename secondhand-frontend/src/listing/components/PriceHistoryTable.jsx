import React from 'react';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';

const PriceHistoryTable = ({ priceHistory }) => {
  if (!priceHistory || priceHistory.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900">Price Changes</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Old Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {priceHistory.map((entry, index) => (
              <tr key={entry.id ?? index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDateTime(entry.changeDate, 'tr-TR')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {entry.oldPrice ? formatCurrency(entry.oldPrice, entry.currency) : '—'}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatCurrency(entry.newPrice, entry.currency)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {entry.percentageChange !== null && entry.percentageChange !== undefined ? (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      entry.percentageChange > 0 
                        ? 'bg-red-100 text-red-800' 
                        : entry.percentageChange < 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.percentageChange > 0 ? '+' : ''}{entry.percentageChange.toFixed(1)}%
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {entry.changeReason || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceHistoryTable;

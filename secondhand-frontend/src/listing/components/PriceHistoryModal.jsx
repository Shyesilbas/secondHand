import React from 'react';
import ReactDOM from 'react-dom';
import { formatCurrency } from '../../common/formatters.js';

const PriceHistoryModal = ({ isOpen, onClose, priceHistory, listingTitle }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPercentage = (percentage) => {
    if (!percentage) return '';
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getChangeColor = (percentage) => {
    if (!percentage) return 'text-gray-500';
    return percentage > 0 ? 'text-red-500' : 'text-green-500';
  };

  const getChangeIcon = (percentage) => {
    if (!percentage) return null;
    if (percentage > 0) {
      return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
      );
    } else {
      return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
      );
    }
  };

  const modalContent = (
      <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
      >
        <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Price History</h3>
            <button
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                onClick={onClose}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-700 truncate">{listingTitle}</h4>
          </div>

          {priceHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No price history available for this listing.</div>
              </div>
          ) : (
              <div className="space-y-4">
                {priceHistory.map((entry, index) => (
                    <div
                        key={entry.id}
                        className={`p-4 rounded-lg border ${
                            index === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(entry.newPrice, entry.currency)} {entry.currency}
                        </span>
                              {entry.oldPrice && (
                                  <>
                                    {getChangeIcon(entry.percentageChange)}
                                    <span className={`text-sm font-medium ${getChangeColor(entry.percentageChange)}`}>
                              {formatPercentage(entry.percentageChange)}
                            </span>
                                  </>
                              )}
                              {index === 0 && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Current
                          </span>
                              )}
                            </div>
                            {entry.oldPrice && (
                                <div className="text-sm text-gray-500 mt-1">
                                  Previous: {formatCurrency(entry.oldPrice, entry.currency)} {entry.currency}
                                </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {formatDate(entry.changeDate)}
                          </div>
                          {entry.changeReason && (
                              <div className="text-xs text-gray-500 mt-1">
                                {entry.changeReason}
                              </div>
                          )}
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default PriceHistoryModal;

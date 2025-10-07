import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import usePriceHistory from '../hooks/usePriceHistory.js';
import { formatCurrency } from '../../common/formatters.js';
import { fetchExchangeRate } from '../services/exchangeService.js';

const ListingInfoModal = ({ isOpen, onClose, listingId, listingTitle, price, currency }) => {
  const [activeTab, setActiveTab] = useState('history');

  const { priceHistory, loading: historyLoading, error: historyError, fetchPriceHistory } = usePriceHistory(listingId);

  const [selected, setSelected] = useState('USD');
  const [rates, setRates] = useState({});
  const [exLoading, setExLoading] = useState(false);
  const [exError, setExError] = useState('');

  const defaultTarget = useMemo(() => (currency === 'USD' ? 'EUR' : 'USD'), [currency]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('history');
    setSelected(defaultTarget);
    setRates({});
    setExError('');
    setExLoading(false);
    fetchPriceHistory();
  }, [isOpen, defaultTarget, fetchPriceHistory]);

  const handleExchangeQuery = useCallback(async () => {
    setExError('');
    setExLoading(true);
    try {
      const data = await fetchExchangeRate(currency, selected, listingId);
      setRates(prev => ({ ...prev, [selected]: data.rate }));
    } catch (e) {
      setExError('Failed to fetch exchange rate');
    } finally {
      setExLoading(false);
    }
  }, [currency, selected, listingId]);

  if (!isOpen) return null;

  const convertedValue = rates[selected] != null ? (price * rates[selected]).toFixed(2) : null;

  const formatPercentage = (percentage) => {
    if (percentage === null || percentage === undefined) return '';
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getChangeColor = (percentage) => {
    if (percentage === null || percentage === undefined) return 'text-gray-500';
    return percentage > 0 ? 'text-red-500' : 'text-green-500';
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded border border-gray-200 p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Listing Info</h3>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-5">
          <h4 className="text-lg font-medium text-gray-700 truncate">{listingTitle}</h4>
          <div className="text-sm text-gray-600 mt-1">{formatCurrency(price, currency)} {currency}</div>
        </div>

        <div className="mb-6">
          <div className="inline-flex rounded border border-gray-200 overflow-hidden bg-gray-50">
            <button
              onClick={() => setActiveTab('history')}
              className={`${activeTab === 'history' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700'} px-3 py-1.5 text-sm transition-colors`}
            >
              Price History
            </button>
            <button
              onClick={() => setActiveTab('exchange')}
              className={`${activeTab === 'exchange' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700'} px-3 py-1.5 text-sm transition-colors`}
            >
              Exchange Rates
            </button>
          </div>
        </div>

        {activeTab === 'history' && (
          <div>
            {priceHistory && priceHistory.length > 0 && (
              (() => {
                const latest = priceHistory[0];
                const oldest = priceHistory[priceHistory.length - 1];
                const base = (oldest.oldPrice != null ? oldest.oldPrice : oldest.newPrice);
                const currentVal = latest.newPrice;
                const currencyCode = latest.currency || currency;
                const diff = (base != null && currentVal != null) ? (currentVal - base) : null;
                const pct = (base && diff != null) ? (diff / base) * 100 : null;
                return (
                  <div className="mb-3 p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-700">Total change since first price</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${pct != null ? getChangeColor(pct) : 'text-gray-500'}`}>
                        {pct != null ? `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%` : '-'}
                      </span>
                      <span className="text-sm text-gray-800">
                        {diff != null ? `${diff > 0 ? '+' : ''}${formatCurrency(Math.abs(diff), currencyCode)}` : '-'}
                      </span>
                    </div>
                  </div>
                );
              })()
            )}
            {historyError && (
              <div className="text-sm text-red-600 mb-3">Failed to load price history</div>
            )}

            {historyLoading ? (
              <div className="text-center py-6 text-gray-500 text-sm">Loading...</div>
            ) : priceHistory.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">No records</div>
            ) : (
              <div className="space-y-4">
                {priceHistory.map((entry, index) => (
                  <div
                    key={entry.id ?? index}
                    className={`p-3 rounded-lg border ${index === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-semibold text-gray-900">
                              {formatCurrency(entry.newPrice, entry.currency)} {entry.currency}
                            </span>
                            {entry.percentageChange !== undefined && entry.percentageChange !== null && (
                              <span className={`text-xs font-medium ${getChangeColor(entry.percentageChange)}`}>
                                {formatPercentage(entry.percentageChange)}
                              </span>
                            )}
                            {index === 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-800 rounded-full">Current</span>
                            )}
                          </div>
                          {entry.oldPrice && (
                            <div className="text-xs text-gray-500 mt-1">
                              Previous: {formatCurrency(entry.oldPrice, entry.currency)} {entry.currency}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">
                          {new Date(entry.changeDate).toLocaleString('tr-TR')}
                        </div>
                        {entry.changeReason && (
                          <div className="text-[11px] text-gray-500 mt-1">{entry.changeReason}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'exchange' && (
          <div className="space-y-3">
            {/* Simple Price Display */}
            <div className="text-center py-2">
              <p className="text-sm text-gray-600">Convert {formatCurrency(price, currency)} {currency}</p>
            </div>

            {/* Minimal Currency Selection */}
            <div className="flex justify-center gap-2">
              {['USD', 'EUR'].map(opt => (
                <button
                  key={opt}
                  onClick={() => { setSelected(opt); setExError(''); }}
                  disabled={currency === opt}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    selected === opt 
                      ? 'bg-gray-900 text-white' 
                      : currency === opt
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Simple Convert Button */}
            <div className="flex justify-center">
              <button
                onClick={handleExchangeQuery}
                disabled={exLoading || currency === selected}
                className="px-4 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {exLoading ? 'Loading...' : 'Convert'}
              </button>
            </div>

            {/* Error */}
            {exError && (
              <div className="text-center">
                <p className="text-xs text-red-600">{exError}</p>
              </div>
            )}

            {/* Simple Result */}
            {convertedValue && (
              <div className="text-center py-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Converted Amount</p>
                <p className="text-lg font-semibold text-gray-900">{convertedValue} {selected}</p>
                <p className="text-xs text-gray-500 mt-1">
                  1 {currency} = {(rates[selected] || 0).toFixed(4)} {selected}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ListingInfoModal;



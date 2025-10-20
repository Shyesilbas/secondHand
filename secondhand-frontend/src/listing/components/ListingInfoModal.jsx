import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import usePriceHistory from '../hooks/usePriceHistory.js';
import { formatCurrency, formatDateTime } from '../../common/formatters.js';
import { fetchExchangeRate } from '../services/exchangeService.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

  const prepareChartData = () => {
    if (!priceHistory || priceHistory.length === 0) return null;

    // Sort by date (oldest first for chart)
    const sortedHistory = [...priceHistory].sort((a, b) => 
      new Date(a.changeDate) - new Date(b.changeDate)
    );

    const labels = sortedHistory.map(item => 
      formatDateTime(item.changeDate, 'tr-TR')
    );

    const prices = sortedHistory.map(item => item.newPrice);

    return {
      labels,
      datasets: [
        {
          label: 'Price',
          data: prices,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#3B82F6',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const item = priceHistory[context.dataIndex];
            const currency = item?.currency || currency;
            return `${formatCurrency(context.parsed.y, currency)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price',
          color: '#6B7280',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            const currencyCode = priceHistory?.[0]?.currency || currency;
            return formatCurrency(value, currencyCode);
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded border border-gray-200 p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
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
            {historyError && (
              <div className="text-sm text-red-600 mb-3">Failed to load price history</div>
            )}

            {historyLoading ? (
              <div className="text-center py-6 text-gray-500 text-sm">Loading...</div>
            ) : priceHistory.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">No price history available</div>
            ) : (
              <div className="space-y-6">
                {/* Statistics */}
                {(() => {
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
                })()}

                {/* Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Price Trend</h4>
                  <div className="h-64">
                    {prepareChartData() && (
                      <Line data={prepareChartData()} options={chartOptions} />
                    )}
                  </div>
                </div>

                {/* Price History Table */}
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



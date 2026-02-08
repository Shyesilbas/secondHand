import React, { useState, useEffect, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import usePriceHistory from '../hooks/usePriceHistory.js';
import { formatCurrency } from '../../common/formatters.js';
import ExchangeRatesTab from './ExchangeRatesTab.jsx';
import ViewStatisticsCard from './ViewStatisticsCard.jsx';
import { X, TrendingUp, RefreshCw, Eye } from 'lucide-react';

const PriceHistoryTab = lazy(() => import('./PriceHistoryTab.jsx'));

const ListingInfoModal = ({ isOpen, onClose, listingId, listingTitle, price, currency, isOwner, viewStats }) => {
  const [activeTab, setActiveTab] = useState('history');
  const { priceHistory, loading: historyLoading, error: historyError, fetchPriceHistory } = usePriceHistory(listingId);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('history');
    fetchPriceHistory();
  }, [isOpen, fetchPriceHistory]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight truncate max-w-md">
                Market Insights
              </h3>
              <p className="text-sm text-gray-500 truncate max-w-md">{listingTitle}</p>
            </div>
          </div>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Current Price</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(price, currency)}
              </p>
            </div>
            
            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex">
              <button
                onClick={() => setActiveTab('history')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeTab === 'history' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <TrendingUp className="w-4 h-4" />
                Price History
              </button>
              <button
                onClick={() => setActiveTab('exchange')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeTab === 'exchange' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <RefreshCw className="w-4 h-4" />
                Currency Converter
              </button>
              {isOwner && (
                <button
                  onClick={() => setActiveTab('views')}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === 'views' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Eye className="w-4 h-4" />
                  Views
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[400px]">
            {activeTab === 'history' && (
              <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-lg" />}>
                <PriceHistoryTab
                  priceHistory={priceHistory}
                  loading={historyLoading}
                  error={historyError}
                  currency={currency}
                />
              </Suspense>
            )}

            {activeTab === 'exchange' && (
              <ExchangeRatesTab
                price={price}
                currency={currency}
                listingId={listingId}
              />
            )}

            {activeTab === 'views' && (
              <div className="animate-fade-in">
                {viewStats ? (
                  <ViewStatisticsCard
                    viewStats={viewStats}
                    periodDays={viewStats?.periodDays || 7}
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                    <div className="mx-auto w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                      <Eye className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">No view statistics available</p>
                    <p className="text-sm text-slate-500 mt-1">We couldn't find view data for this listing.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ListingInfoModal;

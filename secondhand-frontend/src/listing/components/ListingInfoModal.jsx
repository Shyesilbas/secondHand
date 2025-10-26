import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import usePriceHistory from '../hooks/usePriceHistory.js';
import { formatCurrency } from '../../common/formatters.js';
import PriceHistoryTab from './PriceHistoryTab.jsx';
import ExchangeRatesTab from './ExchangeRatesTab.jsx';
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

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('history');
    fetchPriceHistory();
  }, [isOpen, fetchPriceHistory]);

  if (!isOpen) return null;

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
          <PriceHistoryTab
            priceHistory={priceHistory}
            loading={historyLoading}
            error={historyError}
            currency={currency}
          />
        )}

        {activeTab === 'exchange' && (
          <ExchangeRatesTab
            price={price}
            currency={currency}
            listingId={listingId}
          />
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



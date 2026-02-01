import React, { useState, useCallback } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { fetchExchangeRate } from '../services/listingAddonService.js';
import { ArrowRightLeft, RefreshCw, DollarSign, Euro, Globe } from 'lucide-react';

const ExchangeRatesTab = ({ price, currency, listingId }) => {
  const [selected, setSelected] = useState(currency === 'USD' ? 'EUR' : 'USD');
  const [rates, setRates] = useState({});
  const [exLoading, setExLoading] = useState(false);
  const [exError, setExError] = useState('');

  // Auto-fetch on mount/change
  React.useEffect(() => {
    handleExchangeQuery(selected);
  }, [selected]);

  const handleExchangeQuery = useCallback(async (targetCurrency) => {
    if (currency === targetCurrency) return;
    
    setExError('');
    setExLoading(true);
    try {
      const data = await fetchExchangeRate(currency, targetCurrency, listingId);
      setRates(prev => ({ ...prev, [targetCurrency]: data.rate }));
    } catch (e) {
      setExError('Unable to fetch live exchange rates');
    } finally {
      setExLoading(false);
    }
  }, [currency, listingId]);

  const convertedValue = rates[selected] != null ? (price * rates[selected]) : null;

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-full text-indigo-600 mb-2">
          <ArrowRightLeft className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Currency Converter</h3>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          View this listing's price in different currencies with real-time exchange rates.
        </p>
      </div>

      <div className="w-full max-w-md bg-gray-50 rounded-2xl p-6 border border-gray-100">
        {/* Input */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
              {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'TRY' ? '₺' : currency[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Original</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(price, currency)}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative bg-gray-50 px-4">
            <div className="p-2 bg-white rounded-full shadow-sm border border-gray-200">
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${exLoading ? 'animate-spin' : ''}`} />
            </div>
          </div>
        </div>

        {/* Target */}
        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            {['USD', 'EUR', 'TRY'].filter(c => c !== currency).map(curr => (
              <button
                key={curr}
                onClick={() => setSelected(curr)}
                className={`
                  flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
                  ${selected === curr 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {curr}
              </button>
            ))}
          </div>

          <div className="p-6 bg-indigo-600 rounded-xl text-white text-center shadow-lg shadow-indigo-200 transition-all duration-300">
            {exLoading ? (
              <div className="flex items-center justify-center gap-2 h-[72px]">
                <RefreshCw className="w-5 h-5 animate-spin opacity-75" />
                <span className="font-medium">Updating rates...</span>
              </div>
            ) : exError ? (
              <div className="text-red-200 text-sm h-[72px] flex items-center justify-center">{exError}</div>
            ) : (
              <div className="animate-fade-in">
                <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Converted Price</p>
                <p className="text-3xl font-bold tracking-tight">
                  {formatCurrency(convertedValue, selected)}
                </p>
                <p className="text-indigo-200 text-xs mt-2">
                  1 {currency} = {(rates[selected] || 0).toFixed(4)} {selected}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-400">
        * Exchange rates are updated daily and may vary from actual transaction rates.
      </p>
    </div>
  );
};

export default ExchangeRatesTab;

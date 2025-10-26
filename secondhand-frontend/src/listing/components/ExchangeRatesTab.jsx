import React, { useState, useCallback } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { fetchExchangeRate } from '../services/exchangeService.js';

const ExchangeRatesTab = ({ price, currency, listingId }) => {
  const [selected, setSelected] = useState('USD');
  const [rates, setRates] = useState({});
  const [exLoading, setExLoading] = useState(false);
  const [exError, setExError] = useState('');

  const defaultTarget = currency === 'USD' ? 'EUR' : 'USD';

  React.useEffect(() => {
    setSelected(defaultTarget);
    setRates({});
    setExError('');
    setExLoading(false);
  }, [defaultTarget]);

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

  const convertedValue = rates[selected] != null ? (price * rates[selected]).toFixed(2) : null;

  return (
    <div className="space-y-3">
      <div className="text-center py-2">
        <p className="text-sm text-gray-600">Convert {formatCurrency(price, currency)} {currency}</p>
      </div>

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

      <div className="flex justify-center">
        <button
          onClick={handleExchangeQuery}
          disabled={exLoading || currency === selected}
          className="px-4 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exLoading ? 'Loading...' : 'Convert'}
        </button>
      </div>

      {exError && (
        <div className="text-center">
          <p className="text-xs text-red-600">{exError}</p>
        </div>
      )}

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
  );
};

export default ExchangeRatesTab;

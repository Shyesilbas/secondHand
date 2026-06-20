import { useTranslation } from "react-i18next";
import React, { useState, useCallback } from 'react';
import { formatCurrency } from '../../common/formatters.js';
import { fetchExchangeRate } from '../services/listingAddonService.js';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
const ExchangeRatesTab = ({
  price,
  currency,
  listingId
}) => {
  const {
    t
  } = useTranslation();
  const [selected, setSelected] = useState(currency === 'USD' ? 'EUR' : 'USD');
  const [rates, setRates] = useState({});
  const [exLoading, setExLoading] = useState(false);
  const [exError, setExError] = useState('');

  // Auto-fetch on mount/change
  React.useEffect(() => {
    handleExchangeQuery(selected);
  }, [selected]);
  const handleExchangeQuery = useCallback(async targetCurrency => {
    if (currency === targetCurrency) return;
    setExError('');
    setExLoading(true);
    try {
      const data = await fetchExchangeRate(currency, targetCurrency, listingId);
      setRates(prev => ({
        ...prev,
        [targetCurrency]: data.rate
      }));
    } catch (e) {
      setExError('Unable to fetch live exchange rates');
    } finally {
      setExLoading(false);
    }
  }, [currency, listingId]);
  const convertedValue = rates[selected] != null ? price * rates[selected] : null;
  return <div className="flex flex-col items-center justify-center py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-full text-primary mb-2">
          <ArrowRightLeft className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-text-primary">{t("currency_converter")}</h3>
        <p className="text-text-muted text-sm max-w-xs mx-auto">{t("view_this_listing_s_price_in_different_c")}</p>
      </div>

      <div className="w-full max-w-md bg-secondary rounded-2xl p-6 border border-gray-100">
        {/* Input */}
        <div className="flex items-center justify-between mb-6 p-4 bg-background-primary rounded-xl border border-border-light shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tertiary rounded-full flex items-center justify-center font-bold text-text-secondary">
              {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'TRY' ? '₺' : currency[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t("original")}</p>
              <p className="text-lg font-bold text-text-primary">{formatCurrency(price, currency)}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-light"></div>
          </div>
          <div className="relative bg-secondary px-4">
            <div className="p-2 bg-background-primary rounded-full shadow-sm border border-border-light">
              <RefreshCw className={`w-4 h-4 text-primary ${exLoading ? 'animate-spin' : ''}`} />
            </div>
          </div>
        </div>

        {/* Target */}
        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            {['USD', 'EUR', 'TRY'].filter(c => c !== currency).map(curr => <button key={curr} onClick={() => setSelected(curr)} className={`
                  flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
                  ${selected === curr ? 'bg-primary text-white shadow-md' : 'bg-background-primary border border-border-light text-text-secondary hover:bg-tertiary'}
                `}>
                {curr}
              </button>)}
          </div>

          <div className="p-6 bg-primary rounded-xl text-white text-center shadow-lg shadow-indigo-200 transition-all duration-300">
            {exLoading ? <div className="flex items-center justify-center gap-2 h-[72px]">
                <RefreshCw className="w-5 h-5 animate-spin opacity-75" />
                <span className="font-medium">{t("updating_rates")}</span>
              </div> : exError ? <div className="text-status-error text-sm h-[72px] flex items-center justify-center">{exError}</div> : <div className="animate-fade-in">
                <p className="text-primary text-xs font-medium uppercase tracking-wider mb-1">{t("converted_price")}</p>
                <p className="text-3xl font-bold tracking-tight">
                  {formatCurrency(convertedValue, selected)}
                </p>
                <p className="text-primary text-xs mt-2">
                  1 {currency} = {(rates[selected] || 0).toFixed(4)} {selected}
                </p>
              </div>}
          </div>
        </div>
      </div>
      
      <p className="text-xs text-text-muted">{t("exchange_rates_are_updated_daily_and_may")}</p>
    </div>;
};
export default ExchangeRatesTab;
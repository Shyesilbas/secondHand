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
  return (
    <div className="space-y-4 py-2 animate-fade-in">
      {/* Target Selector */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("select_target_currency")}</span>
        <div className="flex gap-1 bg-background-secondary border border-border-light rounded-lg p-0.5">
          {['USD', 'EUR', 'TRY'].filter(c => c !== currency).map(curr => (
            <button
              key={curr}
              onClick={() => setSelected(curr)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                selected === curr
                  ? 'bg-background-primary text-text-primary shadow-sm border border-border-light/40 font-extrabold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Original vs Converted */}
      <div className="grid sm:grid-cols-2 gap-3.5">
        {/* Original */}
        <div className="p-4 bg-background-secondary border border-border-light rounded-xl flex flex-col justify-center min-h-[96px]">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">{t("original_price")}</p>
          <p className="text-lg font-extrabold text-text-primary tracking-tight">{formatCurrency(price, currency)}</p>
          <p className="text-[10px] text-text-muted mt-1.5 font-semibold">1.00 {currency}</p>
        </div>

        {/* Converted */}
        <div className="p-4 bg-primary-light border border-primary/20 rounded-xl flex flex-col justify-center min-h-[96px]">
          {exLoading ? (
            <div className="flex items-center justify-center gap-2 py-3 text-primary">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold">{t("updating_rates")}</span>
            </div>
          ) : exError ? (
            <div className="text-status-error-text text-xs text-center font-bold py-3">{exError}</div>
          ) : (
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{t("converted_equivalent")}</p>
              <p className="text-xl font-extrabold text-primary tracking-tight">
                {formatCurrency(convertedValue, selected)}
              </p>
              <p className="text-[10px] text-primary/80 mt-1.5 font-semibold">
                1 {currency} = {(rates[selected] || 0).toFixed(4)} {selected}
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-text-muted text-center pt-2">{t("exchange_rates_are_updated_daily_and_may")}</p>
    </div>
  );
};
export default ExchangeRatesTab;
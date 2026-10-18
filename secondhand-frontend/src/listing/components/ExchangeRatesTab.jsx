import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '../../common/formatters.js';
import { fetchExchangeRate } from '../services/listingAddonService.js';
import { Button, Skeleton } from '../../common/components/ui/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const ExchangeRatesTab = ({
 price,
 currency
}) => {
 const {
 t
 } = useTranslation();
 const [selected, setSelected] = useState(currency === 'USD' ? 'EUR' : 'USD');
 const { data, isLoading, isError, refetch } = useQuery({
 queryKey: ['exchangeRate', currency, selected],
 queryFn: () => fetchExchangeRate(currency, selected),
 enabled: currency !== selected,
 staleTime: DAY_MS
 });
 const rate = data?.rate;
 const convertedValue = rate != null ? price * rate : null;
 return (
 <div className="space-y-4 py-2">
 <div className="flex items-center justify-between gap-3">
 <span className="text-sm text-text-secondary">{t("select_target_currency")}</span>
 <div className="flex gap-1 rounded border border-border bg-background-secondary p-0.5" role="group">
 {['USD', 'EUR', 'TRY'].filter(c => c !== currency).map(curr => (
 <button
 key={curr}
 type="button"
 aria-pressed={selected === curr}
 onClick={() => setSelected(curr)}
 className={`rounded-sm px-3 py-1 text-xs transition-colors ${
 selected === curr ? 'bg-background-primary font-medium text-text-primary' : 'text-text-secondary hover:text-text-primary'
 }`}
 >
 {curr}
 </button>
 ))}
 </div>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <div className="flex min-h-24 flex-col justify-center rounded border border-border bg-background-primary p-4">
 <p className="text-sm text-text-secondary">{t("original_price")}</p>
 <p className="mt-1 text-lg font-semibold tabular-nums text-text-primary">{formatCurrency(price, currency)}</p>
 </div>

 <div className="flex min-h-24 flex-col justify-center rounded border border-border bg-background-primary p-4">
 {isLoading ? (
 <div className="space-y-2" aria-busy="true" aria-label={t("updating_rates")}>
 <Skeleton className="h-4 w-24" />
 <Skeleton className="h-6 w-32" />
 </div>
 ) : isError ? (
 <div role="alert" className="flex items-center justify-between gap-3">
 <p className="text-sm text-status-error-text">Unable to fetch live exchange rates</p>
 <Button variant="secondary" size="sm" onClick={() => refetch()}>{t("try_again")}</Button>
 </div>
 ) : (
 <div>
 <p className="text-sm text-text-secondary">{t("converted_equivalent")}</p>
 <p className="mt-1 text-lg font-semibold tabular-nums text-text-primary">{formatCurrency(convertedValue, selected)}</p>
 <p className="mt-1 text-xs tabular-nums text-text-tertiary">
 1 {currency} = {(rate || 0).toFixed(4)} {selected}
 </p>
 </div>
 )}
 </div>
 </div>

 <p className="text-xs text-text-tertiary">{t("exchange_rates_are_updated_daily_and_may")}</p>
 </div>
 );
};
export default ExchangeRatesTab;

import { Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../common/formatters.js';

export default function AuraPriceAdvisorGauge({
  min,
  max,
  avg,
  current,
  currency = 'TRY',
  status = 'Good Deal'
}) {
  const { t } = useTranslation();
  const currentNum = Number(current);
  const minNum = Number(min);
  const maxNum = Number(max);
  const avgNum = Number(avg);

  if (isNaN(currentNum) || isNaN(minNum) || isNaN(maxNum)) {
    return null;
  }

  // Calculate percentage of current price on the range
  const totalRange = maxNum - minNum;
  const currentPct = totalRange > 0 ? Math.min(Math.max(((currentNum - minNum) / totalRange) * 100, 0), 100) : 50;
  const avgPct = totalRange > 0 ? Math.min(Math.max(((avgNum - minNum) / totalRange) * 100, 0), 100) : 50;

  const formatPrice = (val) => formatCurrency(val, currency, { maximumFractionDigits: 0 });

  const isGoodDeal = status.toLowerCase().includes('good') || status.toLowerCase().includes('iyi') || status.toLowerCase().includes('fırsat');
  const isHigh = status.toLowerCase().includes('high') || status.toLowerCase().includes('yüksek') || status.toLowerCase().includes('pahalı');

  return (
    <div className="my-3 rounded-md border border-border bg-background-secondary p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
          <div>
            <span className="text-xs font-semibold text-text-primary block">
              {t('market_price_evaluation', 'Piyasa Değerlemesi & Fiyat Aralığı')}
            </span>
            <span className="text-xs text-text-tertiary">
              {t('compared_with_similar_listings', 'Benzer ilan verileriyle kıyaslandı')}
            </span>
          </div>
        </div>

        {/* Status: a 6px dot plus text, not a filled pill (DESIGN.md line 55) */}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isGoodDeal
              ? 'bg-status-success'
              : isHigh
                ? 'bg-status-warning'
                : 'bg-text-tertiary'
              }`}
          />
          <span>{status}</span>
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative pt-4 pb-2 px-1">
        {/* Track Bar */}
        <div className="h-2 w-full bg-background-tertiary rounded-full overflow-hidden relative border border-border-light">
          <div
            className="h-full bg-status-success rounded-full opacity-80"
          />
          {/* Indicator Dot on the bar */}
          <div
            className="absolute top-0 bottom-0 w-2.5 -ml-1 bg-primary rounded-full transition-all duration-300"
            style={{ left: `${currentPct}%` }}
          />
        </div>

        {/* Average Marker */}
        {totalRange > 0 && (
          <div
            className="absolute top-0.5 -ml-2.5 flex flex-col items-center pointer-events-none"
            style={{ left: `${avgPct}%` }}
          >
            <div className="w-1 h-2 bg-text-tertiary rounded-sm" />
            <span className="text-xs font-medium text-text-muted mt-2.5 whitespace-nowrap">
              {t('average', 'Ortalama')}
            </span>
          </div>
        )}
      </div>

      {/* Price Labels */}
      <div className="grid grid-cols-3 gap-2 text-xs mt-3 pt-2.5 border-t border-border-light tabular-nums">
        <div>
          <span className="block text-xs text-text-muted">{t('lowest', 'En Düşük')}</span>
          <span className="text-text-secondary font-medium">{formatPrice(minNum)}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs text-text-tertiary">{t('this_listing', 'Bu İlan')}</span>
          <span className="font-semibold tabular-nums text-text-price">{formatPrice(currentNum)}</span>
        </div>
        <div className="text-right">
          <span className="block text-xs text-text-muted">{t('highest', 'En Yüksek')}</span>
          <span className="text-text-secondary font-medium">{formatPrice(maxNum)}</span>
        </div>
      </div>
    </div>
  );
}

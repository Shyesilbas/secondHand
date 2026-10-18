import { Tag, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AuraPriceAdvisorGauge({
  min,
  max,
  avg,
  current,
  currency = 'TRY',
  status = 'Good Deal'
}) {
  const { i18n } = useTranslation();
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

  // Format currencies
  const formatPrice = (val) => {
    return new Intl.NumberFormat(i18n?.language?.startsWith('tr') ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const isGoodDeal = status.toLowerCase().includes('good') || status.toLowerCase().includes('iyi') || status.toLowerCase().includes('fırsat');
  const isHigh = status.toLowerCase().includes('high') || status.toLowerCase().includes('yüksek') || status.toLowerCase().includes('pahalı');

  return (
    <div className="my-3 rounded-md border border-border/90 bg-background-secondary p-4 transition-all">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
          <div>
            <span className="text-xs font-semibold text-text-primary block">
              Piyasa Değerlemesi & Fiyat Aralığı
            </span>
            <span className="text-xs text-text-tertiary">Benzer ilan verileriyle kıyaslandı</span>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          isGoodDeal 
            ? 'bg-background-secondary text-status-success-text border-border' 
            : isHigh 
            ? 'bg-background-secondary text-status-warning-text border-border' 
            : 'bg-background-tertiary text-text-primary border-border'
        }`}>
          {isGoodDeal && <CheckCircle className="w-3 h-3 text-status-success-text" />}
          {isHigh && <AlertTriangle className="w-3 h-3 text-status-warning-text" />}
          {status}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative pt-4 pb-2 px-1">
        {/* Track Bar */}
        <div className="h-2.5 w-full bg-secondary-200/80 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-status-success rounded-full opacity-90"
          />
          {/* Indicator Dot on the bar */}
          <div
            className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-white border-2 border-primary rounded-full shadow-md transition-all duration-300"
            style={{ left: `${currentPct}%` }}
          />
        </div>

        {/* Average Marker */}
        {totalRange > 0 && (
          <div
            className="absolute top-0.5 -ml-2.5 flex flex-col items-center pointer-events-none"
            style={{ left: `${avgPct}%` }}
          >
            <div className="w-1.5 h-2 bg-secondary-400 rounded-xs" />
            <span className="text-xs font-semibold text-text-muted mt-2.5 whitespace-nowrap">
              Ortalama
            </span>
          </div>
        )}
      </div>

      {/* Price Labels */}
      <div className="grid grid-cols-3 gap-2 text-xs font-semibold mt-3 pt-2.5 border-t border-border-light">
        <div>
          <span className="block text-xs text-text-muted font-semibold">En Düşük</span>
          <span className="text-text-secondary font-medium">{formatPrice(minNum)}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs text-text-tertiary font-semibold">Bu İlan</span>
          <span className="font-semibold text-text-primary text-xs">{formatPrice(currentNum)}</span>
        </div>
        <div className="text-right">
          <span className="block text-xs text-text-muted font-semibold">En Yüksek</span>
          <span className="text-text-secondary font-medium">{formatPrice(maxNum)}</span>
        </div>
      </div>
    </div>
  );
}

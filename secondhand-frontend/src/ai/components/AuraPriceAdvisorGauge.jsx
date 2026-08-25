import React from 'react';
import { Tag, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';
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
    <div className="my-3 rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-zinc-50/80 to-white p-4 shadow-sm backdrop-blur-xs transition-all">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-xs">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 block">
              Piyasa Değerlemesi & Fiyat Aralığı
            </span>
            <span className="text-[10px] text-zinc-500">Benzer ilan verileriyle kıyaslandı</span>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
          isGoodDeal 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : isHigh 
            ? 'bg-amber-50 text-amber-700 border-amber-200' 
            : 'bg-zinc-100 text-zinc-800 border-zinc-200'
        }`}>
          {isGoodDeal && <CheckCircle className="w-3 h-3 text-emerald-600" />}
          {isHigh && <AlertTriangle className="w-3 h-3 text-amber-600" />}
          {status}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative pt-4 pb-2 px-1">
        {/* Track Bar */}
        <div className="h-2.5 w-full bg-zinc-200/80 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-zinc-800 to-rose-500 rounded-full opacity-90"
          />
          {/* Indicator Dot on the bar */}
          <div
            className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-white border-2 border-zinc-900 rounded-full shadow-md transition-all duration-300"
            style={{ left: `${currentPct}%` }}
          />
        </div>

        {/* Average Marker */}
        {totalRange > 0 && (
          <div
            className="absolute top-0.5 -ml-2.5 flex flex-col items-center pointer-events-none"
            style={{ left: `${avgPct}%` }}
          >
            <div className="w-1.5 h-2 bg-zinc-400 rounded-xs" />
            <span className="text-[8px] font-semibold text-zinc-400 mt-2.5 whitespace-nowrap">
              Ortalama
            </span>
          </div>
        )}
      </div>

      {/* Price Labels */}
      <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold mt-3 pt-2.5 border-t border-zinc-100">
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold">En Düşük</span>
          <span className="text-zinc-700 font-medium">{formatPrice(minNum)}</span>
        </div>
        <div className="text-center">
          <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Bu İlan</span>
          <span className="font-extrabold text-zinc-950 text-xs">{formatPrice(currentNum)}</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold">En Yüksek</span>
          <span className="text-zinc-700 font-medium">{formatPrice(maxNum)}</span>
        </div>
      </div>
    </div>
  );
}

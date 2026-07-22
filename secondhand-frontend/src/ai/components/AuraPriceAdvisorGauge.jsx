import React from 'react';
import { Tag, TrendingDown, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AuraPriceAdvisorGauge({
  min,
  max,
  avg,
  current,
  currency = 'TRY',
  status = 'Good Deal'
}) {
  const { t, i18n } = useTranslation();
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
    return new Intl.NumberFormat(i18n?.language?.startsWith('tr') ? 'tr-TR' : 'en-US', { style: 'currency', currency }).format(val);
  };

  // Determine colors based on status
  const getStatusConfig = () => {
    const s = status.toLowerCase();
    if (s.includes('good') || s.includes('bargain') || s.includes('ucuz') || s.includes('iyi')) {
      return {
        label: t('good_price', 'İyi Fiyat'),
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        barColor: 'from-emerald-500 to-teal-500',
        glowColor: 'shadow-emerald-500/20',
        icon: <TrendingDown className="w-4.5 h-4.5 text-emerald-400" />
      };
    } else if (s.includes('high') || s.includes('pahalı') || s.includes('yüksek')) {
      return {
        label: t('above_market_price', 'Piyasa Üstü'),
        badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
        barColor: 'from-orange-500 to-rose-500',
        glowColor: 'shadow-rose-500/20',
        icon: <AlertCircle className="w-4.5 h-4.5 text-rose-400" />
      };
    } else {
      return {
        label: t('average_price', 'Ortalama Fiyat'),
        badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        barColor: 'from-teal-500 to-amber-500',
        glowColor: 'shadow-amber-500/20',
        icon: <Tag className="w-4.5 h-4.5 text-amber-400" />
      };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="mt-4 p-5 rounded-2xl border border-border-light bg-background-primary shadow-lg backdrop-blur-md overflow-hidden relative group">
      {/* Glow Effect */}
      <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl group-hover:scale-125 transition-transform duration-500`} />
      
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{t('aura_price_advisor', 'AURA FİYAT DANIŞMANI')}</span>
          <h4 className="text-sm font-extrabold text-text-primary mt-0.5">{t('market_price_evaluation', 'Piyasa Fiyat Değerlendirmesi')}</h4>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wide ${config.badgeClass}`}>
          {config.icon}
          {config.label}
        </span>
      </div>

      <div className="space-y-4">
        {/* Comparison Values */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-background-secondary border border-border-light/50">
            <span className="text-[10px] font-semibold text-text-muted block">{t('current_item_price', 'Mevcut Ürün Fiyatı')}</span>
            <span className="text-base font-black text-text-primary mt-1 block">{formatPrice(currentNum)}</span>
          </div>
          <div className="p-3 rounded-xl bg-background-secondary border border-border-light/50">
            <span className="text-[10px] font-semibold text-text-muted block">{t('average_market_price', 'Ortalama Piyasa Fiyatı')}</span>
            <span className="text-base font-black text-text-primary mt-1 block">{formatPrice(avgNum)}</span>
          </div>
        </div>

        {/* Visual Bar Gauge */}
        <div className="pt-2">
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 relative">
            {/* The Gradient Range Bar */}
            <div className={`absolute top-0 left-0 h-full w-full rounded-full bg-gradient-to-r ${config.barColor} opacity-70`} />
            
            {/* Average Market Marker */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-slate-400 dark:bg-slate-500 rounded-full z-10 cursor-help"
              style={{ left: `${avgPct}%` }}
              title={`${t('average_market_price', 'Piyasa Ortalaması')}: ${formatPrice(avgNum)}`}
            />

            {/* Current Price Selector Pin */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -ml-2.5 w-5 h-5 rounded-full bg-background-primary border-4 border-primary shadow-md flex items-center justify-center transition-all duration-500 ease-out z-20"
              style={{ left: `${currentPct}%` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            </div>
          </div>
          
          {/* Label Ranges */}
          <div className="flex justify-between items-center text-[10px] font-extrabold text-text-muted mt-2 px-0.5">
            <span>Min: {formatPrice(minNum)}</span>
            <span className="text-slate-400 dark:text-slate-500">{t('average', 'Ortalama')}: {formatPrice(avgNum)}</span>
            <span>Max: {formatPrice(maxNum)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, trend, trendLabel, subtitle, color = 'blue' }) => {
  const iconColorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-rose-50 text-rose-600',
    gray: 'bg-gray-50 text-gray-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      }
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-3 h-3" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return 'text-emerald-600';
    if (trend < 0) return 'text-rose-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200/60 p-5 hover:border-gray-300/60 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            {Icon && (
              <div className={`p-1.5 rounded-md ${iconColorClasses[color] || iconColorClasses.blue}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl font-semibold text-gray-900 tracking-tight">{formatValue(value)}</span>
            {trend !== undefined && trend !== null && (
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-[10px] font-semibold">
                  {Math.abs(trend).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-gray-500 font-medium">{subtitle}</p>
          )}
          {trendLabel && (
            <p className="text-[10px] text-gray-400 font-medium mt-1">{trendLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;


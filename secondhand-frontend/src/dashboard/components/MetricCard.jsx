import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, trend, trendLabel, subtitle, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
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
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {Icon && (
              <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <span className="text-xs font-medium text-gray-600">{title}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{formatValue(value)}</span>
            {trend !== undefined && trend !== null && (
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-xs font-medium">
                  {Math.abs(trend).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trendLabel && (
            <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;


import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, trend, trendLabel, subtitle, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-primary-50 text-primary-600',
    green: 'bg-status-success-bg text-status-success-text',
    purple: 'bg-accent-indigo-50 text-accent-indigo-600',
    amber: 'bg-status-warning-bg text-status-warning-text',
    red: 'bg-status-error-bg text-status-error-text',
    gray: 'bg-secondary-50 text-text-secondary',
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
    if (trend > 0) return 'text-status-success-text';
    if (trend < 0) return 'text-status-error-text';
    return 'text-text-tertiary';
  };

  return (
    <div className="bg-background-primary rounded-lg border border-border-light p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {Icon && (
              <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <span className="text-xs font-medium text-text-secondary">{title}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">{formatValue(value)}</span>
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
            <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
          )}
          {trendLabel && (
            <p className="text-xs text-text-muted mt-1">{trendLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;


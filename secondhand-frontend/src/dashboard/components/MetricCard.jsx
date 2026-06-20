import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, trend, trendLabel, subtitle, color = 'blue', index = 0, badge }) => {
  const iconColorClasses = {
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    purple: 'bg-indigo-500/10 text-indigo-600',
    amber: 'bg-amber-500/10 text-amber-600',
    red: 'bg-rose-500/10 text-rose-600',
    gray: 'bg-slate-500/10 text-slate-600',
    pink: 'bg-pink-500/10 text-pink-600',
    cyan: 'bg-cyan-500/10 text-cyan-600',
  };

  const accentBorder = {
    blue: 'border-l-blue-500',
    green: 'border-l-emerald-500',
    purple: 'border-l-indigo-500',
    amber: 'border-l-amber-500',
    red: 'border-l-rose-500',
    gray: 'border-l-slate-500',
    pink: 'border-l-pink-500',
    cyan: 'border-l-cyan-500',
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
      if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
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
    if (trend > 0) return 'text-emerald-600 bg-emerald-500/10';
    if (trend < 0) return 'text-rose-600 bg-rose-500/10';
    return 'text-slate-500 bg-slate-500/10';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className={`relative bg-white rounded-2xl border border-slate-100 border-l-[3px] ${accentBorder[color] || accentBorder.blue} p-5 shadow-sm hover:shadow-md transition-shadow duration-300 group`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`p-2 rounded-xl ${iconColorClasses[color] || iconColorClasses.blue}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-caption font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        </div>
        {badge && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200/50">
            {badge}
          </span>
        )}
      </div>
      
      <div>
        <div className="flex items-end gap-2.5 mb-1">
          <span className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{formatValue(value)}</span>
          {trend !== undefined && trend !== null && (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${getTrendColor()} font-bold`}>
              {getTrendIcon()}
              <span className="text-caption">
                {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        
        {(subtitle || trendLabel) && (
          <div className="flex flex-col">
            {subtitle && (
              <p className="text-caption text-slate-500 font-medium">{subtitle}</p>
            )}
            {trendLabel && (
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{trendLabel}</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
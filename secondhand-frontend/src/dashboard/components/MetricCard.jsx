import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, trend, trendLabel, subtitle, color = 'blue', index = 0 }) => {
  const iconColorClasses = {
    blue: 'bg-blue-100/50 text-blue-600 border-blue-200/50',
    green: 'bg-emerald-100/50 text-emerald-600 border-emerald-200/50',
    purple: 'bg-indigo-100/50 text-indigo-600 border-indigo-200/50',
    amber: 'bg-amber-100/50 text-amber-600 border-amber-200/50',
    red: 'bg-rose-100/50 text-rose-600 border-rose-200/50',
    gray: 'bg-gray-100/50 text-gray-600 border-gray-200/50',
    pink: 'bg-pink-100/50 text-pink-600 border-pink-200/50',
  };

  const glowClasses = {
    blue: 'shadow-blue-500/10',
    green: 'shadow-emerald-500/10',
    purple: 'shadow-indigo-500/10',
    amber: 'shadow-amber-500/10',
    red: 'shadow-rose-500/10',
    gray: 'shadow-gray-500/10',
    pink: 'shadow-pink-500/10',
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
    if (trend > 0) return 'text-emerald-600 bg-emerald-50';
    if (trend < 0) return 'text-rose-600 bg-rose-50';
    return 'text-gray-500 bg-gray-50';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      className={`relative bg-white/70 backdrop-blur-xl rounded-[24px] border border-white p-6 shadow-xl ${glowClasses[color] || glowClasses.blue} hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 pointer-events-none" />
      <div className="relative flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2.5 rounded-2xl border ${iconColorClasses[color] || iconColorClasses.blue} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-end gap-3 mb-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">{formatValue(value)}</span>
            {trend !== undefined && trend !== null && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getTrendColor()} font-bold`}>
                {getTrendIcon()}
                <span className="text-[11px]">
                  {Math.abs(trend).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-0.5">
            {subtitle && (
              <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
            )}
            {trendLabel && (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{trendLabel}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
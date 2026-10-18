import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, trend, trendLabel, subtitle, index = 0, badge }) => {
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
 if (trend > 0) return 'text-status-success-text bg-background-secondary';
 if (trend < 0) return 'text-status-error-text bg-status-error/10';
 return 'text-text-tertiary bg-text-muted/10';
 };

 return (
 <motion.div 
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
 className="relative rounded border border-border bg-background-primary p-5"
 >
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2.5">
 {Icon && <Icon className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />}
 <span className="text-xs font-semibold text-text-tertiary">{title}</span>
 </div>
 {badge && (
 <span className="text-xs tabular-nums text-status-success-text">
 {badge}
 </span>
 )}
 </div>
 
 <div>
 <div className="flex items-end gap-2.5 mb-1">
 <span className="text-2xl font-semibold text-text-primary tracking-tight leading-none">{formatValue(value)}</span>
 {trend !== undefined && trend !== null && (
 <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${getTrendColor()} font-semibold`}>
 {getTrendIcon()}
 <span className="text-xs">
 {Math.abs(trend).toFixed(1)}%
 </span>
 </div>
 )}
 </div>
 
 {(subtitle || trendLabel) && (
 <div className="flex flex-col">
 {subtitle && (
 <p className="text-xs text-text-tertiary font-medium">{subtitle}</p>
 )}
 {trendLabel && (
 <p className="text-xs text-text-muted font-semibold mt-0.5">{trendLabel}</p>
 )}
 </div>
 )}
 </div>
 </motion.div>
 );
};

export default MetricCard;
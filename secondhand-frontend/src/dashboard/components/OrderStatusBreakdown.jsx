import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion';
const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-status-warning-bg',
    light: 'bg-status-warning-bg',
    text: 'text-amber-700',
    dot: 'bg-status-warning-bg'
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-primary',
    light: 'bg-blue-50',
    text: 'text-primary',
    dot: 'bg-primary'
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-primary',
    light: 'bg-primary',
    text: 'text-violet-700',
    dot: 'bg-primary'
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-sky-500',
    light: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-400'
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-status-success-bg',
    light: 'bg-status-success-bg',
    text: 'text-emerald-700',
    dot: 'bg-status-success-bg'
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-status-success-bg',
    light: 'bg-status-success-bg',
    text: 'text-status-success-text',
    dot: 'bg-status-success-bg'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-rose-500',
    light: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-400'
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-text-muted',
    light: 'bg-slate-50',
    text: 'text-slate-600',
    dot: 'bg-text-muted'
  }
};
const DISPLAY_ORDER = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
const OrderStatusBreakdown = ({
  data = {}
}) => {
  const {
    t
  } = useTranslation();
  const entries = DISPLAY_ORDER.map(key => ({
    key,
    count: Number(data[key] || 0),
    ...STATUS_CONFIG[key]
  })).filter(e => e.count > 0);
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  if (entries.length === 0 || total === 0) {
    return <div className="flex items-center justify-center h-48">
        <p className="text-slate-400 text-xs font-medium">{t("no_order_data_for_this_period")}</p>
      </div>;
  }
  return <div>
      {/* Segmented bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-5">
        {entries.map((entry, idx) => {
        const pct = entry.count / total * 100;
        return <motion.div key={entry.key} initial={{
          width: 0
        }} animate={{
          width: `${pct}%`
        }} transition={{
          duration: 0.5,
          delay: idx * 0.06,
          ease: 'easeOut'
        }} className={`${entry.color} ${idx === 0 ? 'rounded-l-full' : ''} ${idx === entries.length - 1 ? 'rounded-r-full' : ''}`} title={`${entry.label}: ${entry.count} (${pct.toFixed(1)}%)`} />;
      })}
      </div>

      {/* Legend grid */}
      <div className="grid grid-cols-2 gap-2">
        {entries.map((entry, idx) => {
        const pct = (entry.count / total * 100).toFixed(1);
        return <motion.div key={entry.key} initial={{
          opacity: 0,
          y: 4
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: idx * 0.04 + 0.3
        }} className={`flex items-center justify-between px-3 py-2 rounded-lg ${entry.light} border border-transparent hover:border-border-light transition-colors`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${entry.dot}`} />
                <span className={`text-caption font-semibold ${entry.text}`}>{entry.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-text-primary">{entry.count}</span>
                <span className="text-caption font-medium text-slate-400">{pct}%</span>
              </div>
            </motion.div>;
      })}
      </div>

      {/* Total */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-caption font-bold text-slate-400 uppercase tracking-wider">{t("total_orders")}</span>
        <span className="text-sm font-bold text-text-primary">{total}</span>
      </div>
    </div>;
};
export default OrderStatusBreakdown;
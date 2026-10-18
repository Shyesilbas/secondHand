import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion';
const STATUS_CONFIG = {
 PENDING: {
 label: 'Pending',
 color: 'bg-status-warning',
 light: 'bg-background-secondary',
 text: 'text-status-warning-text',
 dot: 'bg-status-warning'
 },
 CONFIRMED: {
 label: 'Confirmed',
 color: 'bg-primary',
 light: 'bg-background-secondary',
 text: 'text-primary',
 dot: 'bg-primary'
 },
 PROCESSING: {
 label: 'Processing',
 color: 'bg-primary',
 light: 'bg-primary',
 text: 'text-text-primary',
 dot: 'bg-primary'
 },
 SHIPPED: {
 label: 'Shipped',
 color: 'bg-primary',
 light: 'bg-background-secondary',
 text: 'text-text-primary',
 dot: 'bg-secondary-300'
 },
 DELIVERED: {
 label: 'Delivered',
 color: 'bg-status-success',
 light: 'bg-background-secondary',
 text: 'text-text-primary',
 dot: 'bg-status-success'
 },
 COMPLETED: {
 label: 'Completed',
 color: 'bg-status-success',
 light: 'bg-background-secondary',
 text: 'text-status-success-text',
 dot: 'bg-status-success'
 },
 CANCELLED: {
 label: 'Cancelled',
 color: 'bg-status-error',
 light: 'bg-background-secondary',
 text: 'text-status-error-text',
 dot: 'bg-status-error'
 },
 REFUNDED: {
 label: 'Refunded',
 color: 'bg-text-muted',
 light: 'bg-background-secondary',
 text: 'text-text-secondary',
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
 <p className="text-text-muted text-xs font-medium">{t("no_order_data_for_this_period")}</p>
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
 }} className={`flex items-center justify-between px-3 py-2 rounded ${entry.light} border border-transparent hover:border-border-light transition-colors`}>
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${entry.dot}`} />
 <span className={`text-xs font-semibold ${entry.text}`}>{entry.label}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-semibold text-text-primary">{entry.count}</span>
 <span className="text-xs font-medium text-text-muted">{pct}%</span>
 </div>
 </motion.div>;
 })}
 </div>

 {/* Total */}
 <div className="pt-3 mt-3 border-t border-border-light flex items-center justify-between">
 <span className="text-xs font-semibold text-text-muted">{t("total_orders")}</span>
 <span className="text-sm font-semibold text-text-primary">{total}</span>
 </div>
 </div>;
};
export default OrderStatusBreakdown;
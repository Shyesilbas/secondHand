import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion';
import { Clock, Truck, PackageCheck, XCircle } from 'lucide-react';
const statuses = [{
  key: 'pending',
  label: 'Pending',
  icon: Clock,
  color: 'text-status-warning',
  bg: 'bg-status-warning-bg',
  border: 'border-amber-200/50',
  keys: ['PENDING', 'CONFIRMED', 'PROCESSING']
}, {
  key: 'shipped',
  label: 'Shipped',
  icon: Truck,
  color: 'text-sky-600',
  bg: 'bg-sky-50',
  border: 'border-sky-200/50',
  keys: ['SHIPPED']
}, {
  key: 'delivered',
  label: 'Delivered',
  icon: PackageCheck,
  color: 'text-status-success',
  bg: 'bg-status-success-bg',
  border: 'border-emerald-200/50',
  keys: ['DELIVERED', 'COMPLETED']
}, {
  key: 'cancelled',
  label: 'Cancelled',
  icon: XCircle,
  color: 'text-rose-600',
  bg: 'bg-rose-50',
  border: 'border-rose-200/50',
  keys: ['CANCELLED', 'REFUNDED']
}];
const QuickStatusSummary = ({
  ordersByStatus = {}
}) => {
  const {
    t
  } = useTranslation();
  const counts = statuses.map(status => ({
    ...status,
    count: status.keys.reduce((sum, key) => sum + Number(ordersByStatus[key] || 0), 0)
  }));
  const hasData = counts.some(s => s.count > 0);
  if (!hasData) return null;
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay: 0.25
  }} className="bg-background-primary rounded-2xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-caption font-bold text-slate-400 uppercase tracking-wider">{t("order_status")}</span>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2 flex-wrap">
          {counts.map(({
          key,
          label,
          icon: Icon,
          color,
          bg,
          border,
          count
        }) => <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${bg} border ${border} transition-all`}>
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <span className={`text-xs font-bold ${color}`}>{count}</span>
              <span className="text-caption text-slate-500 font-medium">{label}</span>
            </div>)}
        </div>
      </div>
    </motion.div>;
};
export default QuickStatusSummary;
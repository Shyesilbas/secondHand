import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion';
import { Clock, Truck, PackageCheck, XCircle } from 'lucide-react';

const statuses = [
  {
    key: 'pending',
    label: 'Pending',
    icon: Clock,
    color: 'text-status-warning-text',
    bg: 'bg-background-secondary',
    border: 'border-border',
    keys: ['PENDING', 'CONFIRMED', 'PROCESSING']
  },
  {
    key: 'shipped',
    label: 'Shipped',
    icon: Truck,
    color: 'text-text-primary',
    bg: 'bg-background-secondary',
    border: 'border-border',
    keys: ['SHIPPED']
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: PackageCheck,
    color: 'text-status-success-text',
    bg: 'bg-background-secondary',
    border: 'border-border',
    keys: ['DELIVERED', 'COMPLETED']
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-status-error-text',
    bg: 'bg-background-secondary',
    border: 'border-border',
    keys: ['CANCELLED', 'REFUNDED']
  }
];

const QuickStatusSummary = ({ ordersByStatus = {} }) => {
  const { t } = useTranslation();

  const counts = statuses.map((status) => ({
    ...status,
    count: status.keys.reduce((sum, key) => sum + Number(ordersByStatus[key] || 0), 0)
  }));

  const hasData = counts.some((s) => s.count > 0);
  if (!hasData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-background-primary rounded border border-border p-4"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-text-muted">{t("order_status")}</span>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 flex-wrap">
          {counts.map(({ key, label, icon: Icon, color, bg, border, count }) => (
            <div
              key={key}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded ${bg} border ${border} transition-colors`}
            >
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <span className={`text-xs font-semibold tabular-nums ${color}`}>{count}</span>
              <span className="text-xs text-text-tertiary font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default QuickStatusSummary;
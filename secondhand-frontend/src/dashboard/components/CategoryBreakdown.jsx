import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion';
import { formatCurrency } from '../../common/formatters.js';

const CATEGORY_COLORS = {
  VEHICLE: {
    bg: 'bg-primary',
    light: 'bg-background-tertiary',
    text: 'text-text-primary',
    border: 'border-border'
  },
  ELECTRONICS: {
    bg: 'bg-status-success',
    light: 'bg-background-secondary',
    text: 'text-text-primary',
    border: 'border-border'
  },
  REAL_ESTATE: {
    bg: 'bg-status-warning',
    light: 'bg-background-secondary',
    text: 'text-status-warning-text',
    border: 'border-border'
  },
  CLOTHING: {
    bg: 'bg-primary',
    light: 'bg-background-secondary',
    text: 'text-text-primary',
    border: 'border-border'
  },
  BOOKS: {
    bg: 'bg-primary',
    light: 'bg-background-secondary',
    text: 'text-text-primary',
    border: 'border-border'
  },
  SPORTS: {
    bg: 'bg-primary',
    light: 'bg-background-secondary',
    text: 'text-text-primary',
    border: 'border-border'
  }
};

const DEFAULT_COLOR = {
  bg: 'bg-text-muted',
  light: 'bg-background-secondary',
  text: 'text-text-secondary',
  border: 'border-border-light'
};

const formatCategoryName = (key) =>
  key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const CategoryBreakdown = ({
  data = {},
  currency = 'TRY',
  label = 'Total'
}) => {
  const { t } = useTranslation();

  const entries = Object.entries(data)
    .map(([key, value]) => ({
      key,
      value: parseFloat(value || 0)
    }))
    .sort((a, b) => b.value - a.value);

  const total = entries.reduce((sum, e) => sum + e.value, 0);

  if (entries.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-text-muted text-xs font-medium">{t("no_category_data_for_this_period")}</p>
      </div>
    );
  }

  const maxValue = entries[0]?.value || 1;

  return (
    <div className="space-y-3">
      {entries.map((entry, idx) => {
        const pct = ((entry.value / total) * 100).toFixed(1);
        const barPct = (entry.value / maxValue) * 100;
        const colors = CATEGORY_COLORS[entry.key] || DEFAULT_COLOR;

        return (
          <motion.div
            key={entry.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                <span className="text-xs font-semibold text-text-secondary">{formatCategoryName(entry.key)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary tabular-nums">
                  {formatCurrency(entry.value, currency)}
                </span>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded tabular-nums ${colors.light} ${colors.text}`}>
                  {pct}%
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.05 + 0.1,
                  ease: 'easeOut'
                }}
                className={`h-full rounded-full ${colors.bg}`}
              />
            </div>
          </motion.div>
        );
      })}

      {/* Total */}
      <div className="pt-2 mt-2 border-t border-border-light flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted">{label}</span>
        <span className="text-sm font-semibold text-text-primary tabular-nums">
          {formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  );
};

export default CategoryBreakdown;
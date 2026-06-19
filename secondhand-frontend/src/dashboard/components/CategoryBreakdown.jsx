import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion';
import { formatCurrency } from '../../common/formatters.js';
const CATEGORY_COLORS = {
  VEHICLE: {
    bg: 'bg-indigo-500',
    light: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200'
  },
  ELECTRONICS: {
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  REAL_ESTATE: {
    bg: 'bg-amber-500',
    light: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  CLOTHING: {
    bg: 'bg-pink-500',
    light: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200'
  },
  BOOKS: {
    bg: 'bg-sky-500',
    light: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200'
  },
  SPORTS: {
    bg: 'bg-purple-500',
    light: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  }
};
const DEFAULT_COLOR = {
  bg: 'bg-slate-500',
  light: 'bg-slate-50',
  text: 'text-slate-700',
  border: 'border-slate-200'
};
const formatCategoryName = key => key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
const CategoryBreakdown = ({
  data = {},
  currency = 'TRY',
  label = 'Total'
}) => {
  const {
    t
  } = useTranslation();
  const entries = Object.entries(data).map(([key, value]) => ({
    key,
    value: parseFloat(value || 0)
  })).sort((a, b) => b.value - a.value);
  const total = entries.reduce((sum, e) => sum + e.value, 0);
  if (entries.length === 0 || total === 0) {
    return <div className="flex items-center justify-center h-48">
        <p className="text-slate-400 text-xs font-medium">{t("no_category_data_for_this_period")}</p>
      </div>;
  }
  const maxValue = entries[0]?.value || 1;
  return <div className="space-y-3">
      {entries.map((entry, idx) => {
      const pct = (entry.value / total * 100).toFixed(1);
      const barPct = entry.value / maxValue * 100;
      const colors = CATEGORY_COLORS[entry.key] || DEFAULT_COLOR;
      return <motion.div key={entry.key} initial={{
        opacity: 0,
        x: -8
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: idx * 0.05
      }} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
                <span className="text-xs font-semibold text-slate-700">{formatCategoryName(entry.key)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{formatCurrency(entry.value, currency)}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.light} ${colors.text}`}>{pct}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div initial={{
            width: 0
          }} animate={{
            width: `${barPct}%`
          }} transition={{
            duration: 0.5,
            delay: idx * 0.05 + 0.1,
            ease: 'easeOut'
          }} className={`h-full rounded-full ${colors.bg}`} />
            </div>
          </motion.div>;
    })}

      {/* Total */}
      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-extrabold text-slate-900">{formatCurrency(total, currency)}</span>
      </div>
    </div>;
};
export default CategoryBreakdown;
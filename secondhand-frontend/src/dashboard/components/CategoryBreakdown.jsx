import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../common/formatters.js';
import { PREFILTER_CATEGORY_COPY } from '../../listing/config/prefilterCopy.js';
import { CardEmpty } from './DashboardUi.jsx';
import { DASHBOARD_CURRENCY } from '../dashboardConstants.js';

const categoryLabel = (key, t) => {
  if (t) {
    const k = `category_${String(key).toLowerCase()}`;
    const translated = t(k);
    if (translated && translated !== k) return translated;
  }
  return PREFILTER_CATEGORY_COPY[key]?.label || key.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
};

/** Amount per category, largest first, each with a bar relative to the largest. */
const CategoryBreakdown = ({ data = {}, currency = DASHBOARD_CURRENCY, label }) => {
  const { t } = useTranslation();

  const entries = Object.entries(data)
    .map(([key, value]) => ({ key, value: parseFloat(value || 0) }))
    .filter(e => e.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = entries.reduce((sum, e) => sum + e.value, 0);

  if (total === 0) {
    return <CardEmpty>{t('dash_no_category_data', 'Bu dönemde kategori verisi yok.')}</CardEmpty>;
  }

  const maxValue = entries[0].value;

  return (
    <div className="space-y-3">
      {entries.map(entry => (
        <div key={entry.key}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-text-secondary">{categoryLabel(entry.key, t)}</span>
            <span className="shrink-0 tabular-nums text-text-primary">
              {formatCurrency(entry.value, currency)}
              <span className="ml-2 text-xs text-text-tertiary">{`${Math.round((entry.value / total) * 100)}%`}</span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-background-tertiary" aria-hidden>
            <div className="h-full rounded-full bg-primary" style={{ width: `${(entry.value / maxValue) * 100}%` }} />
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between border-t border-border-light pt-3 text-sm">
        <span className="text-text-tertiary">{label || t('dash_total', 'Toplam')}</span>
        <span className="font-semibold tabular-nums text-text-primary">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  );
};

export default CategoryBreakdown;

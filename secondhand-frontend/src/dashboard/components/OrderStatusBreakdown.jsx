import { useTranslation } from 'react-i18next';
import { CardEmpty } from './DashboardUi.jsx';
import { ORDER_STATUS_ROWS } from '../dashboardConstants.js';

/** Orders in the period by status: one stacked bar and a plain list with counts. */
const OrderStatusBreakdown = ({ data = {} }) => {
  const { t } = useTranslation();

  const entries = ORDER_STATUS_ROWS
    .map(row => ({ ...row, count: Number(data[row.key] || 0) }))
    .filter(e => e.count > 0);
  const total = entries.reduce((sum, e) => sum + e.count, 0);

  if (total === 0) {
    return <CardEmpty>{t('dash_no_orders', 'Bu dönemde sipariş yok.')}</CardEmpty>;
  }

  return (
    <div>
      <div className="mb-4 flex h-2 gap-0.5 overflow-hidden rounded-full bg-background-tertiary" aria-hidden>
        {entries.map(entry => (
          <div key={entry.key} className={entry.dot} style={{ width: `${(entry.count / total) * 100}%` }} />
        ))}
      </div>

      <ul className="divide-y divide-border-light">
        {entries.map(entry => (
          <li key={entry.key} className="flex items-center justify-between py-2 text-sm">
            <span className="flex items-center gap-2 text-text-secondary">
              <span className={`h-1.5 w-1.5 rounded-full ${entry.dot}`} aria-hidden />
              {t(`dash_status_${entry.key.toLowerCase()}`, entry.label)}
            </span>
            <span className="tabular-nums text-text-primary">
              {entry.count}
              <span className="ml-2 text-xs text-text-tertiary">{`${Math.round((entry.count / total) * 100)}%`}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-between border-t border-border-light pt-3 text-sm">
        <span className="text-text-tertiary">{t('dash_total', 'Toplam')}</span>
        <span className="font-semibold tabular-nums text-text-primary">{total}</span>
      </div>
    </div>
  );
};

export default OrderStatusBreakdown;

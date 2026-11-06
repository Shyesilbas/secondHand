import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * One KPI: label, value, optional change against the previous period and a short note.
 * With `to` the whole card links to the page where the number can be acted on.
 */
const MetricCard = ({ title, value, trend, subtitle, to, emphasis = false }) => {
  const { t } = useTranslation();
  const hasTrend = trend !== undefined && trend !== null && Number.isFinite(trend) && trend !== 0;
  const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;

  const body = (
    <>
      <p className="text-xs text-text-tertiary">{title}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${emphasis ? 'text-status-warning-text' : 'text-text-primary'}`}>
        {value}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-tertiary">
        {hasTrend && (
          <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${trend > 0 ? 'text-status-success-text' : 'text-status-error-text'}`}>
            <TrendIcon className="h-3 w-3" strokeWidth={2} aria-hidden />
            {`${Math.abs(trend).toFixed(1)}%`}
            <span className="font-normal text-text-tertiary">{t('dash_vs_previous', 'önceki döneme göre')}</span>
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </>
  );

  const base = 'block rounded border bg-background-primary p-5';
  const border = emphasis ? 'border-status-warning-border' : 'border-border';

  return to ? (
    <Link to={to} className={`${base} ${border} transition-colors duration-150 hover:border-border-dark`}>
      {body}
    </Link>
  ) : (
    <div className={`${base} ${border}`}>{body}</div>
  );
};

export default MetricCard;

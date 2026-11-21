import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';

/**
 * One KPI cell inside `MetricGrid`: label, value, optional change against the previous period and a
 * short note. With `to` the cell links to the page where the number can be acted on.
 */
const MetricCard = ({ title, value, trend, subtitle, to, emphasis = false }) => {
  const { t } = useTranslation();
  const hasTrend = trend !== undefined && trend !== null && Number.isFinite(trend) && trend !== 0;
  const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;

  const body = (
    <>
      <p className="flex items-center justify-between gap-2 text-sm text-text-secondary">
        <span className="flex items-center gap-1.5">
          {emphasis && <span className="h-1.5 w-1.5 rounded-full bg-status-warning" aria-hidden />}
          {title}
        </span>
        {to && <ChevronRight className="h-4 w-4 shrink-0 text-text-muted transition-colors duration-150 group-hover:text-text-secondary" strokeWidth={1.5} aria-hidden />}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${emphasis ? 'text-status-warning-text' : 'text-text-primary'}`}>
        {value}
      </p>
      {(hasTrend || subtitle) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-tertiary">
          {hasTrend && (
            <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${trend > 0 ? 'text-status-success-text' : 'text-status-error-text'}`}>
              <TrendIcon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              {`${Math.abs(trend).toFixed(1)}%`}
              <span className="font-normal text-text-tertiary">{t('dash_vs_previous', 'önceki döneme göre')}</span>
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </>
  );

  return to ? (
    <Link
      to={to}
      className="group block bg-background-primary p-5 transition-colors duration-150 hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus"
    >
      {body}
    </Link>
  ) : (
    <div className="bg-background-primary p-5">{body}</div>
  );
};

export default MetricCard;

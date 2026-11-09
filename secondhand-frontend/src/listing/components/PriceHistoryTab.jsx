import { useTranslation } from "react-i18next";
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { formatCurrency, formatCurrencyCompact } from '../../common/formatters.js';
import { Clock, DollarSign, Minus, TrendingDown, TrendingUp, ArrowLeftRight } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { computeHistoryStats, computePercentageChange, formatHistoryDateLabel, getHistoryCurrency, sortPriceHistoryAsc, sortPriceHistoryDesc } from '../utils/priceHistoryUtils.js';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { theme } from '../../common/theme/theme.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const StatItem = ({
  title,
  value,
  subtext,
  icon: Icon
}) => (
  <div className="rounded border border-border-light bg-background-primary p-3.5 hover:border-card-border-hover transition-colors">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-text-tertiary shrink-0" strokeWidth={1.5} />
      <p className="text-xs font-semibold text-text-secondary">{title}</p>
    </div>
    <div className="mt-1.5 min-w-0">
      {typeof value === 'string' || typeof value === 'number' ? (
        <p className="text-base sm:text-lg font-semibold tabular-nums text-text-primary tracking-tight">
          {value}
        </p>
      ) : (
        value
      )}
      {subtext && (
        <p className="text-xs text-text-tertiary mt-1 tabular-nums">
          {subtext}
        </p>
      )}
    </div>
  </div>
);

const PriceHistoryTab = ({
  priceHistory,
  loading,
  error,
  currency
}) => {
  const { t } = useTranslation();
  const stats = useMemo(() => computeHistoryStats(priceHistory || [], currency), [priceHistory, currency]);
  const currencyCode = stats?.currency || currency || 'TRY';
  const historyAsc = useMemo(() => sortPriceHistoryAsc(priceHistory || []), [priceHistory]);

  const chartData = useMemo(() => {
    const labels = [];
    const prices = [];
    const pointsMeta = [];

    const oldest = historyAsc[0];
    if (oldest?.oldPrice != null && Number.isFinite(Number(oldest.oldPrice))) {
      const initialCurrency = getHistoryCurrency(oldest, currencyCode) || currencyCode;
      labels.push(t("initial") || 'Initial');
      prices.push(Number(oldest.oldPrice));
      pointsMeta.push({
        price: Number(oldest.oldPrice),
        currency: initialCurrency,
        label: t("initial_price") || 'Initial Price'
      });
    }

    historyAsc.forEach(item => {
      const entryCurrency = getHistoryCurrency(item, currencyCode) || currencyCode;
      labels.push(formatHistoryDateLabel(item?.changeDate));
      prices.push(Number(item?.newPrice));
      pointsMeta.push({
        price: Number(item?.newPrice),
        currency: entryCurrency,
        label: formatHistoryDateLabel(item?.changeDate),
        item
      });
    });

    return {
      labels,
      pointsMeta,
      datasets: [{
        label: 'Price',
        data: prices,
        borderColor: theme.colors.text.primary,
        backgroundColor: context => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(15, 23, 42, 0.16)');
          gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: theme.colors.background.primary,
        pointBorderColor: theme.colors.text.primary,
        pointBorderWidth: 2,
        fill: true,
        tension: 0.25
      }]
    };
  }, [historyAsc, currencyCode, t]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 650,
      easing: 'easeOutCubic'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: theme.colors.background.secondary,
        bodyColor: theme.colors.background.secondary,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function (context) {
            const meta = chartData.pointsMeta?.[context.dataIndex];
            const entryCurrency = meta?.currency || currencyCode;
            return formatCurrency(context.parsed.y, entryCurrency);
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: theme.colors.text.tertiary,
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.18)',
          borderDash: [6, 6]
        },
        ticks: {
          color: theme.colors.text.tertiary,
          font: {
            size: 10
          },
          maxTicksLimit: 6,
          callback: function (value, index, ticks) {
            if (!ticks || !ticks.length) {
              return formatCurrencyCompact(value, currencyCode);
            }
            const step = ticks.length > 1 ? Math.abs(ticks[1].value - ticks[0].value) : 0;
            let decimals = 1;
            if (value >= 1000000) {
              if (step > 0 && step < 100000) decimals = 2;
            } else if (value >= 1000) {
              if (step > 0 && step < 100) decimals = 2;
            }

            const current = formatCurrencyCompact(value, currencyCode, { maximumFractionDigits: decimals });
            if (index > 0 && ticks[index - 1]) {
              const prev = formatCurrencyCompact(ticks[index - 1].value, currencyCode, { maximumFractionDigits: decimals });
              if (current === prev) return '';
            }
            return current;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }), [currencyCode, chartData]);

  const historyDesc = useMemo(() => sortPriceHistoryDesc(priceHistory || []), [priceHistory]);

  const statItems = useMemo(() => {
    const pct = Number(stats?.pct);
    const diff = Number(stats?.diff);
    const hasPct = Number.isFinite(pct);
    const hasDiff = Number.isFinite(diff);
    const trend = hasPct ? (pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral') : 'neutral';
    const changeIcon = hasPct ? (pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus) : Minus;
    const changeValue = hasPct ? `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%` : '—';
    const changeSubtext = hasDiff
      ? `${diff > 0 ? '+' : diff < 0 ? '-' : ''}${formatCurrency(Math.abs(diff), currencyCode)}`
      : null;

    let rangeValue = '—';
    if (stats?.min != null && stats?.max != null) {
      if (stats.min === stats.max) {
        rangeValue = formatCurrency(stats.min, currencyCode);
      } else {
        rangeValue = (
          <div className="flex flex-col gap-0.5 text-xs sm:text-sm font-semibold tabular-nums text-text-primary tracking-tight">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-text-muted">{t("min") || 'Min'}</span>
              <span className="text-sm font-semibold tabular-nums text-text-primary">{formatCurrency(stats.min, currencyCode)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-text-muted">{t("max") || 'Max'}</span>
              <span className="text-sm font-semibold tabular-nums text-text-primary">{formatCurrency(stats.max, currencyCode)}</span>
            </div>
          </div>
        );
      }
    }

    const rangeSubtext = stats?.changesCount != null
      ? (stats.changesCount === 1 ? t('one_change', '1 change') : t('multiple_changes', '{{count}} changes', { count: stats.changesCount }))
      : null;

    return [{
      title: t('current_price', 'Current Price'),
      value: formatCurrency(stats?.current, currencyCode),
      subtext: null,
      icon: DollarSign,
      trend: 'neutral'
    }, {
      title: t('initial_price', 'Initial Price'),
      value: formatCurrency(stats?.initial, currencyCode),
      subtext: t('starting_point', 'Starting point'),
      icon: Clock,
      trend: 'neutral'
    }, {
      title: t('total_change', 'Total Change'),
      value: changeValue,
      subtext: changeSubtext,
      icon: changeIcon,
      trend
    }, {
      title: t('range', 'Range'),
      value: rangeValue,
      subtext: rangeSubtext,
      icon: ArrowLeftRight,
      trend: 'neutral'
    }];
  }, [currencyCode, stats, t]);

  if (error) {
    return (
      <div className="rounded border border-border-light bg-background-primary p-6 text-center">
        <TrendingUp className="mx-auto mb-3 block h-5 w-5 shrink-0 text-status-error-text" strokeWidth={1.5} aria-hidden />
        <p className="text-sm font-semibold text-text-primary">{t("unable_to_load_price_history")}</p>
        <p className="text-sm text-text-tertiary mt-1">{t("please_try_again_later")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3 rounded border border-border bg-background-primary p-5" aria-busy="true" aria-label={t("analyzing_price_trends")}>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="rounded border border-border-light bg-background-primary p-10 text-center">
        <Clock className="mx-auto mb-3 block h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
        <p className="text-sm font-semibold text-text-primary">{t("no_price_history_yet")}</p>
        <p className="text-sm text-text-tertiary mt-1">{t("this_listing_hasn_t_had_any_price_change")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {statItems.map(s => <StatItem key={s.title} {...s} />)}
      </div>

      <div className="bg-background-primary rounded border border-border-light overflow-hidden">
        <div className="px-4 py-3 border-b border-border-light bg-background-secondary/60">
          <h3 className="text-sm font-medium text-text-primary">{t("price_evolution")}</h3>
        </div>
        <div className="p-4 sm:p-5">
          <div className="h-56">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-background-primary rounded border border-border-light overflow-hidden">
        <div className="px-4 py-3 border-b border-border-light bg-background-secondary/60">
          <h3 className="text-sm font-medium text-text-primary">{t("price_history")}</h3>
        </div>
        <div className="divide-y divide-border-light">
          {historyDesc.map((entry, idx) => {
            const pct = entry?.percentageChange ?? computePercentageChange(entry?.oldPrice, entry?.newPrice);
            const pctValue = Number(pct);
            const hasPct = Number.isFinite(pctValue);
            const isUp = hasPct ? pctValue > 0 : false;
            const isDown = hasPct ? pctValue < 0 : false;
            const entryCurrency = getHistoryCurrency(entry, currencyCode) || currencyCode;
            const badgeClass = isUp
              ? 'bg-background-secondary text-status-error-text border-border'
              : isDown
                ? 'bg-background-secondary text-text-primary border-border'
                : 'bg-background-secondary text-text-secondary border-border-light';
            const dotClass = isUp ? 'bg-status-error' : isDown ? 'bg-status-success' : 'bg-primary';
            return (
              <div key={entry.id ?? idx} className="px-4 py-3 hover:bg-background-secondary/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dotClass} shrink-0`} />
                      <p className="text-sm font-medium text-text-primary truncate">{formatHistoryDateLabel(entry?.changeDate)}</p>
                    </div>
                    {entry?.oldPrice != null && (
                      <p className="text-xs text-text-tertiary mt-1 tabular-nums truncate">
                        {t("previous")}: {formatCurrency(entry?.oldPrice, entryCurrency)}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-text-primary tabular-nums">{formatCurrency(entry?.newPrice, entryCurrency)}</p>
                    <div className="mt-1.5 flex justify-end">
                      {hasPct ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-semibold border ${badgeClass} tabular-nums`}>
                          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : isDown ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          {Math.abs(pctValue).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-semibold border bg-background-secondary text-text-secondary border-border-light">
                          <Minus className="w-3.5 h-3.5" />
                          —
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryTab;

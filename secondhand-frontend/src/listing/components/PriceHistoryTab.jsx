import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { formatCurrency, formatCurrencyCompact } from '../../common/formatters.js';
import { Clock, DollarSign, Minus, TrendingDown, TrendingUp, ArrowLeftRight } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  computeHistoryStats,
  computePercentageChange,
  formatHistoryDateLabel,
  getHistoryCurrency,
  sortPriceHistoryAsc,
  sortPriceHistoryDesc
} from './priceHistoryUtils.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatItem = ({ title, value, subtext, icon: Icon }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-slate-300 transition-colors duration-300">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500 shrink-0" />
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider truncate">{title}</p>
        </div>
        <p className="text-lg font-semibold text-slate-900 mt-1 tracking-tight truncate">{value}</p>
        {subtext && <p className="text-xs text-slate-500 mt-1 truncate">{subtext}</p>}
      </div>
    </div>
  </div>
);

const PriceHistoryTab = ({ priceHistory, loading, error, currency }) => {
  if (error) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <div className="mx-auto w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
          <TrendingUp className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Unable to load price history</p>
        <p className="text-sm text-slate-500 mt-1">Please try again later.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-600 mt-4">Analyzing price trends...</p>
      </div>
    );
  }

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
          <Clock className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-900">No price history yet</p>
        <p className="text-sm text-slate-500 mt-1">This listing hasn't had any price changes.</p>
      </div>
    );
  }

  const stats = useMemo(() => computeHistoryStats(priceHistory, currency), [priceHistory, currency]);
  const currencyCode = stats?.currency || currency || 'TRY';

  const historyAsc = useMemo(() => sortPriceHistoryAsc(priceHistory), [priceHistory]);
  const chartData = useMemo(() => {
    const labels = historyAsc.map((item) => formatHistoryDateLabel(item?.changeDate));
    const prices = historyAsc.map((item) => item?.newPrice);
    return {
      labels,
      datasets: [
        {
          label: 'Price',
          data: prices,
          borderColor: '#4F46E5',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 260);
            gradient.addColorStop(0, 'rgba(79, 70, 229, 0.16)');
            gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#4F46E5',
          pointBorderWidth: 2,
          fill: true,
          tension: 0.25,
        }
      ]
    };
  }, [historyAsc]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 650, easing: 'easeOutCubic' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const item = historyAsc?.[context.dataIndex];
            const entryCurrency = getHistoryCurrency(item, currencyCode) || currencyCode;
            return formatCurrency(context.parsed.y, entryCurrency);
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748B', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.18)', borderDash: [6, 6] },
        ticks: {
          color: '#64748B',
          font: { size: 10 },
          callback: function(value) {
            return formatCurrencyCompact(value, currencyCode);
          }
        }
      }
    },
    interaction: { intersect: false, mode: 'index' }
  }), [currencyCode, historyAsc]);

  const historyDesc = useMemo(() => sortPriceHistoryDesc(priceHistory), [priceHistory]);

  const statItems = useMemo(() => {
    const pct = Number(stats?.pct);
    const diff = Number(stats?.diff);
    const hasPct = Number.isFinite(pct);
    const hasDiff = Number.isFinite(diff);
    const trend = hasPct ? (pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral') : 'neutral';
    const changeIcon = hasPct ? (pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus) : Minus;
    const changeValue = hasPct ? `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%` : '—';
    const changeSubtext = hasDiff ? `${diff > 0 ? '+' : ''}${formatCurrency(Math.abs(diff), currencyCode)}` : null;
    const rangeValue = (stats?.min != null && stats?.max != null) ? `${formatCurrency(stats.min, currencyCode)} – ${formatCurrency(stats.max, currencyCode)}` : '—';
    const rangeSubtext = (stats?.changesCount != null) ? `${stats.changesCount} changes` : null;

    return [
      { title: 'Current Price', value: formatCurrency(stats?.current, currencyCode), subtext: null, icon: DollarSign, trend: 'neutral' },
      { title: 'Initial Price', value: formatCurrency(stats?.initial, currencyCode), subtext: 'Starting point', icon: Clock, trend: 'neutral' },
      { title: 'Total Change', value: changeValue, subtext: changeSubtext, icon: changeIcon, trend },
      { title: 'Range', value: rangeValue, subtext: rangeSubtext, icon: ArrowLeftRight, trend: 'neutral' },
    ];
  }, [currencyCode, stats]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((s) => (
            <StatItem key={s.title} {...s} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h3 className="text-sm font-semibold text-slate-900">Price evolution</h3>
        </div>
        <div className="p-5">
          <div className="h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <h3 className="text-sm font-semibold text-slate-900">Price history</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {historyDesc.map((entry, idx) => {
            const pct = entry?.percentageChange ?? computePercentageChange(entry?.oldPrice, entry?.newPrice);
            const pctValue = Number(pct);
            const hasPct = Number.isFinite(pctValue);
            const isUp = hasPct ? pctValue > 0 : false;
            const isDown = hasPct ? pctValue < 0 : false;
            const entryCurrency = getHistoryCurrency(entry, currencyCode) || currencyCode;
            const badgeClass = isUp ? 'bg-red-50 text-red-700 border-red-100' : isDown ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-700 border-slate-200';
            const dotClass = isUp ? 'bg-red-500' : isDown ? 'bg-emerald-500' : 'bg-indigo-500';

            return (
              <div key={entry.id ?? idx} className="px-5 py-4 hover:bg-slate-50/40 transition-colors duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dotClass} shrink-0`} />
                      <p className="text-sm font-medium text-slate-900 truncate">{formatHistoryDateLabel(entry?.changeDate)}</p>
                    </div>
                    {entry?.oldPrice != null && (
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        Previous: {formatCurrency(entry?.oldPrice, entryCurrency)}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(entry?.newPrice, entryCurrency)}</p>
                    <div className="mt-2 flex justify-end">
                      {hasPct ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badgeClass}`}>
                          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : isDown ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          {Math.abs(pctValue).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-slate-50 text-slate-600 border-slate-200">
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

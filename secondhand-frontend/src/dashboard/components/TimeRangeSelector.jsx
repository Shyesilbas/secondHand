import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const PRESETS = [
  { labelKey: 'dash_preset_7d', fallback: '7 gün', days: 7 },
  { labelKey: 'dash_preset_30d', fallback: '30 gün', days: 30 },
  { labelKey: 'dash_preset_3m', fallback: '3 ay', days: 90 },
  { labelKey: 'dash_preset_6m', fallback: '6 ay', days: 180 },
  { labelKey: 'dash_preset_1y', fallback: '1 yıl', days: 365 },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const toInputValue = (date) => (date ? date.toISOString().split('T')[0] : '');

const dateInputClass = 'h-9 rounded border border-border bg-background-primary px-2.5 text-sm text-text-primary transition-colors hover:border-card-border-hover focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus';

const TimeRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange, onPresetSelect }) => {
  const { t } = useTranslation();

  // The active preset follows the dates, so a hand-picked range shows none selected.
  const activePreset = useMemo(() => {
    if (!startDate || !endDate) return null;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const endNorm = new Date(endDate);
    endNorm.setHours(23, 59, 59, 999);
    if (Math.abs(endNorm - today) > DAY_MS) return null;

    const diffDays = Math.round((endDate - startDate) / DAY_MS);
    return PRESETS.find(p => Math.abs(p.days - diffDays) <= 1)?.days || null;
  }, [startDate, endDate]);

  const handlePresetClick = useCallback((days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onPresetSelect(start, end);
  }, [onPresetSelect]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded border border-border bg-background-secondary p-0.5" role="group" aria-label={t('dash_period', 'Dönem')}>
        {PRESETS.map((preset) => {
          const active = activePreset === preset.days;
          return (
            <button
              key={preset.days}
              type="button"
              aria-pressed={active}
              onClick={() => handlePresetClick(preset.days)}
              className={`h-8 rounded-sm px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                active ? 'bg-background-primary text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t(preset.labelKey, preset.fallback)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          aria-label={t('dash_start_date', 'Başlangıç')}
          value={toInputValue(startDate)}
          max={toInputValue(endDate)}
          onChange={(e) => onStartDateChange(e.target.value ? new Date(e.target.value) : null)}
          className={dateInputClass}
        />
        <span className="text-sm text-text-muted">–</span>
        <input
          type="date"
          aria-label={t('dash_end_date', 'Bitiş')}
          value={toInputValue(endDate)}
          min={toInputValue(startDate)}
          max={toInputValue(new Date())}
          onChange={(e) => onEndDateChange(e.target.value ? new Date(e.target.value) : null)}
          className={dateInputClass}
        />
      </div>
    </div>
  );
};

export default TimeRangeSelector;

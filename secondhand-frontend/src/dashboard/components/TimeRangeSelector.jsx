import { useMemo, useCallback } from 'react';
import { Calendar } from 'lucide-react';

const PRESETS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
];

const TimeRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange, onPresetSelect }) => {
  // Derive active preset from the actual dates rather than internal state
  // This way it always stays in sync regardless of how dates were changed
  const activePreset = useMemo(() => {
    if (!startDate || !endDate) return null;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const endNorm = new Date(endDate);
    endNorm.setHours(23, 59, 59, 999);
    
    // endDate should be today (within same day)
    if (Math.abs(endNorm - today) > 24 * 60 * 60 * 1000) return null;

    const diffDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    const match = PRESETS.find(p => Math.abs(p.days - diffDays) <= 1);
    return match?.days || null;
  }, [startDate, endDate]);

  const handlePresetClick = useCallback((days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onPresetSelect(start, end);
  }, [onPresetSelect]);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.days}
            onClick={() => handlePresetClick(preset.days)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all duration-200 ${
              activePreset === preset.days
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      
      <div className="h-5 w-px bg-slate-200 hidden sm:block" />
      
      <div className="flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <input
          type="date"
          value={startDate ? startDate.toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : null;
            onStartDateChange(date);
          }}
          className="px-2 py-1.5 text-[11px] text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white font-medium"
        />
        <span className="text-[10px] text-slate-400 font-bold">→</span>
        <input
          type="date"
          value={endDate ? endDate.toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : null;
            onEndDateChange(date);
          }}
          max={new Date().toISOString().split('T')[0]}
          className="px-2 py-1.5 text-[11px] text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white font-medium"
        />
      </div>
    </div>
  );
};

export default TimeRangeSelector;

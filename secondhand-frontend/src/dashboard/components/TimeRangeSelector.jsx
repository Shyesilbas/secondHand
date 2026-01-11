import React from 'react';
import { Calendar } from 'lucide-react';

const TimeRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange, onPresetSelect }) => {
  const presets = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 3 Months', days: 90 },
    { label: 'Last 6 Months', days: 180 },
    { label: 'Last Year', days: 365 },
  ];

  const handlePresetClick = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onPresetSelect(start, end);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200/60 p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-semibold text-gray-700">Time Range</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-gray-500 font-medium">From:</label>
          <input
            type="date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              onStartDateChange(date);
            }}
            className="px-2.5 py-1.5 text-xs border border-gray-200/60 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] text-gray-500 font-medium">To:</label>
          <input
            type="date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              onEndDateChange(date);
            }}
            max={new Date().toISOString().split('T')[0]}
            className="px-2.5 py-1.5 text-xs border border-gray-200/60 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-gray-500 font-medium">Quick select:</span>
          <div className="flex gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.days}
                onClick={() => handlePresetClick(preset.days)}
                className="px-2.5 py-1 text-[11px] bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition-colors font-medium"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeRangeSelector;


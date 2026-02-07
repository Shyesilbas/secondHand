import EnumDropdown from '../../../common/components/ui/EnumDropdown.jsx';
import FilterChipGroup from './FilterChipGroup.jsx';
import { Calendar, Hash, Type } from 'lucide-react';

const FilterRenderer = ({ config, filters, onChange, title = 'Filters' }) => {
  if (!config || !config.getFields) return null;

  const fields = config.getFields();

  const handleNumericChange = (field, value, type = 'int') => {
    const numericValue = value === '' ? null : type === 'float' ? parseFloat(value) : parseInt(value);
    onChange(field, numericValue);
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'enum':
        if (field.displayAs === 'chips') {
          return (
            <FilterChipGroup
              key={field.key}
              label={field.label}
              enumKey={field.enumKey}
              value={filters[field.key] || []}
              onChange={(v) => onChange(field.key, v)}
              multiple={field.multiple}
            />
          );
        }
        return (
          <div key={field.key} className="space-y-1.5">
            <EnumDropdown
              label={field.label}
              enumKey={field.enumKey}
              value={filters[field.key] || []}
              onChange={(v) => onChange(field.key, v)}
              multiple={field.multiple}
              placeholder={`Select ${field.label.toLowerCase()}...`}
              searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
              className="w-full"
              usePortal={true}
            />
          </div>
        );

      case 'numericRange': {
        const minKey = `min${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
        const maxKey = `max${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
        return (
          <div key={field.key} className="space-y-2 min-w-0">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{field.label}</label>
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={filters[minKey] ?? ''}
                onChange={(e) => handleNumericChange(minKey, e.target.value)}
                placeholder="Min"
                className="min-w-0 flex-1 w-0 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
              <span className="flex-shrink-0 text-slate-300 text-sm font-medium">–</span>
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                value={filters[maxKey] ?? ''}
                onChange={(e) => handleNumericChange(maxKey, e.target.value)}
                placeholder="Max"
                className="min-w-0 flex-1 w-0 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
              />
            </div>
          </div>
        );
      }

      case 'dateRange': {
        const minDateKey = `min${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
        const maxDateKey = `max${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
        return (
          <div key={field.key} className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{field.label}</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={filters[minDateKey] ?? ''}
                  onChange={(e) => onChange(minDateKey, e.target.value)}
                  className="w-full pl-8 pr-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={filters[maxDateKey] ?? ''}
                  onChange={(e) => onChange(maxDateKey, e.target.value)}
                  className="w-full pl-8 pr-2 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>
        );
      }

      case 'text':
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{field.label}</label>
            <div className="relative">
              <input
                type="text"
                value={filters[field.key] ?? ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
              <Type className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1">
      {title ? (
        <div className="flex items-center gap-2 py-2">
          <Hash className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        </div>
      ) : null}
      <div className="space-y-2">
        {fields.map((field) => (
          <div key={field.key} className="py-2 first:pt-0">
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterRenderer;

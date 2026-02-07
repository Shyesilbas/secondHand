import { useEnums } from '../../../common/hooks/useEnums.js';
import { X } from 'lucide-react';

const FilterChipGroup = ({ label, enumKey, value = [], onChange, multiple = true, options = null, maxChips = 999 }) => {
  const { enums } = useEnums();
  const list = options ?? (enums?.[enumKey] || []);

  const selectedIds = Array.isArray(value) ? value : (value ? [value] : []);
  const getOptionValue = (o) => o?.id ?? o?.value ?? o?.name;
  const getOptionLabel = (o) => o?.label ?? o?.name ?? String(getOptionValue(o) ?? '');

  const handleToggle = (id) => {
    if (multiple) {
      const next = selectedIds.includes(id) ? selectedIds.filter((v) => v !== id) : [...selectedIds, id];
      onChange(next);
    } else {
      onChange(selectedIds.includes(id) ? [] : [id]);
    }
  };

  const handleClear = () => onChange([]);

  if (!list?.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {list.slice(0, maxChips).map((opt) => {
          const id = getOptionValue(opt);
          const isSelected = selectedIds.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleToggle(id)}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {getOptionLabel(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterChipGroup;

import EnumDropdown from '../../../../common/components/ui/EnumDropdown.jsx';
import { MapPin, Landmark, Building2, Map } from 'lucide-react';

const inp =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm tabular-nums text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

const fieldLabel = 'mb-1.5 block text-xs font-semibold text-slate-700';

const PriceLocationFields = ({ filters, onPriceChange, onInputChange, compact = false }) => {
  const minVal = filters.minPrice == null || filters.minPrice === '' ? '' : filters.minPrice;
  const maxVal = filters.maxPrice == null || filters.maxPrice === '' ? '' : filters.maxPrice;

  if (compact) {
    return (
      <div className="min-w-0 space-y-5">
        <div className="space-y-4">
          <div>
            <span className={fieldLabel}>Price range</span>
            <div className="flex items-stretch gap-2 min-w-0">
              <input
                type="number"
                inputMode="decimal"
                value={minVal}
                onChange={(e) => onPriceChange('minPrice', e.target.value)}
                placeholder="Min"
                min="0"
                className={`${inp} min-w-0 flex-1`}
              />
              <span className="flex shrink-0 items-center text-slate-300" aria-hidden>
                –
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={maxVal}
                onChange={(e) => onPriceChange('maxPrice', e.target.value)}
                placeholder="Max"
                min="0"
                className={`${inp} min-w-0 flex-1`}
              />
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-400">Leave blank for no limit.</p>
          </div>
          <div>
            <span className={fieldLabel}>Currency</span>
            <EnumDropdown
              enumKey="currencies"
              value={filters.currency ?? ''}
              onChange={(v) => onInputChange('currency', v)}
              multiple={false}
              placeholder="Any currency"
              searchPlaceholder="Search currency…"
              className="w-full"
              usePortal={true}
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden />
            <span className="text-xs font-semibold">Location</span>
          </div>
          <div className="relative">
            <span className={`${fieldLabel} sr-only`}>City</span>
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.city ?? ''}
              onChange={(e) => onInputChange('city', e.target.value)}
              placeholder="City"
              className={`${inp} pl-10`}
              autoComplete="address-level2"
            />
          </div>
          <div className="relative">
            <span className={`${fieldLabel} sr-only`}>District</span>
            <Map className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.district ?? ''}
              onChange={(e) => onInputChange('district', e.target.value)}
              placeholder="District"
              className={`${inp} pl-10`}
              autoComplete="address-level3"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-slate-800">
          <Landmark className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold tracking-tight">Price range</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={minVal}
              onChange={(e) => onPriceChange('minPrice', e.target.value)}
              placeholder="Min"
              min="0"
              className={inp}
            />
            <span className="text-slate-300">–</span>
            <input
              type="number"
              value={maxVal}
              onChange={(e) => onPriceChange('maxPrice', e.target.value)}
              placeholder="Max"
              min="0"
              className={inp}
            />
          </div>
          <EnumDropdown
            label="Currency"
            enumKey="currencies"
            value={filters.currency ?? ''}
            onChange={(v) => onInputChange('currency', v)}
            multiple={false}
            placeholder="Any currency"
            className="w-full"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-slate-800">
          <MapPin className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold tracking-tight">Location</h3>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={filters.city ?? ''}
              onChange={(e) => onInputChange('city', e.target.value)}
              placeholder="City"
              className={`${inp} pl-10`}
            />
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative">
            <input
              type="text"
              value={filters.district ?? ''}
              onChange={(e) => onInputChange('district', e.target.value)}
              placeholder="District"
              className={`${inp} pl-10`}
            />
            <Map className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceLocationFields;

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Lock, Search } from 'lucide-react';

const getOptionValue = (o) => String(o?.id ?? o?.value ?? '');
const getOptionLabel = (o) => String(o?.label ?? o?.name ?? getOptionValue(o) ?? '');

const LARGE_LIST_THRESHOLD = 14;

/**
 * embeddedInWizard: dış modal ile çift kutu / iç scroll olmasın; tam genişlik liste.
 */
const PrefilterOptionField = ({
  selector,
  fieldValue,
  disabled,
  options,
  onSelect,
  dependencyHint,
  embeddedInWizard = false,
}) => {
  const [query, setQuery] = useState('');

  const safeOptions = Array.isArray(options) ? options : [];

  useEffect(() => {
    setQuery('');
  }, [selector.initialDataKey, disabled]);

  const useSearch =
    selector.kind === 'searchable' || safeOptions.length > LARGE_LIST_THRESHOLD;

  /** Uzun liste veya sihirbaz: dar grid yerine ferah satırlar */
  const useListLayout = embeddedInWizard || useSearch;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return safeOptions;
    return safeOptions.filter((o) => getOptionLabel(o).toLowerCase().includes(q));
  }, [safeOptions, query]);

  if (disabled) {
    return (
      <div
        className={
          embeddedInWizard
            ? 'rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-6'
            : 'rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 sm:px-5'
        }
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/80 text-slate-500">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-700">{selector.label}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {dependencyHint || 'Finish the step above to continue.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedLabel =
    fieldValue &&
    safeOptions.find((o) => String(getOptionValue(o)) === String(fieldValue));

  const innerOptions = (
    <>
      {safeOptions.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No options available.</p>
      ) : useListLayout ? (
        <ul className="flex flex-col gap-2">
          {filtered.map((opt) => {
            const v = getOptionValue(opt);
            const label = getOptionLabel(opt);
            const selected = String(fieldValue) === String(v);
            return (
              <li key={v || label}>
                <button
                  type="button"
                  onClick={() => onSelect(selected ? '' : v)}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition sm:px-5 sm:py-4 ${
                    selected
                      ? 'border-teal-600 bg-teal-50/90 text-teal-950 ring-2 ring-teal-600/25'
                      : 'border-slate-200/90 bg-white text-slate-800 hover:border-teal-200 hover:bg-slate-50/80'
                  }`}
                >
                  <span className="min-w-0 flex-1 text-pretty text-sm font-medium leading-snug sm:text-[15px]">
                    {label}
                  </span>
                  {selected ? (
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" strokeWidth={2.5} />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((opt) => {
            const v = getOptionValue(opt);
            const label = getOptionLabel(opt);
            const selected = String(fieldValue) === String(v);
            return (
              <button
                key={v || label}
                type="button"
                onClick={() => onSelect(selected ? '' : v)}
                className={`flex min-h-[3.5rem] items-start justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium leading-snug transition ${
                  selected
                    ? 'border-teal-600 bg-teal-50 text-teal-950 ring-1 ring-teal-600/30'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-pretty">{label}</span>
                {selected ? <Check className="h-4 w-4 shrink-0 text-teal-700" strokeWidth={2.5} /> : null}
              </button>
            );
          })}
        </div>
      )}
      {filtered.length === 0 && safeOptions.length > 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No matches for your search.</p>
      ) : null}
    </>
  );

  const header = (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5">
      <div className="min-w-0 flex-1">
        <h3
          className={`font-semibold text-slate-900 ${embeddedInWizard ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}
        >
          {selector.label}
        </h3>
        {selector.description ? (
          <p
            className={`mt-1.5 leading-relaxed text-slate-500 ${embeddedInWizard ? 'text-sm sm:text-[15px]' : 'text-xs'}`}
          >
            {selector.description}
          </p>
        ) : null}
      </div>
      {fieldValue ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="hidden max-w-[14rem] text-pretty rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-900 sm:inline sm:text-sm">
            {selectedLabel ? getOptionLabel(selectedLabel) : fieldValue}
          </span>
          <button
            type="button"
            onClick={() => onSelect('')}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            Clear
          </button>
        </div>
      ) : null}
    </div>
  );

  const searchBar = useSearch ? (
    <div className="relative mb-4 sm:mb-5">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search or filter…"
        className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 py-3.5 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 sm:text-sm"
      />
    </div>
  ) : null;

  if (embeddedInWizard) {
    return (
      <div className="pb-1">
        {header}
        {searchBar}
        {innerOptions}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-950/[0.03] sm:p-5">
      {header}
      {searchBar}
      {safeOptions.length === 0 ? (
        innerOptions
      ) : useSearch ? (
        <div className="max-h-52 overflow-y-auto overscroll-contain pr-1 sm:max-h-60">{innerOptions}</div>
      ) : (
        innerOptions
      )}
    </div>
  );
};

export default PrefilterOptionField;

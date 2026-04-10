import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ChevronLeft, X } from 'lucide-react';
import { useEnums } from '../../../common/hooks/useEnums.js';
import PrefilterOptionField from './PrefilterOptionField.jsx';

/** Kategori seçildikten sonra her filtre alanını tek modal adımında gösterir */
const PrefilterWizardModal = ({
  open,
  selectors,
  value,
  onChange,
  categoryLabel,
  categoryDescription,
  onExitToCategories,
  onFinish,
}) => {
  const { enums } = useEnums();
  const [wizardStep, setWizardStep] = useState(0);

  useEffect(() => {
    if (open) setWizardStep(0);
  }, [open, selectors]);

  const dependencyLabel = (dependsOnKey) => {
    const parent = selectors.find((s) => s.initialDataKey === dependsOnKey);
    return parent?.label || dependsOnKey;
  };

  const activeSelector = selectors[wizardStep];
  const total = selectors.length;
  const isLast = wizardStep >= total - 1;

  const options = useMemo(() => {
    if (!activeSelector) return [];
    return activeSelector.getOptions
      ? activeSelector.getOptions({ enums, selection: value })
      : (enums?.[activeSelector.enumKey] || []);
  }, [activeSelector, enums, value]);

  const disabled = useMemo(() => {
    if (!activeSelector) return true;
    return (activeSelector.dependsOn || []).some((key) => !value[key]);
  }, [activeSelector, value]);

  const hint =
    activeSelector && disabled
      ? `Select ${(activeSelector.dependsOn || [])
          .filter((k) => !value[k])
          .map((k) => `"${dependencyLabel(k)}"`)
          .join(' and ')} first — use Back to adjust a previous step.`
      : null;

  const handleFieldChange = (sel, newVal) => {
    const patch = { [sel.initialDataKey]: newVal ?? '' };
    selectors.forEach((s) => {
      if (s.dependsOn?.includes(sel.initialDataKey)) patch[s.initialDataKey] = '';
    });
    onChange(patch);
  };

  const handleBack = () => {
    if (wizardStep <= 0) onExitToCategories();
    else setWizardStep((s) => s - 1);
  };

  if (!open || !selectors.length || !activeSelector) return null;

  const progressPct = Math.round(((wizardStep + 1) / total) * 100);

  const modal = (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close wizard"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity"
        onClick={handleBack}
      />

      <div
        className="relative flex max-h-[min(94vh,920px)] w-full max-w-full flex-col rounded-t-3xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-slate-950/10 sm:max-h-[min(90vh,880px)] sm:max-w-2xl sm:rounded-3xl lg:max-w-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prefilter-wizard-title"
      >
        <div className="shrink-0 border-b border-slate-100 px-5 pb-4 pt-5 sm:px-8 sm:pb-5 sm:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-800">Refine</p>
              <h2
                id="prefilter-wizard-title"
                className="mt-1 text-pretty text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
              >
                {categoryLabel}
              </h2>
              {categoryDescription ? (
                <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-slate-500 sm:text-[15px]">
                  {categoryDescription}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onExitToCategories}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Back to categories"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-medium text-slate-500 sm:text-sm">
              <span>
                Step {wizardStep + 1} of {total}
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-600 transition-[width] duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6">
          <div key={activeSelector.initialDataKey} className="animate-in fade-in slide-in-from-right-2 duration-200">
            <PrefilterOptionField
              selector={activeSelector}
              fieldValue={value[activeSelector.initialDataKey] ?? ''}
              disabled={disabled}
              options={options}
              dependencyHint={hint}
              onSelect={(v) => handleFieldChange(activeSelector, v)}
              embeddedInWizard
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-slate-50/90 px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              {wizardStep === 0 ? 'Categories' : 'Previous'}
            </button>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={onFinish}
                className="order-last rounded-xl py-2.5 text-center text-sm font-semibold text-teal-800 hover:bg-teal-50/80 sm:order-none sm:px-2 sm:py-3 sm:text-left"
              >
                Show listings now
              </button>
              {!isLast ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((s) => Math.min(s + 1, total - 1))}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-teal-800"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onFinish}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-teal-800"
                >
                  Show listings
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default PrefilterWizardModal;

import { useTranslation } from "react-i18next";
import React, { memo } from 'react';
import { Check } from 'lucide-react';

const CheckoutProgressBar = ({
  currentStep,
  steps,
  onStepChange
}) => {
  const { t } = useTranslation();
  const activeStepObj = steps.find(s => s.id === currentStep) || steps[0];

  return (
    <nav className="w-full" aria-label={t("checkout_progress")}>
      {/* Desktop Stepper */}
      <div className="hidden sm:flex items-center bg-slate-100/80 rounded-2xl border border-slate-200/80 p-1.5 w-full select-none shadow-xs">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = currentStep > step.id;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => isClickable && onStepChange(step.id)}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-3.5 rounded-xl transition-all duration-200 outline-none ${
                  isCurrent
                    ? 'bg-white shadow-xs border border-slate-200/90 text-emerald-700 font-bold'
                    : isCompleted
                    ? 'text-slate-700 hover:bg-white/80 cursor-pointer font-semibold'
                    : 'text-slate-400 cursor-default font-medium'
                }`}
              >
                {/* Step Node */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200/80 text-slate-500 border border-slate-300/60'
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : step.id}
                </span>

                {/* Step Title */}
                <span className="text-[11px] uppercase tracking-wider">
                  {step.title}
                </span>
              </button>

              {/* Connector */}
              {!isLast && (
                <div className="flex shrink-0 items-center justify-center px-1 text-slate-300">
                  <span className={`h-1 w-3 rounded-full transition-colors ${isCompleted ? 'bg-emerald-500/40' : 'bg-slate-300'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile-first compact Stepper indicator */}
      <div className="flex items-center justify-between sm:hidden w-full px-2 py-1">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t("step")} {currentStep} {t("of")} {steps.length}
          </span>
          <span className="text-sm font-bold text-slate-900 mt-0.5">
            {activeStepObj.title}
          </span>
        </div>
        {/* Modern radial progress loop */}
        <div className="relative h-8 w-8 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-slate-200" strokeWidth="2.5" stroke="currentColor" fill="transparent" r="11" cx="16" cy="16" />
            <circle
              className="text-emerald-600 transition-all duration-300"
              strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 11}`}
              strokeDashoffset={`${2 * Math.PI * 11 * (1 - currentStep / steps.length)}`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="11"
              cx="16"
              cy="16"
            />
          </svg>
          <span className="absolute text-[10px] font-extrabold text-slate-900">
            {currentStep}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default memo(CheckoutProgressBar);
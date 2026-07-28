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
    <nav className="w-full" aria-label={t("checkout_progress", "Sipariş Adımları")}>
      {/* Desktop Stepper */}
      <div className="hidden sm:flex items-center bg-slate-100/70 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-1.5 w-full select-none">
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
                className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl transition-all duration-300 outline-none ${
                  isCurrent
                    ? 'bg-white shadow-md shadow-slate-200/60 border border-slate-200/90 text-slate-900 scale-[1.01]'
                    : isCompleted
                    ? 'text-emerald-700 hover:bg-white/60 cursor-pointer font-medium'
                    : 'text-slate-400 cursor-default'
                }`}
              >
                {/* Step Node */}
                <span
                  className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : step.id}
                </span>

                {/* Step Title */}
                <span className={`text-xs font-extrabold uppercase tracking-wider transition-colors duration-200 ${isCurrent ? 'text-slate-900' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </button>

              {/* Connector */}
              {!isLast && (
                <div className="flex shrink-0 items-center justify-center px-1 text-slate-300">
                  <span className={`h-1 w-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile-first compact Stepper indicator */}
      <div className="flex items-center justify-between sm:hidden w-full px-2 py-1">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {t("step", "Adım")} {currentStep} / {steps.length}
          </span>
          <span className="text-sm font-extrabold text-slate-900 mt-0.5">
            {activeStepObj.title}
          </span>
        </div>

        {/* Radial Progress */}
        <div className="relative h-8 w-8 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-slate-200" strokeWidth="2.5" stroke="currentColor" fill="transparent" r="11" cx="16" cy="16" />
            <circle className="text-emerald-600 transition-all duration-300" strokeWidth="2.5" strokeDasharray={`${2 * Math.PI * 11}`} strokeDashoffset={`${2 * Math.PI * 11 * (1 - currentStep / steps.length)}`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="11" cx="16" cy="16" />
          </svg>
          <span className="absolute text-[10px] font-black text-slate-900">
            {currentStep}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default memo(CheckoutProgressBar);
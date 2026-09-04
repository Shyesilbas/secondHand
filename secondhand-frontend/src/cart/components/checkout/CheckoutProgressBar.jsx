import { useTranslation } from "react-i18next";
import React, { memo } from 'react';
import { Check, MapPin, CreditCard, PackageCheck, ShieldCheck } from 'lucide-react';

const STEP_ICONS = {
  1: MapPin,
  2: CreditCard,
  3: PackageCheck,
  4: ShieldCheck,
};

const CheckoutProgressBar = ({
  currentStep,
  steps,
  onStepChange
}) => {
  const { t } = useTranslation();
  const activeStepObj = steps.find(s => s.id === currentStep) || steps[0];
  const progressPercent = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <nav className="w-full" aria-label={t("checkout_progress", "Sipariş Aşamaları")}>
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 p-2 shadow-xs">
        {/* Background Connecting Progress Track */}
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full -z-0 pointer-events-none">
          <div 
            className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = currentStep > step.id;
          const IconComponent = STEP_ICONS[step.id] || MapPin;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepChange(step.id)}
              disabled={!isClickable}
              aria-current={isCurrent ? 'step' : undefined}
              className={`relative z-10 flex items-center gap-2.5 py-2 px-3.5 rounded-xl transition-all duration-300 outline-none select-none ${
                isCurrent
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 ring-4 ring-slate-900/5'
                  : isCompleted
                  ? 'bg-white text-slate-800 hover:bg-slate-50 cursor-pointer border border-slate-200/80 shadow-xs'
                  : 'bg-white/90 text-slate-400 cursor-default border border-slate-100 shadow-xs opacity-75'
              }`}
            >
              {/* Step Icon Node */}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 ${
                  isCurrent
                    ? 'bg-white/20 text-white'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} />
                ) : (
                  <IconComponent className="h-3.5 w-3.5" />
                )}
              </span>

              {/* Step Title & Subtitle */}
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                    isCurrent ? 'text-slate-300' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {t("step", "Adım")} {step.id}
                  </span>
                  {isCompleted && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
                <span className={`text-xs font-bold block tracking-tight leading-tight ${
                  isCurrent ? 'text-white' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile-first compact Stepper indicator */}
      <div className="flex flex-col gap-2 sm:hidden w-full bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold shadow-xs">
              {currentStep}
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                {t("step", "Adım")} {currentStep} / {steps.length}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {activeStepObj.title}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            %{progressPercent} Tamamlandı
          </span>
        </div>

        {/* Linear mini progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-slate-900 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(15, progressPercent)}%` }}
          />
        </div>
      </div>
    </nav>
  );
};

export default memo(CheckoutProgressBar);
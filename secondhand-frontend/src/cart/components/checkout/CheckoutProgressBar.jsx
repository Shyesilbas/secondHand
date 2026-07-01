import { useTranslation } from "react-i18next";
import React, { memo } from 'react';
import { Check } from 'lucide-react';
const CheckoutProgressBar = ({
  currentStep,
  steps,
  onStepChange
}) => {
  const {
    t
  } = useTranslation();
  const activeStepObj = steps.find(s => s.id === currentStep) || steps[0];
  return <nav className="w-full" aria-label={t("checkout_progress")}>
      {/* Desktop Stepper */}
      <div className="hidden sm:flex items-center bg-background-secondary/40 backdrop-blur-sm rounded-2xl border border-border-light/60 p-1.5 w-full select-none">
        {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isClickable = currentStep > step.id;
        const isLast = index === steps.length - 1;
        return <React.Fragment key={step.id}>
              <button type="button" onClick={() => isClickable && onStepChange(step.id)} disabled={!isClickable} aria-current={isCurrent ? 'step' : undefined} className={`flex-1 flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl transition-all duration-300 outline-none ${isCurrent ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-[#f1f5f9] text-primary scale-[1.01]' : isCompleted ? 'text-text-secondary hover:bg-white/40 cursor-pointer' : 'text-text-muted cursor-default'}`}>
                {/* Step Node */}
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold transition-all duration-300 ${isCompleted ? 'bg-primary text-white' : isCurrent ? 'bg-primary/10 text-primary' : 'bg-background-tertiary text-text-muted border border-border-light'}`}>
                  {isCompleted ? <Check className="h-3 w-3" strokeWidth={3.5} /> : step.id}
                </span>

                {/* Step Title */}
                <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 ${isCurrent ? 'text-text-primary' : 'text-inherit'}`}>
                  {step.title}
                </span>
              </button>

              {/* Connector dot */}
              {!isLast && <div className="flex shrink-0 items-center justify-center px-1 text-text-muted/20">
                  <span className="h-1 w-1 rounded-full bg-current" />
                </div>}
            </React.Fragment>;
      })}
      </div>

      {/* Mobile-first compact Stepper indicator */}
      <div className="flex items-center justify-between sm:hidden w-full px-2">
        <div className="flex flex-col">
          <span className="text-caption font-bold uppercase tracking-widest text-text-muted">{t("step")}{currentStep}{t("of")}{steps.length}
          </span>
          <span className="text-sm font-semibold text-text-primary mt-0.5">
            {activeStepObj.title}
          </span>
        </div>
        {/* Modern radial progress loop */}
        <div className="relative h-7 w-7 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-border-light" strokeWidth="2" stroke="currentColor" fill="transparent" r="10" cx="14" cy="14" />
            <circle className="text-primary transition-all duration-300" strokeWidth="2" strokeDasharray={`${2 * Math.PI * 10}`} strokeDashoffset={`${2 * Math.PI * 10 * (1 - currentStep / steps.length)}`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="10" cx="14" cy="14" />
          </svg>
          <span className="absolute text-[9px] font-bold text-text-primary">
            {currentStep}
          </span>
        </div>
      </div>
    </nav>;
};
export default memo(CheckoutProgressBar);
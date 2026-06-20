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
      <ol className="hidden items-center justify-between sm:flex w-full select-none">
        {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isClickable = currentStep > step.id;
        const isLast = index === steps.length - 1;
        return <React.Fragment key={step.id}>
              <li className="flex items-center">
                <button type="button" onClick={() => isClickable && onStepChange(step.id)} disabled={!isClickable} aria-current={isCurrent ? 'step' : undefined} className={`group flex items-center gap-2.5 transition-all outline-none ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}>
                  {/* Step Node */}
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-caption font-medium transition-all duration-300 ${isCompleted ? 'bg-slate-900 text-white' : isCurrent ? 'bg-background-primary border-2 border-primary text-primary shadow-sm' : 'bg-background-primary border border-border-light text-slate-400'}`}>
                    {isCompleted ? <Check className="h-3 w-3" strokeWidth={3} /> : step.id}
                  </span>

                  {/* Step Title */}
                  <span className={`text-xs font-semibold tracking-wide uppercase transition-colors duration-200 ${isCurrent ? 'text-text-primary font-bold' : isCompleted ? 'text-slate-500 group-hover:text-text-primary' : 'text-slate-400'}`}>
                    {step.title}
                  </span>
                </button>
              </li>

              {/* Connector line */}
              {!isLast && <div className="flex-1 mx-4 h-[2px] relative bg-slate-100 rounded overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-slate-900 transition-all duration-500 ease-out" style={{
              width: isCompleted ? '100%' : '0%'
            }} />
                </div>}
            </React.Fragment>;
      })}
      </ol>

      {/* Mobile-first compact Stepper indicator */}
      <div className="flex items-center justify-between sm:hidden w-full px-2">
        <div className="flex flex-col">
          <span className="text-caption font-bold uppercase tracking-widest text-slate-400">{t("step")}{currentStep}{t("of")}{steps.length}
          </span>
          <span className="text-sm font-semibold text-text-primary mt-0.5">
            {activeStepObj.title}
          </span>
        </div>
        {/* Modern radial progress loop */}
        <div className="relative h-7 w-7 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-slate-100" strokeWidth="2" stroke="currentColor" fill="transparent" r="10" cx="14" cy="14" />
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
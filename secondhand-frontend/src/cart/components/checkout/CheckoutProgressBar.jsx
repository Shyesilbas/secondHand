import { useTranslation } from "react-i18next";
import { memo } from 'react';
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
      <div className="hidden md:flex items-center justify-between relative bg-background-primary rounded-md border border-border/90 p-2">
        {/* Background Connecting Progress Track */}
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-background-tertiary rounded-full -z-0 pointer-events-none">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {steps.map((step) => {
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
              className={`relative z-10 flex items-center gap-2.5 py-2 px-3.5 rounded transition-all duration-300 outline-none select-none ${
                isCurrent
                  ? 'bg-primary text-white ring-4'
                  : isCompleted
                  ? 'bg-white text-text-primary hover:bg-background-secondary cursor-pointer border border-border/80'
                  : 'bg-white/90 text-text-muted cursor-default border border-border-light opacity-75'
              }`}
            >
              {/* Step Icon Node */}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-semibold transition-all duration-300 ${
                  isCurrent
                    ? 'bg-white/20 text-white'
                    : isCompleted
                    ? 'bg-background-secondary text-status-success-text border border-border'
                    : 'bg-background-tertiary text-text-muted'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-status-success-text" strokeWidth={3} />
                ) : (
                  <IconComponent className="h-3.5 w-3.5" />
                )}
              </span>

              {/* Step Title & Subtitle */}
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${
                    isCurrent ? 'text-secondary-300' : isCompleted ? 'text-status-success-text' : 'text-text-muted'
                  }`}>
                    {t("step", "Adım")} {step.id}
                  </span>
                  {isCompleted && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-success" />
                  )}
                </div>
                <span className={`text-xs font-semibold block tracking-tight leading-tight ${
                  isCurrent ? 'text-white' : isCompleted ? 'text-text-primary' : 'text-text-muted'
                }`}>
                  {step.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile-first compact Stepper indicator */}
      <div className="flex flex-col gap-2 sm:hidden w-full bg-background-primary rounded-md border border-border/80 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-white text-xs font-semibold">
              {currentStep}
            </span>
            <div>
              <span className="text-xs font-semibold text-text-muted block">
                {t("step", "Adım")} {currentStep} / {steps.length}
              </span>
              <span className="text-xs font-semibold text-text-primary">
                {activeStepObj.title}
              </span>
            </div>
          </div>

          <span className="text-xs font-semibold text-text-secondary bg-background-tertiary px-2 py-0.5 rounded-sm border border-border">
            %{progressPercent} Tamamlandı
          </span>
        </div>

        {/* Linear mini progress bar */}
        <div className="w-full bg-background-tertiary rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(15, progressPercent)}%` }}
          />
        </div>
      </div>
    </nav>
  );
};

export default memo(CheckoutProgressBar);
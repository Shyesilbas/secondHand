import { useTranslation } from "react-i18next";
import { memo } from 'react';
import { Check, MapPin, CreditCard, PackageCheck, ShieldCheck, ChevronRight } from 'lucide-react';

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
      <div className="hidden md:flex items-center justify-between rounded border border-border bg-background-primary p-2">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = currentStep > step.id;
          const IconComponent = STEP_ICONS[step.id] || MapPin;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => isClickable && onStepChange(step.id)}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-2.5 py-1.5 px-3 rounded text-left transition-colors outline-none select-none ${
                  isCurrent
                    ? 'bg-background-tertiary text-text-primary'
                    : isCompleted
                    ? 'text-text-secondary hover:text-text-primary cursor-pointer'
                    : 'text-text-muted cursor-default'
                }`}
              >
                {/* Step Icon Node */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-primary text-text-inverse'
                      : isCompleted
                      ? 'bg-primary text-text-inverse'
                      : 'bg-background-tertiary text-text-muted'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <IconComponent className="h-3 w-3" strokeWidth={2} />
                  )}
                </span>

                {/* Step Title */}
                <div>
                  <span className="block text-xs font-medium text-text-tertiary">
                    {t("step", "Adım")} {step.id}
                  </span>
                  <span
                    className={`block text-xs font-semibold leading-tight ${
                      isCurrent
                        ? 'text-text-primary'
                        : isCompleted
                        ? 'text-text-secondary'
                        : 'text-text-muted'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="flex-1 flex justify-center px-1">
                  <ChevronRight className="h-4 w-4 text-border shrink-0" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile-first compact Stepper indicator */}
      <div className="flex flex-col gap-2 md:hidden w-full bg-background-primary rounded border border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-text-inverse text-xs font-semibold">
              {currentStep}
            </span>
            <div>
              <span className="text-xs text-text-muted block">
                {t("step", "Adım")} {currentStep} / {steps.length}
              </span>
              <span className="text-xs font-semibold text-text-primary">
                {activeStepObj.title}
              </span>
            </div>
          </div>

          <span className="text-xs font-medium tabular-nums text-text-secondary bg-background-tertiary px-2 py-0.5 rounded-sm border border-border-light">
            %{progressPercent}
          </span>
        </div>

        {/* Linear mini progress bar */}
        <div className="w-full bg-background-tertiary rounded-sm h-1 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(15, progressPercent)}%` }}
          />
        </div>
      </div>
    </nav>
  );
};

export default memo(CheckoutProgressBar);
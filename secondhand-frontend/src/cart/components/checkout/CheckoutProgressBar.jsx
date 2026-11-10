import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { Check } from 'lucide-react';

// Plain stepper: finished steps can be revisited, later ones cannot be skipped to.
const CheckoutProgressBar = ({ currentStep, steps, onStepChange }) => {
  const { t } = useTranslation();
  const active = steps.find(s => s.id === currentStep) || steps[0];

  return (
    <nav aria-label={t('checkout_progress', 'Ödeme adımları')}>
      <ol className="hidden items-center gap-2 md:flex">
        {steps.map((step, idx) => {
          const done = currentStep > step.id;
          const current = currentStep === step.id;
          return (
            <li key={step.id} className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => done && onStepChange(step.id)}
                disabled={!done}
                aria-current={current ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 ${
                  current ? 'font-medium text-text-primary' : done ? 'text-text-secondary hover:text-text-primary' : 'cursor-default text-text-muted'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums ${
                    done
                      ? 'bg-primary text-text-inverse'
                      : current
                      ? 'border-2 border-primary bg-background-primary text-primary font-semibold ring-2 ring-primary/20'
                      : 'border border-border text-text-muted'
                  }`}
                  aria-hidden
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : step.id}
                </span>
                <span className="whitespace-nowrap">{t(step.labelKey, step.label)}</span>
              </button>
              {idx < steps.length - 1 && <span className="h-px w-6 shrink-0 bg-border lg:w-10" aria-hidden />}
            </li>
          );
        })}
      </ol>

      <div className="space-y-1.5 md:hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="tabular-nums text-text-tertiary">
            {t('checkout_step_of', { defaultValue: 'Adım {{current}}/{{total}}', current: currentStep, total: steps.length })}
          </span>
          <span className="truncate font-medium text-text-primary">{t(active.labelKey, active.label)}</span>
        </div>
        <div className="flex items-center gap-1.5" aria-hidden>
          {steps.map(step => {
            const done = currentStep > step.id;
            const current = currentStep === step.id;
            return (
              <span
                key={step.id}
                className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                  done || current ? 'bg-primary' : 'bg-border'
                }`}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default memo(CheckoutProgressBar);

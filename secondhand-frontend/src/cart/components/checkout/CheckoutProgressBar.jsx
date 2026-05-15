import React from 'react';
import { Check } from 'lucide-react';

const CheckoutProgressBar = ({ currentStep, steps, onStepChange }) => {
  return (
    <nav className="w-full" aria-label="Checkout progress">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = currentStep > step.id;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`flex items-center ${isLast ? '' : 'flex-1'}`}
            >
              <button
                type="button"
                onClick={() => isClickable && onStepChange(step.id)}
                disabled={!isClickable}
                aria-label={`${step.title} step`}
                aria-current={isCurrent ? 'step' : undefined}
                className={`group flex items-center gap-2 ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Step indicator */}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center text-xs font-semibold transition-all duration-200 ${
                    isCompleted
                      ? 'rounded-md bg-[#1466c6] text-white'
                      : isCurrent
                        ? 'rounded-md border-2 border-[#1466c6] text-[#1466c6]'
                        : 'rounded-md border border-[#ddd] text-[#999]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    step.id
                  )}
                </span>

                {/* Step title — hidden on small screens */}
                <span
                  className={`hidden text-sm font-medium sm:inline ${
                    isCurrent
                      ? 'text-[#111]'
                      : isCompleted
                        ? 'text-[#555] group-hover:text-[#111]'
                        : 'text-[#999]'
                  }`}
                >
                  {step.title}
                </span>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`mx-3 hidden h-px flex-1 sm:block ${
                    isCompleted ? 'bg-[#1466c6]' : 'bg-[#e5e3df]'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CheckoutProgressBar;

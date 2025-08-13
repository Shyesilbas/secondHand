import React from 'react';

const Stepper = ({ steps = [], currentStep = 1, onStepClick = null }) => {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center">
            <button
              type="button"
              onClick={onStepClick ? () => onStepClick(step.id) : undefined}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-400'
              } ${onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {currentStep > step.id ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-semibold">{step.id}</span>
              )}
            </button>
            <div className="ml-3 hidden md:block">
              <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-500'}`}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-slate-500">{step.description}</p>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-300'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;


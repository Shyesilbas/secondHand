import React from 'react';
import {Check as CheckIcon} from 'lucide-react';

const CheckoutProgressBar = ({ currentStep, steps, onStepChange }) => {
    return (
        <div className="bg-white border-b border-slate-200/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        const isClickable = currentStep > step.id;

                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => isClickable && onStepChange(step.id)}
                                        disabled={!isClickable}
                                        className={`flex items-center space-x-3 ${
                                            isClickable ? 'cursor-pointer' : 'cursor-default'
                                        }`}
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            isCompleted 
                                                ? 'bg-emerald-500 text-white shadow-sm' 
                                                : isCurrent 
                                                    ? 'bg-indigo-600 text-white shadow-md scale-110' 
                                                    : 'bg-slate-200 text-slate-400'
                                        }`}>
                                            {isCompleted ? (
                                                <CheckIcon className="w-5 h-5" />
                                            ) : (
                                                <span className="text-sm font-semibold tracking-tight">{step.id}</span>
                                            )}
                                        </div>

                                        <div className="text-left hidden sm:block">
                                            <div className={`text-sm font-semibold tracking-tight ${
                                                isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-500'
                                            }`}>
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-slate-500 tracking-tight">
                                                {step.description}
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-px mx-4 transition-all duration-300 ${
                                        currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CheckoutProgressBar;

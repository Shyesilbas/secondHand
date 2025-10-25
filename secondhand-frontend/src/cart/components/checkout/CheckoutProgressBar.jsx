import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const CheckoutProgressBar = ({ currentStep, steps, onStepChange }) => {
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                                        {/* Step Circle */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                            isCompleted 
                                                ? 'bg-green-500 text-white shadow-sm' 
                                                : isCurrent 
                                                    ? 'bg-blue-600 text-white shadow-md' 
                                                    : 'bg-gray-200 text-gray-400'
                                        }`}>
                                            {isCompleted ? (
                                                <CheckIcon className="w-5 h-5" />
                                            ) : (
                                                <span className="text-sm font-medium">{step.id}</span>
                                            )}
                                        </div>

                                        {/* Step Info */}
                                        <div className="text-left">
                                            <div className={`text-sm font-medium ${
                                                isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {step.description}
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-4 transition-colors ${
                                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
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

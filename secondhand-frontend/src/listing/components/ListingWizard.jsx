import React from 'react';

const ListingWizard = ({
                         title,
                         subtitle,
                         steps = [],
                         currentStep = 1,
                         onBack,
                         onNext,
                         onPrev,
                         onSubmit,
                         isLoading = false,
                         canSubmit = true,
                         renderStep,
                       }) => {
  const isLastStep = currentStep >= steps.length;

  return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                  onClick={onBack}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
              </div>
            </div>

            {/* Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                          currentStep >= step.id
                              ? 'bg-gray-900 border-gray-900 text-white'
                              : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {currentStep > step.id ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <span className="text-sm font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="ml-3 hidden md:block">
                        <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-gray-900' : 'bg-gray-300'}`} />
                    )}
                  </div>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            {typeof renderStep === 'function' && renderStep(currentStep)}

            <div className="flex items-center justify-between bg-white border border-gray-200 rounded p-6">
              <button
                  type="button"
                  onClick={currentStep === 1 ? onBack : onPrev}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>

              <div className="flex items-center gap-2">
                {!isLastStep ? (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); onNext(); }}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors font-medium"
                    >
                      Next Step
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={isLoading || !canSubmit}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isLoading ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Submitting...
                          </>
                      ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Submit Listing
                          </>
                      )}
                    </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
  );
};

export default ListingWizard;
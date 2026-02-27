import {ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2, Save} from 'lucide-react';

const ListingWizard = ({
    title,
    subtitle,
    steps = [],
    currentStep = 1,
    onBack,
    onNext,
    onPrev,
    onSubmit,
    onSaveDraft,
    isLoading = false,
    canSubmit = true,
    renderStep,
}) => {
  const isLastStep = currentStep >= steps.length;
  const currentStepInfo = steps.find(s => s.id === currentStep) || steps[0];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      {/* Sticky header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="h-12 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="group flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors py-1.5 px-2 -ml-2 rounded-md focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-[13px] font-medium">Cancel</span>
            </button>
            
            <span className="text-[11px] text-gray-400 tabular-nums hidden sm:inline">
              {currentStep} of {steps.length}
            </span>

            <div className="w-16 sm:hidden" />
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-[2px] bg-gray-100 w-full">
          <div
            className="h-full bg-gray-900 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Sidebar steps */}
          <div className="hidden lg:block lg:col-span-3">
            <nav className="sticky top-24 space-y-0.5">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div 
                    key={step.id}
                    className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 ${
                      isActive ? 'bg-white border border-gray-100' : ''
                    }`}
                  >
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors duration-150 shrink-0
                      ${isActive 
                        ? 'bg-gray-900 text-white' 
                        : isCompleted 
                          ? 'bg-gray-100 text-gray-600' 
                          : 'bg-gray-50 text-gray-300'
                      }
                    `}>
                      {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                    </div>
                    <p className={`text-[12px] font-medium transition-colors duration-150 ${
                      isActive ? 'text-gray-900' : isCompleted ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      {step.title}
                    </p>

                    {index < steps.length - 1 && (
                      <div className="absolute left-[21px] top-9 w-px h-3 bg-gray-100" />
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Main content */}
          <div className="lg:col-span-9">
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-gray-900 tracking-[-0.01em] mb-1">
                {currentStepInfo?.title || title}
              </h1>
              <p className="text-[13px] text-gray-400">
                {currentStepInfo?.description || subtitle}
              </p>
            </div>

            <div className="min-h-[360px]">
              {typeof renderStep === 'function' && renderStep(currentStep)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-40">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={currentStep === 1 ? onBack : onPrev}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            <div className="flex items-center gap-2">
              {onSaveDraft && (
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:text-gray-700 border border-gray-100 hover:border-gray-200 transition-colors focus:outline-none"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Draft
                </button>
              )}

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onNext(); }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors focus:outline-none"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); if (onSubmit) onSubmit(e); }}
                  disabled={isLoading || !canSubmit}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Publish Listing
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingWizard;

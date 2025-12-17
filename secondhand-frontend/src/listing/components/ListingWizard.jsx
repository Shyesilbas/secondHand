import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2, 
  X,
  ArrowLeft
} from 'lucide-react';

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
  const currentStepInfo = steps.find(s => s.id === currentStep) || steps[0];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors py-2 px-3 -ml-3 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Cancel & Exit</span>
            </button>
            
            <div className="hidden sm:block text-sm font-medium text-gray-500">
              Step {currentStep} of {steps.length}
            </div>
            
            <div className="w-24 sm:hidden">
              {/* Spacer for mobile center alignment */}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100 w-full">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Sidebar Steps (Desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <nav className="sticky top-32 space-y-1">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div 
                    key={step.id}
                    className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-white shadow-md border border-gray-100' : 'hover:bg-gray-100/50'
                    }`}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300
                      ${isActive 
                        ? 'border-indigo-600 bg-indigo-600 text-white' 
                        : isCompleted 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                          : 'border-gray-200 bg-white text-gray-400'
                      }
                    `}>
                      {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold transition-colors duration-300 ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-7 top-10 w-0.5 h-6 bg-gray-100 -ml-px z-0" />
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-9">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                {currentStepInfo?.title || title}
              </h1>
              <p className="text-lg text-gray-500">
                {currentStepInfo?.description || subtitle}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 min-h-[400px]">
                {typeof renderStep === 'function' && renderStep(currentStep)}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={currentStep === 1 ? onBack : onPrev}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>

                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onNext(); }}
                    className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 hover:shadow-xl font-bold tracking-wide"
                  >
                    Next Step
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !canSubmit}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 font-bold tracking-wide"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Publish Listing
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingWizard;

import {ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2, Save, Sparkles} from 'lucide-react';

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
    footerExtra = null,
    lastStepAction = null,
}) => {
  const isLastStep = currentStep >= steps.length;
  const currentStepInfo = steps.find(s => s.id === currentStep) || steps[0];
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50/80 pb-28">

      {/* ── Sticky Top Bar ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200/60 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="group flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-all duration-200 py-1.5 px-2 -ml-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-sm font-medium">Cancel</span>
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-gray-900 text-white scale-110'
                        : isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                    </div>
                    {step.id < steps.length && (
                      <div className={`w-6 h-0.5 rounded-full transition-colors duration-300 ${
                        isCompleted ? 'bg-emerald-200' : 'bg-gray-100'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            <span className="text-xs text-gray-400 font-medium tabular-nums hidden sm:block">
              Step {currentStep}/{steps.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-gray-800 to-gray-900 transition-all duration-500 ease-out"
            style={{width: `${progress}%`}}
          />
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── Sidebar Steps (desktop) ──────────────────── */}
          <div className="hidden lg:block lg:col-span-3">
            <nav className="sticky top-24 space-y-1">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div
                    key={step.id}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive ? 'bg-white border border-gray-200 shadow-sm' : ''
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : isCompleted
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-300'
                    }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold transition-colors duration-200 ${
                        isActive ? 'text-gray-900' : isCompleted ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                        {step.title}
                      </p>
                      {step.description && isActive && (
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{step.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* ── Main Content ─────────────────────────────── */}
          <div className="lg:col-span-9">
            {/* Step header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {currentStepInfo?.title || title}
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                {currentStepInfo?.description || subtitle}
              </p>
            </div>

            {/* Step content */}
            <div className="min-h-[380px]">
              {typeof renderStep === 'function' && renderStep(currentStep)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Action Bar ──────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/60 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          {footerExtra && <div className="mb-3">{footerExtra}</div>}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={currentStep === 1 ? onBack : onPrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            <div className="flex items-center gap-2.5">
              {onSaveDraft && isLastStep && (
                <button
                  type="button"
                  onClick={onSaveDraft}
                  disabled={isLoading || !canSubmit}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 bg-white disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Draft
                </button>
              )}

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onNext(); }}
                  disabled={!canSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : lastStepAction ? (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); lastStepAction.onClick?.(); }}
                  disabled={Boolean(lastStepAction.disabled)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
                >
                  {lastStepAction.label}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); if (onSubmit) onSubmit(e); }}
                  disabled={isLoading || !canSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {onSaveDraft ? "Publish Now (Pay Fee)" : "Save Changes"}
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

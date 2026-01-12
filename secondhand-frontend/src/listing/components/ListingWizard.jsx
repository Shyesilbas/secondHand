import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2, 
  X,
  ArrowLeft,
  Save
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
    onSaveDraft,
    isLoading = false,
    canSubmit = true,
    renderStep,
}) => {
  const isLastStep = currentStep >= steps.length;
  const currentStepInfo = steps.find(s => s.id === currentStep) || steps[0];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-2 px-3 -ml-3 rounded-lg hover:bg-slate-50 tracking-tight"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium text-sm">İptal & Çıkış</span>
            </button>
            
            <div className="hidden sm:block text-xs font-medium text-slate-600 tracking-tight">
              Adım {currentStep} / {steps.length}
            </div>
            
            <div className="w-24 sm:hidden"></div>
          </div>
        </div>
        
        <div className="h-1 bg-slate-100 w-full">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="hidden lg:block lg:col-span-3">
            <nav className="sticky top-32 space-y-1">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div 
                    key={step.id}
                    className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-white shadow-md border border-slate-200/60' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300
                      ${isActive 
                        ? 'border-indigo-600 bg-indigo-600 text-white' 
                        : isCompleted 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                          : 'border-slate-200 bg-white text-slate-400'
                      }
                    `}>
                      {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold transition-colors duration-300 tracking-tight ${
                        isActive ? 'text-slate-900' : 'text-slate-600'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="absolute left-7 top-10 w-0.5 h-6 bg-slate-100 -ml-px z-0" />
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="lg:col-span-9">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                {currentStepInfo?.title || title}
              </h1>
              <p className="text-lg text-slate-600 tracking-tight">
                {currentStepInfo?.description || subtitle}
              </p>
            </div>

            <div className="space-y-8">
              <div className="min-h-[400px]">
                {typeof renderStep === 'function' && renderStep(currentStep)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/60 z-40 shadow-lg shadow-slate-200/20">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={currentStep === 1 ? onBack : onPrev}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900 transition-colors tracking-tight"
            >
              <ChevronLeft className="w-5 h-5" />
              {currentStep === 1 ? 'İptal' : 'Geri'}
            </button>

            <div className="flex items-center gap-3">
              {onSaveDraft && (
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors tracking-tight border border-slate-200"
                >
                  <Save className="w-4 h-4" />
                  Taslak Olarak Kaydet
                </button>
              )}

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onNext(); }}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200/60 hover:shadow-xl font-bold tracking-tight"
                >
                  İleri
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); if (onSubmit) onSubmit(e); }}
                  disabled={isLoading || !canSubmit}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200/60 hover:shadow-xl hover:shadow-indigo-300/60 font-bold tracking-tight"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Yayınlanıyor...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      İlanı Yayınla
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

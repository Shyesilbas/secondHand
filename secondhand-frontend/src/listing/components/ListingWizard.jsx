import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react';
import { PREFLOW_WIZARD_VARIANT } from '../config/prefilterFlowUi.js';
function resolveWizardUiKey(wizardVariant) {
 if (wizardVariant === PREFLOW_WIZARD_VARIANT.BROWSE || wizardVariant === 'browse') {
 return PREFLOW_WIZARD_VARIANT.BROWSE;
 }
 if (wizardVariant === PREFLOW_WIZARD_VARIANT.COMPOSER || wizardVariant === 'composer') {
 return PREFLOW_WIZARD_VARIANT.COMPOSER;
 }
 if (wizardVariant === PREFLOW_WIZARD_VARIANT.SELL || wizardVariant === 'sell') {
 return PREFLOW_WIZARD_VARIANT.SELL;
 }
 return PREFLOW_WIZARD_VARIANT.DEFAULT;
}

/* ── Step content animation variants ── */
const stepVariants = {
 enter: direction => ({
 x: direction > 0 ? 40 : -40,
 opacity: 0,
 scale: 0.98
 }),
 center: {
 x: 0,
 opacity: 1,
 scale: 1,
 transition: {
 type: 'spring',
 stiffness: 380,
 damping: 34,
 mass: 0.8
 }
 },
 exit: direction => ({
 x: direction > 0 ? -40 : 40,
 opacity: 0,
 scale: 0.98,
 transition: {
 duration: 0.2,
 ease: 'easeIn'
 }
 })
};

/* ── Shared chrome classes (theme tokens only) ── */
const secondaryBtn = 'inline-flex items-center gap-2 rounded-lg border border-border bg-background-primary px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50';
const primaryBtn = 'inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-text-inverse shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50';
const ListingWizard = ({
 title,
 subtitle,
 steps = [],
 currentStep = 1,
 currentStepIndex,
 totalSteps,
 onBack,
 onNext,
 onPrev,
 onSubmit,
 onSaveDraft,
 isLoading = false,
 canSubmit,
 canGoNext,
 renderStep,
 children,
 footerExtra = null,
 lastStepAction = null,
 lastStepActionOverride = null,
 wizardVariant,
 mode,
 headerEyebrow,
 continueLabel = 'Continue',
 layoutViewportLocked = false,
 onStepPick
}) => {
 const {
 t
 } = useTranslation();

 const effectiveWizardVariant = wizardVariant || mode;
 const uiKey = resolveWizardUiKey(effectiveWizardVariant);
 const isBrowse = uiKey === PREFLOW_WIZARD_VARIANT.BROWSE;
 const containerClass = isBrowse ? 'max-w-7xl' : 'max-w-6xl';
 const stepPanelRef = useRef(null);

 const activeStep = currentStepIndex !== undefined ? currentStepIndex + 1 : currentStep;
 const effectiveCanSubmit = canSubmit !== undefined ? canSubmit : canGoNext !== undefined ? canGoNext : true;
 const effectiveLastStepAction = lastStepAction || lastStepActionOverride;

 const stepsList = steps.length > 0
 ? steps
 : Array.from({ length: totalSteps || 1 }, (_, i) => ({ id: i + 1, title: `Step ${i + 1}` }));

 const [direction, setDirection] = useState(1);
 const prevStepRef = useRef(activeStep);
 const isLastStep = activeStep >= stepsList.length;
 const currentStepInfo = stepsList.find(s => s.id === activeStep) || stepsList[0];
 const progress = stepsList.length ? (activeStep / stepsList.length) * 100 : 0;

 useEffect(() => {
 setDirection(activeStep > prevStepRef.current ? 1 : -1);
 prevStepRef.current = activeStep;
 stepPanelRef.current?.scrollTo({
 top: 0,
 behavior: 'auto'
 });
 }, [activeStep]);

 const shellClass = layoutViewportLocked
 ? 'flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background-secondary'
 : 'flex w-full flex-1 flex-col bg-background-secondary';

 /* ── Footer actions ── */
 const footerElement = (
 <div className="flex flex-col gap-3">
 {footerExtra ? <div>{footerExtra}</div> : null}
 <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
 <button
 type="button"
 onClick={activeStep === 1 ? onBack : onPrev}
 className={secondaryBtn}
 >
 <ChevronLeft className="h-4 w-4" />
 <span>{activeStep === 1 ? (t('cancel') || 'Vazgeç') : (t('back') || 'Geri')}</span>
 </button>

 <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
 {onSaveDraft && isLastStep && (
 <button
 type="button"
 onClick={onSaveDraft}
 disabled={isLoading || !effectiveCanSubmit}
 className={secondaryBtn}
 >
 <Save className="h-4 w-4 text-text-muted" />
 <span>{t('save_draft') || 'Taslak Kaydet'}</span>
 </button>
 )}

 {!isLastStep ? (
 <button
 type="button"
 onClick={(e) => {
 e.preventDefault();
 onNext();
 }}
 disabled={!effectiveCanSubmit}
 className={primaryBtn}
 >
 <span>{continueLabel}</span>
 <ChevronRight className="h-4 w-4" />
 </button>
 ) : effectiveLastStepAction ? (
 <button
 type="button"
 onClick={(e) => {
 e.preventDefault();
 effectiveLastStepAction.onClick?.();
 }}
 disabled={Boolean(effectiveLastStepAction.disabled)}
 className={primaryBtn}
 >
 <span>{effectiveLastStepAction.label}</span>
 <ChevronRight className="h-4 w-4" />
 </button>
 ) : (
 <button
 type="button"
 onClick={(e) => {
 e.preventDefault();
 if (onSubmit) onSubmit(e);
 }}
 disabled={isLoading || !effectiveCanSubmit}
 className={primaryBtn}
 >
 {isLoading ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" />
 <span>{t('publishing') || 'Yayınlanıyor...'}</span>
 </>
 ) : (
 <>
 <span>{onSaveDraft ? 'İlanı Yayınla' : 'Değişiklikleri Kaydet'}</span>
 <ChevronRight className="h-4 w-4" />
 </>
 )}
 </button>
 )}
 </div>
 </div>
 </div>
 );

 return (
 <div className={shellClass}>
 {/* ── Top bar: cancel · step dots · counter · progress ── */}
 <div className="shrink-0 border-b border-border-light bg-background-primary">
 <div className={`mx-auto w-full ${containerClass} px-4 sm:px-6 lg:px-8`}>
 <div className="flex h-16 items-center justify-between gap-4">
 <button
 type="button"
 onClick={onBack}
 className="group inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary"
 >
 <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
 <span>{t("cancel") || "Cancel"}</span>
 </button>

 {/* Step dots */}
 <div className="flex min-w-0 items-center gap-1.5 overflow-hidden sm:gap-2.5">
 {stepsList.map(step => {
 const isActive = activeStep === step.id;
 const isCompleted = activeStep > step.id;
 return (
 <div key={step.id} className="flex shrink-0 items-center gap-1.5 sm:gap-2">
 <div
 className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
 isActive
 ? 'bg-primary text-text-inverse ring-4 ring-primary/15'
 : isCompleted
 ? 'bg-primary-100 text-primary-700'
 : 'border border-border bg-background-secondary text-text-muted'
 }`}
 >
 {isCompleted ? (
 <Check className="h-3.5 w-3.5" strokeWidth={3} />
 ) : (
 step.id
 )}
 </div>
 {step.id < stepsList.length && (
 <div
 className={`h-0.5 rounded-full transition-all duration-500 ease-out ${
 isCompleted ? 'w-4 bg-primary sm:w-8' : 'w-3 bg-border sm:w-6'
 }`}
 />
 )}
 </div>
 );
 })}
 </div>

 <span className="hidden shrink-0 items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 sm:inline-flex">
 {t("step") || "Step"} {activeStep} / {stepsList.length}
 </span>
 </div>
 </div>

 {/* Progress bar */}
 <div className="h-1 w-full bg-border-light">
 <div
 className="h-full rounded-r-full bg-primary transition-all duration-500 ease-out"
 style={{ width: `${progress}%` }}
 />
 </div>
 </div>

 {/* ── Main content: step rail + step panel ── */}
 <div className={`mx-auto flex w-full ${containerClass} flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10`}>
 <div className="grid flex-1 grid-cols-1 items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
 {/* ── Step rail (desktop) ── */}
 <aside className="hidden lg:block">
 <div className="sticky top-20 rounded-2xl border border-border-light bg-background-primary p-4 shadow-sm">
 {headerEyebrow ? (
 <span className="mb-3 inline-flex items-center rounded-md bg-primary-50 px-2.5 py-1 text-caption font-bold uppercase tracking-wider text-primary-700">
 {headerEyebrow}
 </span>
 ) : null}
 <p className="px-3 pb-2 text-caption font-bold uppercase tracking-wider text-text-muted">
 {t("steps") || "Steps"}
 </p>
 <nav className="space-y-1" aria-label={t("form_steps")}>
 {stepsList.map(step => {
 const isActive = activeStep === step.id;
 const isCompleted = activeStep > step.id;
 const goBackHere = typeof onStepPick === 'function' && step.id < activeStep;
 const rowInner = (
 <>
 <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-colors duration-200 ${
 isActive
 ? 'bg-primary text-text-inverse'
 : isCompleted
 ? 'bg-primary-100 text-primary-700'
 : 'border border-border bg-background-secondary text-text-muted'
 }`}>
 {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
 </div>
 <div className="min-w-0 text-left">
 <p className={`truncate text-sm font-semibold transition-colors duration-200 ${
 isActive ? 'text-text-primary' : isCompleted ? 'text-text-secondary' : 'text-text-muted'
 }`}>
 {step.title}
 </p>
 {step.description ? (
 <p className="mt-0.5 line-clamp-2 text-caption text-text-muted">
 {step.description}
 </p>
 ) : null}
 </div>
 </>
 );
 if (goBackHere) {
 return (
 <button
 key={step.id}
 type="button"
 onClick={() => onStepPick(step.id)}
 className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-background-secondary"
 >
 {rowInner}
 </button>
 );
 }
 return (
 <div
 key={step.id}
 className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
 isActive ? 'border border-border-light bg-background-secondary' : ''
 }`}
 >
 {rowInner}
 </div>
 );
 })}
 </nav>
 </div>
 </aside>

 {/* ── Step panel ── */}
 <section className="flex min-w-0 flex-col rounded-2xl border border-border-light bg-background-primary shadow-sm">
 <header className="border-b border-border-light px-5 py-5 sm:px-8 sm:py-6">
 <div className="flex items-center gap-2 lg:hidden">
 <span className="text-caption font-bold uppercase tracking-wider text-text-muted">
 {t("step") || "Step"} {activeStep} / {stepsList.length}
 </span>
 </div>
 <h1 className="mt-1 text-xl font-bold tracking-tight text-text-primary sm:text-2xl lg:mt-0">
 {currentStepInfo?.title || title}
 </h1>
 {(currentStepInfo?.description || subtitle) && (
 <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-secondary">
 {currentStepInfo?.description || subtitle}
 </p>
 )}
 </header>

 <div ref={stepPanelRef} className="flex-1 px-5 py-6 sm:px-8 sm:py-7">
 <AnimatePresence mode="wait" custom={direction}>
 <motion.div key={activeStep} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit">
 {typeof renderStep === 'function' ? renderStep(activeStep) : children}
 </motion.div>
 </AnimatePresence>
 </div>

 <footer className="border-t border-border-light bg-background-secondary px-5 py-4 sm:px-8 sm:py-5">
 {footerElement}
 </footer>
 </section>
 </div>
 </div>
 </div>
 );
};
export default ListingWizard;

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react';
import { getWizardTheme, PREFLOW_WIZARD_VARIANT } from '../config/prefilterFlowUi.js';

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
  enter: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 34,
      mass: 0.8,
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2, ease: 'easeIn' },
  }),
};

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
  wizardVariant,
  headerEyebrow,
  continueLabel = 'Continue',
  layoutViewportLocked = false,
  onStepPick,
}) => {
  const uiKey = resolveWizardUiKey(wizardVariant);
  const t = getWizardTheme(uiKey);
  const stepScrollWell = t.stepScrollWell || 'border-gray-200 bg-white';
  const stepPanelRef = useRef(null);
  const [direction, setDirection] = useState(1);
  const prevStepRef = useRef(currentStep);

  const isLastStep = currentStep >= steps.length;
  const currentStepInfo = steps.find((s) => s.id === currentStep) || steps[0];
  const progress = steps.length ? (currentStep / steps.length) * 100 : 0;

  useEffect(() => {
    setDirection(currentStep > prevStepRef.current ? 1 : -1);
    prevStepRef.current = currentStep;
    stepPanelRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentStep]);

  const shellClass = layoutViewportLocked
    ? `flex flex-col flex-1 min-h-0 w-full overflow-hidden bg-gray-50/50`
    : t.shell;

  const isComposerDock = layoutViewportLocked && uiKey === PREFLOW_WIZARD_VARIANT.COMPOSER;

  /* ── Composer Dock (Create form: locked viewport) ── */
  if (isComposerDock) {
    return (
      <div className={shellClass}>
        <header className="shrink-0 border-b border-zinc-200/60 wizard-glass-elevated">
          <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 py-3.5 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={onBack} className={t.cancelBtn}>
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
              <span className="tabular-nums text-[11px] text-zinc-500">
                {currentStep}/{steps.length}
              </span>
            </div>

            <nav className="flex flex-wrap items-baseline gap-x-0.5 gap-y-1 text-[11px] text-zinc-500" aria-label="Steps">
              {steps.map((step, idx) => {
                const isActive = currentStep === step.id;
                const done = currentStep > step.id;
                const canGoBack = typeof onStepPick === 'function' && step.id < currentStep;
                const label = (step.title || `Step ${step.id}`).trim();
                const piece = canGoBack ? (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onStepPick(step.id)}
                    className="max-w-[9rem] truncate text-left text-zinc-500 underline decoration-zinc-300/80 underline-offset-2 transition-colors hover:text-zinc-900 hover:decoration-zinc-500"
                  >
                    {label}
                  </button>
                ) : (
                  <span
                    key={step.id}
                    className={`max-w-[9rem] truncate ${isActive ? 'font-medium text-zinc-950' : done ? 'text-zinc-600' : 'text-zinc-400'}`}
                  >
                    {label}
                  </span>
                );
                return (
                  <span key={step.id} className="inline-flex items-baseline gap-x-0.5">
                    {idx > 0 ? <span className="px-0.5 text-zinc-300">·</span> : null}
                    {piece}
                  </span>
                );
              })}
            </nav>

            {/* Shimmer progress bar */}
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full wizard-progress-fill transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col px-4 sm:px-5">
          <div className="shrink-0 pt-5 pb-1">
            <h1 className="text-[15px] font-medium leading-snug tracking-tight text-zinc-950 sm:text-base">
              {currentStepInfo?.title || title}
            </h1>
            {(currentStepInfo?.description || subtitle) && (
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                {currentStepInfo?.description || subtitle}
              </p>
            )}
          </div>
          <div
            ref={stepPanelRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-28 pt-2 [-webkit-overflow-scrolling:touch]"
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {typeof renderStep === 'function' && renderStep(currentStep)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <footer
          className={`${t.bottomBar} shrink-0 mt-auto pb-[max(1rem,env(safe-area-inset-bottom))]`}
        >
          <div className="mx-auto max-w-lg px-4 py-3 sm:px-5">
            {footerExtra ? <div className="mb-3">{footerExtra}</div> : null}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={currentStep === 1 ? onBack : onPrev}
                className={t.footerBackBtn}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <div className="flex items-center gap-2">
                {onSaveDraft && isLastStep && (
                  <button
                    type="button"
                    onClick={onSaveDraft}
                    disabled={isLoading || !canSubmit}
                    className={`${t.draftBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <Save className="h-3 w-3" />
                    Draft
                  </button>
                )}
                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onNext();
                    }}
                    disabled={!canSubmit}
                    className={t.primaryBtn}
                  >
                    {continueLabel}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : lastStepAction ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      lastStepAction.onClick?.();
                    }}
                    disabled={Boolean(lastStepAction.disabled)}
                    className={t.primaryBtn}
                  >
                    {lastStepAction.label}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onSubmit) onSubmit(e);
                    }}
                    disabled={isLoading || !canSubmit}
                    className={t.primaryBtn}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Publishing…
                      </>
                    ) : (
                      <>
                        {onSaveDraft ? 'Continue to payment' : 'Save'}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  /* ── Standard wizard layout ── */
  return (
    <div className={shellClass}>
      {/* ── Top bar with step indicators ── */}
      <div className={`${t.stickyOuter} shrink-0 wizard-glass-elevated`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <button type="button" onClick={onBack} className={t.cancelBtn}>
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-sm font-medium">Cancel</span>
            </button>

            {/* Step circles */}
            <div className="flex max-w-[min(60vw,18rem)] items-center gap-1 overflow-x-auto py-1 sm:max-w-none sm:gap-2">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 sm:h-7 sm:w-7 sm:text-[11px] ${
                        isActive
                          ? `${t.stepActiveMob} wizard-step-pulse`
                          : isCompleted
                            ? t.stepDoneMob
                            : t.stepTodoMob
                      }`}
                    >
                      {isCompleted ? (
                        <span className="wizard-check-bounce inline-flex">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        step.id
                      )}
                    </div>
                    {step.id < steps.length && (
                      <div
                        className={`h-0.5 rounded-full transition-all duration-500 ease-out sm:w-6 ${
                          isCompleted
                            ? `${t.connectorDone} w-4`
                            : `${t.connectorTodo} w-3`
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <span className={`hidden tabular-nums text-xs font-medium sm:block ${t.stepMeta}`}>
              Step {currentStep}/{steps.length}
            </span>
          </div>
        </div>

        {/* Shimmer progress bar */}
        <div className={`h-1 w-full ${t.progressTrack}`}>
          <div
            className="h-full wizard-progress-fill rounded-r-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* ── Sidebar step rail (desktop) ── */}
          <div className="hidden lg:col-span-3 lg:block">
            <nav className={layoutViewportLocked ? 'sticky top-20 space-y-1' : 'sticky top-24 space-y-1'} aria-label="Form steps">
              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const goBackHere = typeof onStepPick === 'function' && step.id < currentStep;

                const rowInner = (
                  <>
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 ${
                        isActive ? t.sidebarStepActive : isCompleted ? t.sidebarStepDone : t.sidebarStepTodo
                      }`}
                    >
                      {isCompleted ? (
                        <span className="wizard-check-bounce inline-flex">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <p
                        className={`text-xs font-semibold transition-colors duration-200 ${
                          isActive ? t.sidebarTitleActive : isCompleted ? t.sidebarTitleDone : t.sidebarTitleTodo
                        }`}
                      >
                        {step.title}
                      </p>
                      {step.description && isActive ? (
                        <p className={`mt-0.5 line-clamp-2 ${t.sidebarStepDesc}`}>{step.description}</p>
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
                      className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/40"
                    >
                      {rowInner}
                    </button>
                  );
                }

                return (
                  <div
                    key={step.id}
                    className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${
                      isActive
                        ? 'bg-zinc-50/80 shadow-sm border border-zinc-200/50'
                        : ''
                    }`}
                  >
                    {/* Active bar indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="wizard-sidebar-indicator"
                        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-zinc-900"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {rowInner}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* ── Step content panel ── */}
          <div className="flex flex-col lg:col-span-9">
            <div className="shrink-0 mb-8 wizard-fade-in">
              {headerEyebrow && t.eyebrowWrap ? (
                <div className={t.eyebrowWrap}>
                  <span className={t.eyebrowBadge}>{headerEyebrow}</span>
                </div>
              ) : null}
              <div className="mb-1.5 flex items-center gap-2">
                <h1 className={`text-xl font-bold tracking-tight sm:text-2xl ${t.pageTitle}`}>
                  {currentStepInfo?.title || title}
                </h1>
              </div>
              <p className={`text-sm ${t.descMuted}`}>{currentStepInfo?.description || subtitle}</p>
            </div>

            <div
              ref={stepPanelRef}
              className={
                layoutViewportLocked
                  ? `min-h-0 flex-1 overflow-y-auto overscroll-y-contain rounded-2xl border p-4 sm:p-5 ${stepScrollWell}`
                  : `min-h-[380px]`
              }
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {typeof renderStep === 'function' && renderStep(currentStep)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className={`${t.bottomBar} shrink-0`}>
        <div className="mx-auto max-w-5xl px-4 py-3.5 sm:px-6 lg:px-8">
          {footerExtra ? <div className="mb-3">{footerExtra}</div> : null}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={currentStep === 1 ? onBack : onPrev}
              className={t.footerBackBtn}
            >
              <ChevronLeft className="h-4 w-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            <div className="flex items-center gap-2.5">
              {onSaveDraft && isLastStep && (
                <button
                  type="button"
                  onClick={onSaveDraft}
                  disabled={isLoading || !canSubmit}
                  className={`${t.draftBtnClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Draft
                </button>
              )}

              {!isLastStep ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onNext();
                  }}
                  disabled={!canSubmit}
                  className={t.primaryBtn}
                >
                  {continueLabel}
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              ) : lastStepAction ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    lastStepAction.onClick?.();
                  }}
                  disabled={Boolean(lastStepAction.disabled)}
                  className={t.primaryBtn}
                >
                  {lastStepAction.label}
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSubmit) onSubmit(e);
                  }}
                  disabled={isLoading || !canSubmit}
                  className={t.primaryBtn}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      {onSaveDraft ? 'Publish Now (Pay Fee)' : 'Save Changes'}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingWizard;

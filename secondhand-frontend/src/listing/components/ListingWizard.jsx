import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import Button from '../../common/components/ui/Button.jsx';

/**
 * Step shell for the listing form (create and edit): compact title row, a vertical step list on
 * desktop (segmented bar on smaller screens), the step's card, and a sticky footer row of actions.
 */
const ListingWizard = ({
  title,
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
  children,
  headerExtra = null,
  footerExtra = null,
  lastStepAction = null,
  continueLabel,
  submitLabel,
  onStepPick
}) => {
  const { t } = useTranslation();
  const stepsList = steps.length > 0 ? steps : [{ id: 1, title }];
  const activeStep = currentStep;
  const isLastStep = activeStep >= stepsList.length;
  const current = stepsList.find(s => s.id === activeStep) || stepsList[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeStep]);

  const handlePrimary = (e) => {
    e.preventDefault();
    if (!isLastStep) onNext?.();
    else if (lastStepAction) lastStepAction.onClick?.();
    else onSubmit?.(e);
  };

  let primaryLabel = continueLabel || t('continue', 'Devam et');
  if (isLastStep) primaryLabel = lastStepAction?.label || submitLabel || t('publish_listing', 'İlanı yayınla');

  return (
    <div className="min-h-screen bg-background-page">
      <PageContainer className="pt-5 sm:pt-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-2 w-9 shrink-0 !px-0"
            aria-label={t('cancel', 'Vazgeç')}
            title={t('cancel', 'Vazgeç')}
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
          <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight text-text-primary">
            {title || current?.title}
          </h1>
        </div>

        {/* Phones and tablets: step counter with a segmented bar. */}
        <div className="mt-4 flex items-center gap-3 lg:hidden">
          <span className="shrink-0 text-sm tabular-nums text-text-tertiary">
            {t('wizard_step_of', { defaultValue: 'Adım {{current}}/{{total}}', current: activeStep, total: stepsList.length })}
          </span>
          <ol className="flex flex-1 gap-1.5" aria-hidden>
            {stepsList.map(step => (
              <li key={step.id} className={`h-1 flex-1 rounded-full ${step.id <= activeStep ? 'bg-accent-teal' : 'bg-border'}`} />
            ))}
          </ol>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Desktop: vertical step list; finished steps jump back when onStepPick is given. */}
          <nav aria-label={t('form_steps', 'Form adımları')} className="hidden lg:col-span-3 lg:block">
            <ol className="sticky top-24 space-y-1">
              {stepsList.map((step, index) => {
                const done = step.id < activeStep;
                const active = step.id === activeStep;
                const canPick = done && typeof onStepPick === 'function';
                const marker = (
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums ${
                      active
                        ? 'border-accent-teal bg-accent-teal text-white'
                        : done
                          ? 'border-accent-teal bg-accent-teal-50 text-accent-teal-800'
                          : 'border-border bg-background-primary text-text-tertiary'
                    }`}
                    aria-hidden
                  >
                    {done ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : index + 1}
                  </span>
                );
                const body = (
                  <>
                    {marker}
                    <span className="min-w-0">
                      <span className={`block text-sm ${active ? 'font-semibold text-text-primary' : done ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                        {step.title}
                      </span>
                      {active && step.description && (
                        <span className="mt-0.5 block text-sm text-text-tertiary">{step.description}</span>
                      )}
                    </span>
                  </>
                );
                const rowClass = 'flex w-full items-start gap-3 rounded px-3 py-2.5 text-left';
                return (
                  <li key={step.id} aria-current={active ? 'step' : undefined}>
                    {canPick ? (
                      <button
                        type="button"
                        onClick={() => onStepPick(step.id)}
                        className={`${rowClass} transition-colors duration-150 hover:bg-background-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus`}
                      >
                        {body}
                      </button>
                    ) : (
                      <div className={rowClass}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="min-w-0 lg:col-span-9">
            <section className="rounded border border-border-light bg-background-primary shadow-sm">
              <header className="flex flex-col gap-3 border-b border-border-light px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-text-primary">{current?.title || title}</h2>
                  {current?.description && <p className="mt-0.5 text-sm text-text-secondary">{current.description}</p>}
                </div>
                {headerExtra && <div className="flex shrink-0 flex-wrap items-center gap-2">{headerExtra}</div>}
              </header>
              <div className="p-5 sm:p-6">
                {typeof renderStep === 'function' ? renderStep(activeStep) : children}
              </div>
              <footer className="sticky bottom-0 z-10 rounded-b border-t border-border-light bg-background-primary px-5 py-3 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {activeStep > 1 ? (
                    <Button variant="ghost" onClick={onPrev} className="w-full sm:w-auto">
                      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                      {t('back', 'Geri')}
                    </Button>
                  ) : <span className="hidden sm:block" />}

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                    {onSaveDraft && isLastStep && (
                      <Button variant="secondary" onClick={onSaveDraft} disabled={isLoading || !canSubmit} className="w-full sm:w-auto">
                        {t('save_draft', 'Taslak olarak kaydet')}
                      </Button>
                    )}
                    <Button
                      onClick={handlePrimary}
                      disabled={isLoading || !canSubmit || Boolean(isLastStep && lastStepAction?.disabled)}
                      className="w-full sm:w-auto"
                    >
                      {isLoading && isLastStep ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden strokeWidth={1.5} />
                          {t('publishing', 'Yayınlanıyor…')}
                        </>
                      ) : (
                        <>
                          {primaryLabel}
                          {!isLastStep && <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </footer>
            </section>

            {footerExtra && <div className="mt-4">{footerExtra}</div>}

            <div className="pb-8" />
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default ListingWizard;

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import Button from '../../common/components/ui/Button.jsx';

/**
 * Plain step shell for the listing form (create and edit): back link, step counter with a segmented
 * progress bar, the step's title, its content, and one footer row of actions.
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
    <div className="min-h-screen bg-background-secondary">
      <PageContainer narrow className="py-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="-ml-3" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            <span>{t('cancel', 'Vazgeç')}</span>
          </Button>
          {title && <span className="truncate text-sm text-text-tertiary">{title}</span>}
        </div>

        <nav aria-label={t('form_steps', 'Form adımları')}>
          <p className="text-sm tabular-nums text-text-tertiary">
            {t('wizard_step_of', { defaultValue: 'Adım {{current}}/{{total}}', current: activeStep, total: stepsList.length })}
          </p>
          <ol className="mt-2 flex gap-1.5">
            {stepsList.map(step => {
              const done = step.id < activeStep;
              const canPick = done && typeof onStepPick === 'function';
              const bar = (
                <span className={`block h-1 rounded-full ${step.id <= activeStep ? 'bg-primary' : 'bg-border'}`} aria-hidden />
              );
              return (
                <li key={step.id} className="flex-1" aria-current={step.id === activeStep ? 'step' : undefined}>
                  {canPick ? (
                    <button type="button" onClick={() => onStepPick(step.id)} className="block w-full py-1" title={step.title}>
                      {bar}
                      <span className="sr-only">{step.title}</span>
                    </button>
                  ) : (
                    <span className="block py-1" title={step.title}>
                      {bar}
                      <span className="sr-only">{step.title}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{current?.title || title}</h1>
            {current?.description && <p className="mt-1.5 text-sm text-text-secondary">{current.description}</p>}
          </div>
          {headerExtra && <div className="shrink-0">{headerExtra}</div>}
        </div>

        <div className="mt-6 rounded border border-border bg-background-primary p-5 sm:p-6">
          {typeof renderStep === 'function' ? renderStep(activeStep) : children}
        </div>

        {footerExtra && <div className="mt-4">{footerExtra}</div>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {activeStep > 1 ? (
            <Button variant="ghost" onClick={onPrev}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {t('back', 'Geri')}
            </Button>
          ) : <span className="hidden sm:block" />}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            {onSaveDraft && isLastStep && (
              <Button variant="secondary" onClick={onSaveDraft} disabled={isLoading || !canSubmit}>
                {t('save_draft', 'Taslak olarak kaydet')}
              </Button>
            )}
            <Button
              onClick={handlePrimary}
              disabled={isLoading || !canSubmit || Boolean(isLastStep && lastStepAction?.disabled)}
            >
              {isLoading && isLastStep ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
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
      </PageContainer>
    </div>
  );
};

export default ListingWizard;

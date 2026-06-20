import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useFormState } from '../../common/forms/hooks/useFormState.js';
import { useFormSubmission } from '../../common/forms/hooks/useFormSubmission.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import ListingWizard from './ListingWizard.jsx';
import ListingBasics from '../../common/components/forms/ListingBasics.jsx';
import LocationFields from '../../common/components/forms/LocationFields.jsx';
import ImageUpload from '../../common/components/ImageUpload.jsx';
import EnumDropdown from '../../common/components/ui/EnumDropdown.jsx';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';
import { getListingConfig } from '../config/listingConfig.js';
import { validationRegistry } from '../validation/ValidationRegistry.js';
import { resolveEnumLabel, toDisplayText } from '../utils/listingDisplayFormat.js';
import { ROUTES } from '../../common/constants/routes.js';
import { PREFLOW_WIZARD_VARIANT } from '../config/prefilterFlowUi.js';
import { AlertCircle, ImageIcon, MapPin, Package, FileText, CheckCircle2 } from 'lucide-react';
import { cacheService } from '../../common/services/cacheService.js';

/* ── Small UI Primitives ───────────────────────────────────── */

const FieldError = ({
  error
}) => {
  const {
    t
  } = useTranslation();
  if (!error) return null;
  return <motion.p initial={{
    opacity: 0,
    y: -4
  }} animate={{
    opacity: 1,
    y: 0
  }} className="mt-1.5 flex items-center gap-1 text-xs text-status-error">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {error}
    </motion.p>;
};
const SectionCard = ({
  title,
  description,
  icon: Icon,
  children
}) => {
  const {
    t
  } = useTranslation();
  return <div className="wizard-glass-elevated wizard-card-lift rounded-xl overflow-visible">
      <div className="flex items-center gap-3 border-b border-zinc-100/60 px-5 py-3.5">
        {Icon && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-50 to-zinc-100 shadow-sm">
            <Icon className="h-4 w-4 text-zinc-600" />
          </div>}
        <div>
          <h3 className="text-sm font-medium text-text-primary">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>;
};
const ToggleCardField = ({
  name,
  label,
  description,
  value,
  onToggle
}) => <div className={`flex cursor-pointer select-none items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-200 ${value ? 'border-zinc-900/20 bg-zinc-50/80 shadow-sm border-l-[3px] border-l-zinc-900' : 'border-zinc-200/60 bg-background-primary hover:border-zinc-300 hover:shadow-sm'}`} onClick={onToggle} role="button" tabIndex={0} onKeyDown={e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onToggle();
  }
}}>
    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${value ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300 bg-background-primary'}`}>
      {value && <motion.svg initial={{
      scale: 0
    }} animate={{
      scale: 1
    }} transition={{
      type: 'spring',
      stiffness: 500,
      damping: 25
    }} className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </motion.svg>}
    </div>
    <input id={name} type="checkbox" name={name} checked={Boolean(value)} onChange={() => onToggle()} className="sr-only" />
    <div>
      <label htmlFor={name} className="block cursor-pointer text-sm font-medium text-zinc-900">
        {label}
      </label>
      {description && <p className="mt-0.5 text-body text-zinc-500">
          {description}
        </p>}
    </div>
  </div>;

/* ── Input Classes ─────────────────────────────────────────── */

const inputBase = 'w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none transition-all duration-200';
const inputNormal = `${inputBase} border-zinc-200/60 bg-background-primary focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 wizard-input-glow hover:border-zinc-300`;
const inputError = `${inputBase} border-red-300 bg-status-error-bg/30 focus:border-red-400 focus:ring-2 focus:ring-red-500/10`;

/* ── Main Form ─────────────────────────────────────────────── */

const GenericListingForm = ({
  listingType,
  onBack,
  initialData = null,
  isEdit = false,
  onUpdate = null,
  submitFunction,
  isLoading = false,
  successMessage,
  errorMessage,
  redirectRoute
}) => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const {
    enums
  } = useEnums();
  const listingConfig = useMemo(() => getListingConfig(listingType), [listingType]);
  const formSchema = listingConfig?.formSchema || null;
  const uiChrome = useMemo(() => !isEdit ? 'composer' : 'neutral', [isEdit]);
  const sectionTone = uiChrome === 'composer' ? 'composer' : 'neutral';
  const toggleChrome = uiChrome === 'composer' ? 'composer' : 'default';
  const labelClass = uiChrome === 'composer' ? 'text-zinc-950' : 'text-zinc-900';
  const descFieldClass = uiChrome === 'composer' ? 'text-zinc-500' : 'text-zinc-400';
  const fieldInputOk = useMemo(() => uiChrome === 'composer' ? 'w-full rounded-lg border border-zinc-200/60 bg-background-primary px-3.5 py-2.5 text-sm text-zinc-950 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/5 hover:border-zinc-300 wizard-input-glow' : inputNormal, [uiChrome]);
  const fieldInputErr = useMemo(() => uiChrome === 'composer' ? 'w-full rounded-lg border border-red-200 bg-status-error-bg/40 px-3.5 py-2.5 text-sm text-zinc-950 outline-none transition-all duration-200 focus:border-red-400 focus:ring-2 focus:ring-red-400/25' : inputError, [uiChrome]);
  const wizardSteps = useMemo(() => {
    const steps = Array.isArray(formSchema?.steps) ? formSchema.steps : [];
    if (!steps.length) return steps;
    const maxId = Math.max(...steps.map(s => Number(s?.id ?? 0)));
    const summaryId = Number.isFinite(maxId) ? maxId + 1 : steps.length + 1;
    return [...steps, {
      id: summaryId,
      title: 'Review',
      description: 'Check the summary, then publish or save as draft.',
      kind: 'summary'
    }];
  }, [formSchema?.steps]);
  const normalizedInitialData = useMemo(() => {
    if (!formSchema) return initialData || null;
    if (typeof formSchema.normalizeInitialData !== 'function') return initialData || null;
    return formSchema.normalizeInitialData(initialData || null);
  }, [formSchema, initialData]);
  const mergedInitialData = useMemo(() => {
    const base = formSchema?.initialData && typeof formSchema.initialData === 'object' ? formSchema.initialData : {};
    return {
      ...base,
      ...(normalizedInitialData || {})
    };
  }, [formSchema?.initialData, normalizedInitialData]);
  const totalSteps = wizardSteps?.length || 3;
  const draftKey = `listing_draft_${listingType}`;
  const initialDataWithDraft = useMemo(() => {
    if (isEdit) return mergedInitialData;
    try {
      const draft = cacheService.get(draftKey);
      if (draft && typeof draft === 'object') {
        return {
          ...mergedInitialData,
          ...draft
        };
      }
    } catch (e) {
      console.error('Failed to parse draft from cache', e);
    }
    return mergedInitialData;
  }, [mergedInitialData, isEdit, draftKey]);
  const formState = useFormState({
    initialData: initialDataWithDraft,
    totalSteps,
    listingType,
    validateStep: (step, data) => validationRegistry.getStepErrors(listingType, step, data, enums),
    validateAll: data => validationRegistry.getAllErrors(listingType, data, enums)
  });
  const submitIntentRef = React.useRef('DRAFT');
  const {
    handleSubmit
  } = useFormSubmission({
    submitFunction: isEdit && onUpdate ? onUpdate : submitFunction,
    formState,
    successMessage: successMessage || (isEdit ? 'Listing updated successfully!' : submitIntentRef.current === 'DRAFT' ? 'Listing saved as draft!' : 'Listing created! Redirecting to payment...'),
    errorMessage: errorMessage || (isEdit ? 'Failed to update listing' : 'Failed to save listing'),
    onSuccess: response => {
      if (!isEdit) {
        cacheService.remove(draftKey);
        cacheService.remove(`${draftKey}_step`);
      }
      if (isEdit || submitIntentRef.current === 'DRAFT') {
        navigate(redirectRoute || ROUTES.MY_LISTINGS);
      } else {
        const id = response?.id || response?.data?.id;
        if (id) {
          navigate(`${ROUTES.PAY_LISTING_FEE}?listingId=${id}`);
        } else {
          // Fallback if ID is null
          navigate(redirectRoute || ROUTES.MY_LISTINGS);
        }
      }
    }
  });
  const {
    formData,
    errors,
    currentStep,
    handleInputChange,
    handleDropdownChange,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep
  } = formState;

  useEffect(() => {
    if (!isEdit && formData) {
      cacheService.set(draftKey, formData);
    }
  }, [formData, isEdit, draftKey]);

  useEffect(() => {
    if (!isEdit && currentStep) {
      cacheService.set(`${draftKey}_step`, String(currentStep));
    }
  }, [currentStep, isEdit, draftKey]);

  // Restore step on mount
  useEffect(() => {
    if (isEdit) return;
    try {
      const savedStep = cacheService.get(`${draftKey}_step`);
      if (savedStep) {
        const parsedStep = parseInt(savedStep, 10);
        if (Number.isInteger(parsedStep) && parsedStep > 1 && parsedStep <= totalSteps) {
          goToStep(parsedStep);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved step from cache', e);
    }
  }, [goToStep, isEdit, totalSteps, draftKey]);
  const ctx = useMemo(() => {
    const setValue = (field, value) => handleDropdownChange(field, value);
    const setChecked = (field, checked) => handleInputChange({
      target: {
        name: field,
        checked,
        type: 'checkbox'
      }
    });
    const getName = (enumKey, idOrValue, {
      upper = false
    } = {}) => {
      const n = resolveEnumLabel(enums, enumKey, idOrValue);
      return upper ? n.toUpperCase() : n;
    };
    return {
      enums,
      formData,
      errors,
      setValue,
      setChecked,
      getName,
      isEdit
    };
  }, [enums, errors, formData, handleDropdownChange, handleInputChange, isEdit]);
  useEffect(() => {
    if (!formSchema?.derivedFields?.length) return;
    formSchema.derivedFields.forEach(d => {
      const sourceValue = formData?.[d.sourceField];
      const computed = ctx.getName(d.enumKey, sourceValue, {
        upper: Boolean(d.uppercase)
      });
      const nextValue = typeof d.transform === 'function' ? d.transform(computed, ctx) : computed;
      const currentValue = String(formData?.[d.targetField] ?? '');
      if (String(nextValue ?? '') !== currentValue) {
        ctx.setValue(d.targetField, nextValue ?? '');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, formSchema]); 

  useEffect(() => {
    if (!formSchema?.effects?.length) return;
    formSchema.effects.forEach(fn => {
      if (typeof fn === 'function') fn(ctx);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, formSchema]);

  /* ── Field Renderer ────────────────────────────────────── */

  const renderField = field => {
    const isVisible = typeof field.visibleWhen === 'function' ? field.visibleWhen(ctx) : true;
    if (!isVisible) return null;
    const value = formData?.[field.name];
    const isRequired = Boolean(field.required) || (typeof field.requiredWhen === 'function' ? Boolean(field.requiredWhen(ctx)) : false);
    const label = isRequired ? `${field.label} *` : field.label;
    const error = errors?.[field.name];
    if (field.type === 'enum') {
      const options = typeof field.getOptions === 'function' ? field.getOptions(ctx) : null;
      const disabled = typeof field.disabledWhen === 'function' ? field.disabledWhen(ctx) : Boolean(field.disabled);
      return <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
          <EnumDropdown label={label} enumKey={field.enumKey} value={value} onChange={v => {
          if (typeof field.onChange === 'function') {
            field.onChange({
              value: v,
              ctx
            });
          } else {
            handleDropdownChange(field.name, v);
          }
        }} options={options} disabled={disabled} usePortal={true} />
          {field.description && <p className={`mt-1.5 text-xs ${descFieldClass}`}>{field.description}</p>}
          <FieldError error={error} />
        </div>;
    }
    if (field.type === 'searchable') {
      const options = typeof field.getOptions === 'function' ? field.getOptions(ctx) : [];
      const disabled = typeof field.disabledWhen === 'function' ? field.disabledWhen(ctx) : Boolean(field.disabled);
      return <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
          <SearchableDropdown label={label} options={options} disabled={disabled} selectedValues={value ? [value] : []} onSelectionChange={values => {
          const v = values?.[0] ?? '';
          if (typeof field.onChange === 'function') {
            field.onChange({
              value: v,
              ctx
            });
          } else {
            handleDropdownChange(field.name, v);
          }
        }} placeholder={field.placeholder || 'Select...'} searchPlaceholder={field.searchPlaceholder || 'Search...'} multiple={false} usePortal={true} />
          <FieldError error={error} />
        </div>;
    }
    if (field.type === 'toggle') {
      return <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
          <ToggleCardField name={field.name} label={field.label} description={field.description} value={Boolean(value)} chrome={toggleChrome} onToggle={() => {
          const next = !Boolean(value);
          if (typeof field.onChange === 'function') {
            field.onChange({
              value: next,
              ctx
            });
          } else {
            ctx.setChecked(field.name, next);
          }
        }} />
          <FieldError error={error} />
        </div>;
    }
    if (field.type === 'textarea') {
      return <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined} className={field.fullWidth ? 'md:col-span-2 lg:col-span-3' : undefined}>
          <label className={`mb-2 block text-sm font-medium ${labelClass}`}>{label}</label>
          <textarea name={field.name} value={value || ''} onChange={handleInputChange} rows={field.rows || 3} placeholder={field.placeholder || ''} className={`${error ? fieldInputErr : fieldInputOk} resize-none`} />
          <FieldError error={error} />
        </div>;
    }
    const inputType = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';
    return <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
        <label className={`mb-2 block text-sm font-medium ${labelClass}`}>{label}</label>
        <input type={inputType} name={field.name} value={value ?? ''} onChange={handleInputChange} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder || ''} className={error ? fieldInputErr : fieldInputOk} />
        <FieldError error={error} />
      </div>;
  };

  /* ── Step Renderers ────────────────────────────────────── */

  const renderDetailsStep = step => {
    const sections = step?.sections || [];
    return <div className="space-y-6 wizard-stagger">
        {sections.map(section => {
        const isVisible = typeof section.visibleWhen === 'function' ? section.visibleWhen(ctx) : true;
        if (!isVisible) return null;
        return <SectionCard key={section.id || section.title} title={section.title} description={section.description}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(section.fields || []).map(renderField)}
              </div>
            </SectionCard>;
      })}
      </div>;
  };
  const renderMediaLocationStep = () => {
    return <div className="space-y-6 wizard-stagger">
        <SectionCard title={t("photos")} description="Upload images of your item" icon={ImageIcon}>
          <ImageUpload onImageUpload={imageUrl => ctx.setValue('imageUrl', imageUrl)} onImageRemove={() => ctx.setValue('imageUrl', '')} imageUrl={formData?.imageUrl} disabled={false} />
        </SectionCard>
        <SectionCard title={t("location")} description="Where is the item located?" icon={MapPin}>
          <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
        </SectionCard>
      </div>;
  };
  const formatSummaryValue = (field, rawValue) => {
    const text = toDisplayText(rawValue, enums, field?.enumKey);
    return text ?? '';
  };
  const renderSummaryStep = () => {
    const basics = [{
      label: 'Title',
      value: String(formData?.title ?? '')
    }, {
      label: 'Price',
      value: formData?.price != null && String(formData.price).trim() ? `${formData.price} ${formData?.currency || ''}`.trim() : ''
    }, {
      label: 'Quantity',
      value: formData?.quantity != null && String(formData.quantity).trim() ? String(formData.quantity) : ''
    }].filter(x => String(x.value || '').trim());
    const location = [{
      label: 'City',
      value: String(formData?.city ?? '')
    }, {
      label: 'District',
      value: String(formData?.district ?? '')
    }, {
      label: 'Neighborhood',
      value: formData?.neighborhoodKey ? formData.neighborhoodKey.split('_').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''
    }].filter(x => String(x.value || '').trim());
    const detailFields = [];
    (formSchema?.steps || []).forEach(step => {
      if (step?.kind !== 'details') return;
      (step?.sections || []).forEach(section => {
        const sectionVisible = typeof section.visibleWhen === 'function' ? Boolean(section.visibleWhen(ctx)) : true;
        if (!sectionVisible) return;
        (section.fields || []).forEach(field => {
          const visible = typeof field.visibleWhen === 'function' ? Boolean(field.visibleWhen(ctx)) : true;
          if (!visible) return;
          const value = formatSummaryValue(field, formData?.[field.name]);
          if (!value) return;
          detailFields.push({
            label: field.label || field.name,
            value
          });
        });
      });
    });
    const typeLabel = listingConfig?.label || listingType;
    return <div className="space-y-4 wizard-stagger">
        {/* Hero preview card */}
        <div className="wizard-glass-elevated rounded-xl overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center rounded-lg bg-zinc-100/80 px-2.5 py-1 text-caption font-semibold uppercase tracking-wider text-zinc-600">
                  {typeLabel}
                </span>
                <h3 className={`text-sm font-medium text-text-primary mt-2.5 tracking-tight ${labelClass}`}>{formData?.title || 'Untitled'}</h3>
                {formData?.description && <p className={`mt-2 whitespace-pre-wrap line-clamp-3 text-sm leading-relaxed ${descFieldClass}`}>{formData.description}</p>}
              </div>
              {formData?.imageUrl && <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200/50 bg-zinc-50 shadow-sm">
                  <img src={formData.imageUrl} alt={t("listing")} className="h-full w-full object-cover" />
                </div>}
            </div>
          </div>
        </div>

        {basics.length > 0 && <SummarySection title={t("basics")} icon={Package} rows={basics} />}
        {location.length > 0 && <SummarySection title={t("location")} icon={MapPin} rows={location} />}
        {detailFields.length > 0 && <SummarySection title={t("details")} icon={FileText} rows={detailFields} />}

        {/* Ready indicator */}
        <motion.div initial={{
        opacity: 0,
        y: 8
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="flex items-center gap-2.5 rounded-xl border border-emerald-200/60 bg-status-success-bg/50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">{t("your_listing_is_ready_to_publish")}</p>
        </motion.div>
      </div>;
  };
  const renderStep = stepId => {
    const step = wizardSteps?.find(s => Number(s.id) === Number(stepId)) || null;
    const kind = step?.kind || (stepId === 1 ? 'basics' : stepId === totalSteps ? 'mediaLocation' : 'details');
    if (kind === 'basics') {
      const showQuantity = Boolean(step?.showQuantity);
      return <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} showQuantity={showQuantity} wizardTone={uiChrome === 'composer' ? 'composer' : 'default'} />;
    }
    if (kind === 'mediaLocation') return renderMediaLocationStep();
    if (kind === 'details') return renderDetailsStep(step);
    if (kind === 'summary') return renderSummaryStep();
    return null;
  };
  const handleNext = () => {
    const ok = validateCurrentStep();
    if (ok) {
      nextStep();
      return;
    }
    notification.showError('Missing Information', 'Please check the highlighted fields and try again.');
    const firstErrorKey = Object.keys(errors || {})[0];
    if (firstErrorKey) {
      const el = document.querySelector(`[data-field="${CSS.escape(firstErrorKey)}"]`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  };
  const canGoForward = useMemo(() => {
    const step = wizardSteps?.find(s => Number(s.id) === Number(currentStep)) || null;
    if (step?.kind === 'mediaLocation') {
      return Boolean(String(formData?.city ?? '').trim() && String(formData?.district ?? '').trim());
    }
    return true;
  }, [wizardSteps, currentStep, formData?.city, formData?.district]);
  if (!formSchema) return null;
  return <ListingWizard title={typeof formSchema.getTitle === 'function' ? formSchema.getTitle({
    isEdit,
    listingType
  }) : isEdit ? 'Edit Listing' : 'Create Listing'} subtitle={typeof formSchema.getSubtitle === 'function' ? formSchema.getSubtitle({
    isEdit,
    listingType
  }) : isEdit ? 'Update your listing details' : undefined} steps={wizardSteps} currentStep={currentStep} onBack={onBack || (() => navigate(-1))} onNext={handleNext} onPrev={prevStep} onSubmit={e => {
    submitIntentRef.current = 'PUBLISH';
    handleSubmit(e);
  }} onSaveDraft={!isEdit ? e => {
    submitIntentRef.current = 'DRAFT';
    handleSubmit(e);
  } : undefined} isLoading={Boolean(isLoading)} canSubmit={canGoForward} renderStep={renderStep} wizardVariant={undefined} layoutViewportLocked={false} onStepPick={isEdit ? undefined : stepId => goToStep(stepId)} continueLabel="Continue" />;
};

/* ── Summary Section ────────────────────────────────────────── */

const SummarySection = ({
  title,
  icon: Icon,
  rows
}) => {
  const {
    t
  } = useTranslation();
  return <div className="wizard-glass-elevated rounded-xl overflow-hidden">
      <div className="border-b border-zinc-100/60 bg-zinc-50/50 px-4 py-2.5 flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-zinc-500" />}
        <h4 className="text-caption font-semibold uppercase tracking-wider text-zinc-600">{title}</h4>
      </div>
      <div className="divide-y divide-zinc-100/60">
        {rows.map((row, i) => <motion.div key={`${row.label}-${row.value}`} initial={{
        opacity: 0,
        x: -8
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: i * 0.05
      }} className="flex items-start justify-between gap-3 px-4 py-3">
            <span className="text-body text-zinc-500">{row.label}</span>
            <span className="text-right text-sm font-medium tabular-nums text-zinc-900">{row.value}</span>
          </motion.div>)}
      </div>
    </div>;
};
export default GenericListingForm;
import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
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
import { ImageIcon, MapPin, Package, FileText, CheckCircle2, Check } from 'lucide-react';
import { cacheService } from '../../common/services/cacheService.js';
import { FieldError, SectionCard } from '../../common/components/forms/FormPrimitives.jsx';
import { inputError, inputNormal } from '../../common/components/forms/inputStyles.js';
import { formatCurrency, parsePrice } from '../../common/formatters.js';

/* ── Small UI Primitives ───────────────────────────────────── */

const ToggleCardField = ({
  name,
  label,
  description,
  value,
  onToggle
}) => (
  <div
    className={`flex cursor-pointer select-none items-start gap-3 rounded border p-3.5 transition-colors ${
      value
        ? 'border-primary bg-background-secondary'
        : 'border-border-light bg-background-primary hover:border-card-border-hover'
    }`}
    onClick={onToggle}
    role="button"
    tabIndex={0}
    onKeyDown={e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }}
  >
    <div
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
        value
          ? 'border-primary bg-primary text-text-inverse'
          : 'border-border bg-background-primary'
      }`}
    >
      {value && <Check className="h-3 w-3 stroke-[2.5]" />}
    </div>
    <input
      id={name}
      type="checkbox"
      name={name}
      checked={Boolean(value)}
      onChange={() => onToggle()}
      className="sr-only"
    />
    <div className="min-w-0 flex-1">
      <label htmlFor={name} className="block cursor-pointer text-xs font-semibold text-text-primary">
        {label}
      </label>
      {description && (
        <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
          {description}
        </p>
      )}
    </div>
  </div>
);

/* ── Input Classes ─────────────────────────────────────────── */


/* ── Main Form ─────────────────────────────────────────────── */

const GenericListingForm = ({
 listingType,
 onBack,
 initialData = null,
 isEdit = false,
 onUpdate = null,
 redirectRoute
}) => {
 const {
 t
 } = useTranslation();
 const navigate = useNavigate();
 const location = useLocation();
 const notification = useNotification();
 const {
 enums
 } = useEnums();
 const listingConfig = useMemo(() => getListingConfig(listingType), [listingType]);
 const createMutation = useMutation({
 mutationFn: (data) => listingConfig.service.create(data)
 });
 const formSchema = listingConfig?.formSchema || null;
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
 const restoreDraft = location.state?.restoreDraft === true;
 const initialDataWithDraft = useMemo(() => {
 if (isEdit) return mergedInitialData;
 if (!restoreDraft) return mergedInitialData;
 
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
 }, [mergedInitialData, isEdit, draftKey, restoreDraft]);
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
 submitFunction: isEdit && onUpdate ? onUpdate : createMutation.mutateAsync,
 formState,
 successMessage: (isEdit ? 'Listing updated successfully!' : submitIntentRef.current === 'DRAFT' ? 'Listing saved as draft!' : 'Listing created! Redirecting to payment...'),
 errorMessage: (isEdit ? 'Failed to update listing' : 'Failed to save listing'),
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
 if (isEdit || !restoreDraft) return;
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
 }, [goToStep, isEdit, totalSteps, draftKey, restoreDraft]);
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
 return (
  <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
   <EnumDropdown
    label={label}
    enumKey={field.enumKey}
    value={value}
    onChange={v => {
     if (typeof field.onChange === 'function') {
      field.onChange({ value: v, ctx });
     } else {
      handleDropdownChange(field.name, v);
     }
    }}
    options={options}
    disabled={disabled}
    usePortal={true}
   />
   {field.description && <p className="mt-1 text-xs text-text-muted">{field.description}</p>}
   <FieldError error={error} />
  </div>
 );
 }
 if (field.type === 'searchable') {
 const options = typeof field.getOptions === 'function' ? field.getOptions(ctx) : [];
 const disabled = typeof field.disabledWhen === 'function' ? field.disabledWhen(ctx) : Boolean(field.disabled);
 return (
  <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
   <SearchableDropdown
    label={label}
    options={options}
    disabled={disabled}
    selectedValues={value ? [value] : []}
    onSelectionChange={values => {
     const v = values?.[0] ?? '';
     if (typeof field.onChange === 'function') {
      field.onChange({ value: v, ctx });
     } else {
      handleDropdownChange(field.name, v);
     }
    }}
    placeholder={field.placeholder || t("select", "Seçiniz...")}
    searchPlaceholder={field.searchPlaceholder || t("search", "Ara...")}
    multiple={false}
    usePortal={true}
   />
   <FieldError error={error} />
  </div>
 );
 }
 if (field.type === 'toggle') {
 return (
  <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
   <ToggleCardField
    name={field.name}
    label={field.label}
    description={field.description}
    value={Boolean(value)}
    onToggle={() => {
     const next = !value;
     if (typeof field.onChange === 'function') {
      field.onChange({ value: next, ctx });
     } else {
      ctx.setChecked(field.name, next);
     }
    }}
   />
   <FieldError error={error} />
  </div>
 );
 }
 if (field.type === 'textarea') {
 return (
  <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined} className={field.fullWidth ? 'md:col-span-2 lg:col-span-3' : undefined}>
   <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</label>
   <textarea
    name={field.name}
    value={value || ''}
    onChange={handleInputChange}
    rows={field.rows || 3}
    placeholder={field.placeholder || ''}
    className={`${error ? inputError : inputNormal} resize-none`}
   />
   <FieldError error={error} />
  </div>
 );
 }
 const inputType = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';
 return (
  <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
   <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</label>
   <input
    type={inputType}
    name={field.name}
    value={value ?? ''}
    onChange={handleInputChange}
    min={field.min}
    max={field.max}
    step={field.step}
    placeholder={field.placeholder || ''}
    className={error ? inputError : inputNormal}
   />
   <FieldError error={error} />
  </div>
 );
 };

 /* ── Step Renderers ────────────────────────────────────── */

 const renderDetailsStep = step => {
 const sections = step?.sections || [];
 return (
  <div className="space-y-8">
   {sections.map(section => {
    const isVisible = typeof section.visibleWhen === 'function' ? section.visibleWhen(ctx) : true;
    if (!isVisible) return null;
    return (
     <SectionCard key={section.id || section.title} title={section.title} description={section.description}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
       {(section.fields || []).map(renderField)}
      </div>
     </SectionCard>
    );
   })}
  </div>
 );
 };
 const renderMediaLocationStep = () => {
 return (
  <div className="space-y-8">
   <SectionCard title={t("photos", "Görseller")} description={t("photos_description", "Ürününüzün fotoğraflarını ekleyin")} icon={ImageIcon}>
    <ImageUpload onImageUpload={imageUrl => ctx.setValue('imageUrl', imageUrl)} onImageRemove={() => ctx.setValue('imageUrl', '')} imageUrl={formData?.imageUrl} disabled={false} />
   </SectionCard>
   <SectionCard title={t("location", "Konum")} description={t("location_description", "Ürün nerede bulunuyor?")} icon={MapPin}>
    <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
   </SectionCard>
  </div>
 );
 };
 const formatSummaryValue = (field, rawValue) => {
 const text = toDisplayText(rawValue, enums, field?.enumKey);
 return text ?? '';
 };
 const renderSummaryStep = () => {
 const basics = [
  { label: t("listing_title", "Başlık"), value: String(formData?.title ?? '') },
  {
   label: t("price", "Fiyat"),
   value: formData?.price != null && String(formData.price).trim()
    ? formatCurrency(parsePrice(formData.price), formData?.currency)
    : ''
  },
  {
   label: t("quantity", "Miktar"),
   value: formData?.quantity != null && String(formData.quantity).trim() ? String(formData.quantity) : ''
  }
 ].filter(x => String(x.value || '').trim());

 const location = [
  { label: t("city_i_l", "Şehir"), value: String(formData?.city ?? '') },
  { label: t("district_i_l_e", "İlçe"), value: String(formData?.district ?? '') },
  {
   label: t("neighborhood_mahalle", "Mahalle"),
   value: formData?.neighborhoodKey ? formData.neighborhoodKey.split('_').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''
  }
 ].filter(x => String(x.value || '').trim());

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
 return (
  <div className="space-y-6">
   {/* Hero preview card */}
   <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded border border-border-light bg-background-secondary p-4">
    <div className="min-w-0 flex-1">
     <span className="inline-flex items-center rounded-sm border border-border-light bg-background-primary px-2 py-0.5 text-xs font-semibold text-text-secondary">
      {typeLabel}
     </span>
     <h2 className="mt-2 text-base font-semibold text-text-primary">
      {formData?.title || t("untitled_listing", "İsimsiz İlan")}
     </h2>
     {formData?.description && (
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">
       {formData.description}
      </p>
     )}
     {formData?.price && (
      <p className="mt-2.5 text-base font-semibold tabular-nums text-text-primary">
       {formatCurrency(parsePrice(formData.price), formData?.currency)}
      </p>
     )}
    </div>
    {formData?.imageUrl && (
     <div className="h-20 w-20 shrink-0 overflow-hidden rounded border border-border-light bg-background-primary">
      <img src={formData.imageUrl} alt={t("listing", "Listing")} className="h-full w-full object-cover" />
     </div>
    )}
   </div>

   {basics.length > 0 && <SummarySection title={t("basics", "Temel Bilgiler")} icon={Package} rows={basics} />}
   {location.length > 0 && <SummarySection title={t("location", "Konum")} icon={MapPin} rows={location} />}
   {detailFields.length > 0 && <SummarySection title={t("details", "Detaylar")} icon={FileText} rows={detailFields} />}

   {/* Ready indicator */}
   <div className="flex items-center gap-2 rounded border border-border-light bg-background-secondary px-3.5 py-2.5">
    <span className="h-1.5 w-1.5 rounded-full bg-status-success shrink-0" />
    <p className="text-xs font-medium text-text-secondary">{t("your_listing_is_ready_to_publish", "İlanınız yayınlanmaya hazır.")}</p>
   </div>
  </div>
 );
 };
 const renderStep = stepId => {
 const step = wizardSteps?.find(s => Number(s.id) === Number(stepId)) || null;
 const kind = step?.kind || (stepId === 1 ? 'basics' : stepId === totalSteps ? 'mediaLocation' : 'details');
 if (kind === 'basics') {
 const showQuantity = Boolean(step?.showQuantity);
 return <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} showQuantity={showQuantity} />;
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
 } : undefined} isLoading={createMutation.isPending} canSubmit={canGoForward} renderStep={renderStep} wizardVariant={undefined} layoutViewportLocked={false} onStepPick={isEdit ? undefined : stepId => goToStep(stepId)} continueLabel="Continue" />;
};

/* ── Summary Section ────────────────────────────────────────── */

const SummarySection = ({
 title,
 icon: Icon,
 rows
}) => {
 return (
  <div className="rounded border border-border-light bg-background-primary overflow-hidden">
   <div className="border-b border-border-light bg-background-secondary/40 px-4 py-2.5 flex items-center gap-2">
    {Icon && <Icon className="h-3.5 w-3.5 text-text-secondary" strokeWidth={1.5} />}
    <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</h4>
   </div>
   <div className="divide-y divide-border-light">
    {rows.map((row) => (
     <div key={`${row.label}-${row.value}`} className="flex items-start justify-between gap-4 px-4 py-2 text-xs">
      <span className="text-text-secondary">{row.label}</span>
      <span className="text-right font-medium tabular-nums text-text-primary">{row.value}</span>
     </div>
    ))}
   </div>
  </div>
 );
};
export default GenericListingForm;
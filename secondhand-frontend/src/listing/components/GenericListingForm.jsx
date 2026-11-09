import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
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
import { getCreateFlowSelectorSteps, getListingConfig } from '../config/listingConfig.js';
import { fieldLabel, formText } from '../config/listingFormCopy.js';
import { PREFILTER_CATEGORY_COPY } from '../config/prefilterCopy.js';
import { isPrefilterValueFilled } from '../utils/prefilterSelection.js';
import Button from '../../common/components/ui/Button.jsx';
import { validationRegistry } from '../validation/ValidationRegistry.js';
import { resolveEnumLabel, toDisplayText } from '../utils/listingDisplayFormat.js';
import { ROUTES } from '../../common/constants/routes.js';
import { ImageIcon, MapPin, Package, FileText, Check } from 'lucide-react';
import { cacheService } from '../../common/services/cacheService.js';
import { FieldError, SectionCard } from '../../common/components/forms/FormPrimitives.jsx';
import ListingAttributeSection from './attributes/ListingAttributeSection.jsx';
import ListingAttributeSummary from './attributes/ListingAttributeSummary.jsx';
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
      <label htmlFor={name} className="block cursor-pointer text-sm font-medium text-text-primary">
        {label}
      </label>
      {description && (
        <p className="mt-0.5 text-sm text-text-secondary">
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
 isDraft = false,
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
 const localized = steps.map(s => ({ ...s, title: formText(s.title), description: formText(s.description) }));
 return [...localized, {
 id: summaryId,
 title: t('listing_review_title', 'Kontrol et ve yayınla'),
 description: t('listing_review_desc', 'Bilgileri son kez gözden geçir; yayınla ya da taslak olarak kaydet.'),
 kind: 'summary'
 }];
 }, [formSchema?.steps, t]);
 // Answers given on the category screen (/listings/prefilter) are shown once as a summary, not asked again.
 const lockedFieldNames = useMemo(() => {
 if (isEdit || !initialData) return new Set();
 return new Set(getCreateFlowSelectorSteps(listingType)
 .map(step => step.initialDataKey)
 .filter(key => key && isPrefilterValueFilled(initialData?.[key])));
 }, [isEdit, initialData, listingType]);
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
 // A getter: the message must follow the button that was just pressed, not the last render.
 successMessage: () => {
 if (submitIntentRef.current === 'DRAFT') return t('listing_saved_draft', 'İlan taslak olarak kaydedildi.');
 if (isEdit && !isDraft) return t('listing_updated', 'İlan güncellendi.');
 return t('listing_saved_to_payment', 'İlan kaydedildi, ödeme sayfasına yönlendiriliyorsun.');
 },
 errorMessage: (isEdit ? t('listing_update_failed', 'İlan güncellenemedi.') : t('listing_save_failed', 'İlan kaydedilemedi.')),
 onSuccess: response => {
 if (!isEdit) {
 cacheService.remove(draftKey);
 cacheService.remove(`${draftKey}_step`);
 }
 // Publishing a new listing or a draft (e.g. a copy) continues to the listing fee payment.
 const publishing = submitIntentRef.current === 'PUBLISH' && (!isEdit || isDraft);
 if (!publishing) {
 navigate(redirectRoute || ROUTES.MY_LISTINGS);
 } else {
 const id = isEdit ? initialData?.id : response?.id || response?.data?.id;
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

 const isFieldShown = field => {
 if (lockedFieldNames.has(field.name)) return false;
 return typeof field.visibleWhen === 'function' ? Boolean(field.visibleWhen(ctx)) : true;
 };
 // A field's hint: static `description`, or `getDescription(ctx)` for hints that depend on the form state.
 const fieldHint = field => (typeof field.getDescription === 'function' ? field.getDescription(ctx) : null) || field.description;
 const renderField = field => {
 if (!isFieldShown(field)) return null;
 const value = formData?.[field.name];
 const isRequired = Boolean(field.required) || (typeof field.requiredWhen === 'function' ? Boolean(field.requiredWhen(ctx)) : false);
 const label = isRequired ? `${fieldLabel(field)} *` : fieldLabel(field);
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
   {fieldHint(field) && <p className="mt-1 text-xs text-text-tertiary">{formText(fieldHint(field))}</p>}
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
    label={fieldLabel(field)}
    description={formText(field.description)}
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
   <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>
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
 const inputDisabled = typeof field.disabledWhen === 'function' ? Boolean(field.disabledWhen(ctx)) : Boolean(field.disabled);
 return (
  <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
   <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>
   <input
    type={inputType}
    name={field.name}
    value={value ?? ''}
    onChange={handleInputChange}
    min={field.min}
    max={field.max}
    step={field.step}
    placeholder={field.placeholder || ''}
    disabled={inputDisabled}
    className={`${error ? inputError : inputNormal}${inputDisabled ? ' cursor-not-allowed opacity-60' : ''}`}
   />
   {fieldHint(field) && <p className="mt-1 text-xs text-text-tertiary">{formText(fieldHint(field))}</p>}
   <FieldError error={error} />
  </div>
 );
 };

 /* ── Step Renderers ────────────────────────────────────── */

 const optionLabelFor = (field, value) => {
 const options = (typeof field.getOptions === 'function' ? field.getOptions(ctx) : null) || enums?.[field.enumKey] || [];
 const opt = options.find(o => String(o?.id ?? o?.value ?? '') === String(value));
 return opt?.label || opt?.name || resolveEnumLabel(enums, field.enumKey, value) || String(value);
 };
 const renderLockedSummary = step => {
 const fields = (step?.sections || []).flatMap(section => section.fields || []).filter(f => lockedFieldNames.has(f.name));
 if (!fields.length) return null;
 return (
  <div className="flex items-start justify-between gap-4 rounded border border-border-light bg-background-secondary px-4 py-3">
   <div className="min-w-0">
    <p className="text-xs font-medium text-text-tertiary">{t('your_selections', 'Seçimlerin')}</p>
    <p className="mt-0.5 text-sm text-text-primary">
     {fields.map(f => optionLabelFor(f, formData?.[f.name])).filter(Boolean).join(' · ')}
    </p>
   </div>
   <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">{t('change', 'Değiştir')}</Button>
  </div>
 );
 };
 const renderDetailsStep = step => {
 const sections = step?.sections || [];
 return (
  <div className="space-y-8">
   {renderLockedSummary(step)}
   {sections.map(section => {
    const isVisible = typeof section.visibleWhen === 'function' ? section.visibleWhen(ctx) : true;
    if (!isVisible) return null;
    if (section.kind === 'attributes') {
     return <ListingAttributeSection key={section.id} section={section} ctx={ctx} title={formText(section.title)} description={formText(section.description)} />;
    }
    if (section.kind === 'component') {
     const SectionComponent = section.component;
     return (
      <SectionCard key={section.id} title={formText(section.title)} description={formText(section.description)}>
       <SectionComponent ctx={ctx} section={section} />
      </SectionCard>
     );
    }
    if (!(section.fields || []).some(isFieldShown)) return null;
    return (
     <SectionCard key={section.id || section.title} title={formText(section.title)} description={formText(section.description)}>
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
   <SectionCard title={t("photos", "Görseller")} description={t("photos_description", "Net ve iyi ışıklı bir fotoğraf ekle.")} icon={ImageIcon}>
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
 const attributeSections = [];
 (formSchema?.steps || []).forEach(step => {
 if (step?.kind !== 'details') return;
 (step?.sections || []).forEach(section => {
  const sectionVisible = typeof section.visibleWhen === 'function' ? Boolean(section.visibleWhen(ctx)) : true;
  if (!sectionVisible) return;
  if (section.kind === 'attributes') {
   attributeSections.push(section);
   return;
  }
  (section.fields || []).forEach(field => {
   const visible = typeof field.visibleWhen === 'function' ? Boolean(field.visibleWhen(ctx)) : true;
   if (!visible) return;
   const value = formatSummaryValue(field, formData?.[field.name]);
   if (!value) return;
   detailFields.push({
    label: fieldLabel(field),
    value
   });
  });
 });
 });
 const typeLabel = PREFILTER_CATEGORY_COPY[listingType]?.label || listingConfig?.label || listingType;
 return (
  <div className="space-y-6">
   {/* Hero preview card */}
   <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded border border-border-light bg-background-secondary p-4">
    <div className="min-w-0 flex-1">
     <span className="inline-flex items-center rounded-sm border border-border-light bg-background-primary px-2 py-0.5 text-xs font-semibold text-text-secondary">
      {typeLabel}
     </span>
     <h2 className="mt-2 text-base font-semibold text-text-primary">
      {formData?.title || t("untitled_listing", "Başlıksız ilan")}
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
   {attributeSections.map(section => (
    <ListingAttributeSummary
     key={section.id}
     section={section}
     ctx={ctx}
     attributes={formData?.attributes}
     render={rows => <SummarySection title={formText(section.title)} icon={FileText} rows={rows} />}
    />
   ))}

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
 notification.showError(t('missing_information', 'Eksik bilgi'), t('check_highlighted_fields', 'İşaretli alanları kontrol edip tekrar dene.'));
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
 const categoryLabel = PREFILTER_CATEGORY_COPY[listingType]?.label || listingConfig?.label || listingType;
 return (
  <ListingWizard
   title={isEdit ? t('edit_listing_title', 'İlanı düzenle') : t('new_listing_in_category', { defaultValue: 'Yeni ilan · {{category}}', category: categoryLabel })}
   steps={wizardSteps}
   currentStep={currentStep}
   onBack={onBack || (() => navigate(-1))}
   onNext={handleNext}
   onPrev={prevStep}
   onSubmit={e => {
    submitIntentRef.current = 'PUBLISH';
    handleSubmit(e);
   }}
   onSaveDraft={!isEdit || isDraft ? e => {
    submitIntentRef.current = 'DRAFT';
    handleSubmit(e);
   } : undefined}
   submitLabel={isEdit && !isDraft ? t('save_changes', 'Değişiklikleri kaydet') : t('publish_now', 'Şimdi yayınla')}
   isLoading={createMutation.isPending}
   canSubmit={canGoForward}
   renderStep={renderStep}
   onStepPick={isEdit ? undefined : stepId => goToStep(stepId)}
  />
 );
};

/* ── Summary Section ────────────────────────────────────────── */

const SummarySection = ({
 title,
 icon: Icon,
 rows
}) => {
 return (
  <div className="rounded border border-border-light bg-background-primary overflow-hidden">
   <div className="flex items-center gap-2 border-b border-border-light px-4 py-2.5">
    {Icon && <Icon className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />}
    <h4 className="text-sm font-medium text-text-primary">{title}</h4>
   </div>
   <div className="divide-y divide-border-light">
    {rows.map((row) => (
     <div key={`${row.label}-${row.value}`} className="flex items-start justify-between gap-4 px-4 py-2 text-sm">
      <span className="text-text-secondary">{row.label}</span>
      <span className="text-right font-medium tabular-nums text-text-primary">{row.value}</span>
     </div>
    ))}
   </div>
  </div>
 );
};
export default GenericListingForm;
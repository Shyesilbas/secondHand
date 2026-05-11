import React, {useEffect, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {useEnums} from '../../common/hooks/useEnums.js';
import {useFormState} from '../../common/forms/hooks/useFormState.js';
import {useFormSubmission} from '../../common/forms/hooks/useFormSubmission.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import ListingWizard from './ListingWizard.jsx';
import ListingBasics from '../../common/components/forms/ListingBasics.jsx';
import LocationFields from '../../common/components/forms/LocationFields.jsx';
import ImageUpload from '../../common/components/ImageUpload.jsx';
import EnumDropdown from '../../common/components/ui/EnumDropdown.jsx';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';
import {getListingConfig} from '../config/listingConfig.js';
import {resolveEnumLabel, toDisplayText} from '../utils/listingDisplayFormat.js';
import {ROUTES} from '../../common/constants/routes.js';
import {PREFLOW_WIZARD_VARIANT} from '../config/prefilterFlowUi.js';
import {AlertCircle, ImageIcon, MapPin, Package, FileText} from 'lucide-react';

/* ── Small UI Primitives ───────────────────────────────────── */

const FieldError = ({error}) => {
  if (!error) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {error}
    </p>
  );
};

const SectionCard = ({ title, description, icon: Icon, children }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-3.5">
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-50">
            <Icon className="h-4 w-4 text-gray-500" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
};

const ToggleCardField = ({
  name,
  label,
  description,
  value,
  onToggle,
}) => (
  <div
    className={`flex cursor-pointer select-none items-center gap-3 rounded-md border px-4 py-3.5 transition-colors ${
      value
        ? 'border-black bg-gray-50'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
    onClick={onToggle}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }}
  >
    <div
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
        value
          ? 'border-black bg-black'
          : 'border-gray-300 bg-white'
      }`}
    >
      {value && (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <input id={name} type="checkbox" name={name} checked={Boolean(value)} onChange={() => onToggle()} className="sr-only" />
    <div>
      <label
        htmlFor={name}
        className="block cursor-pointer text-[13px] font-medium text-gray-900"
      >
        {label}
      </label>
      {description && (
        <p className="mt-0.5 text-[12px] text-gray-500">
          {description}
        </p>
      )}
    </div>
  </div>
);

/* ── Input Classes ─────────────────────────────────────────── */

const inputBase = 'w-full px-3 py-2 text-[13px] border rounded-md focus:outline-none transition-colors duration-150';
const inputNormal = `${inputBase} border-gray-200 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-900/10`;
const inputError = `${inputBase} border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-1 focus:ring-red-500/10`;

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
  redirectRoute,
}) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const {enums} = useEnums();

  const listingConfig = useMemo(() => getListingConfig(listingType), [listingType]);
  const formSchema = listingConfig?.formSchema || null;
  const uiChrome = useMemo(() => (!isEdit ? 'composer' : 'neutral'), [isEdit]);
  const sectionTone = uiChrome === 'composer' ? 'composer' : 'neutral';
  const toggleChrome = uiChrome === 'composer' ? 'composer' : 'default';
  const labelClass = uiChrome === 'composer' ? 'text-zinc-950' : 'text-gray-900';
  const descFieldClass = uiChrome === 'composer' ? 'text-zinc-500' : 'text-gray-400';

  const fieldInputOk = useMemo(
    () =>
      uiChrome === 'composer'
        ? 'w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-950/10'
        : inputNormal,
    [uiChrome],
  );

  const fieldInputErr = useMemo(
    () =>
      uiChrome === 'composer'
        ? 'w-full rounded-md border border-red-200 bg-red-50/40 px-3 py-2 text-[13px] text-zinc-950 outline-none transition-colors focus:border-red-400 focus:ring-1 focus:ring-red-400/25'
        : inputError,
    [uiChrome],
  );

  const wizardSteps = useMemo(() => {
    const steps = Array.isArray(formSchema?.steps) ? formSchema.steps : [];
    if (!steps.length) return steps;
    const maxId = Math.max(...steps.map((s) => Number(s?.id ?? 0)));
    const summaryId = Number.isFinite(maxId) ? maxId + 1 : steps.length + 1;
    return [
      ...steps,
      {
        id: summaryId,
        title: 'Review',
        description: 'Check the summary, then publish or save as draft.',
        kind: 'summary',
      },
    ];
  }, [formSchema?.steps]);

  const normalizedInitialData = useMemo(() => {
    if (!formSchema) return initialData || null;
    if (typeof formSchema.normalizeInitialData !== 'function') return initialData || null;
    return formSchema.normalizeInitialData(initialData || null);
  }, [formSchema, initialData]);

  const mergedInitialData = useMemo(() => {
    const base = (formSchema?.initialData && typeof formSchema.initialData === 'object') ? formSchema.initialData : {};
    return {...base, ...(normalizedInitialData || {})};
  }, [formSchema?.initialData, normalizedInitialData]);

  const totalSteps = wizardSteps?.length || 3;

  const formState = useFormState({
    initialData: mergedInitialData,
    totalSteps,
    listingType,
  });

  const submitIntentRef = React.useRef('DRAFT');

  const {handleSubmit} = useFormSubmission({
    submitFunction: (isEdit && onUpdate) ? onUpdate : submitFunction,
    formState,
    successMessage: successMessage || (isEdit ? 'Listing updated successfully!' : (submitIntentRef.current === 'DRAFT' ? 'Listing saved as draft!' : 'Listing created! Redirecting to payment...')),
    errorMessage: errorMessage || (isEdit ? 'Failed to update listing' : 'Failed to save listing'),
    onSuccess: (response) => {
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
    validateCurrentStep,
  } = formState;

  const ctx = useMemo(() => {
    const setValue = (field, value) => handleDropdownChange(field, value);
    const setChecked = (field, checked) => handleInputChange({target: {name: field, checked, type: 'checkbox'}});
    const getName = (enumKey, idOrValue, {upper = false} = {}) => {
      const n = resolveEnumLabel(enums, enumKey, idOrValue);
      return upper ? n.toUpperCase() : n;
    };

    return {enums, formData, errors, setValue, setChecked, getName, isEdit};
  }, [enums, errors, formData, handleDropdownChange, handleInputChange, isEdit]);

  useEffect(() => {
    if (!formSchema?.derivedFields?.length) return;
    formSchema.derivedFields.forEach((d) => {
      const sourceValue = formData?.[d.sourceField];
      const computed = ctx.getName(d.enumKey, sourceValue, {upper: Boolean(d.uppercase)});
      const nextValue = typeof d.transform === 'function' ? d.transform(computed, ctx) : computed;
      const currentValue = String(formData?.[d.targetField] ?? '');
      if (String(nextValue ?? '') !== currentValue) {
        ctx.setValue(d.targetField, nextValue ?? '');
      }
    });
  }, [ctx, formData, formSchema]);

  useEffect(() => {
    if (!formSchema?.effects?.length) return;
    formSchema.effects.forEach((fn) => {
      if (typeof fn === 'function') fn(ctx);
    });
  }, [ctx, formSchema]);

  /* ── Field Renderer ────────────────────────────────────── */

  const renderField = (field) => {
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
            onChange={(v) => {
              if (typeof field.onChange === 'function') {
                field.onChange({value: v, ctx});
              } else {
                handleDropdownChange(field.name, v);
              }
            }}
            options={options}
            disabled={disabled}
          />
          {field.description && <p className={`mt-1.5 text-xs ${descFieldClass}`}>{field.description}</p>}
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
            onSelectionChange={(values) => {
              const v = values?.[0] ?? '';
              if (typeof field.onChange === 'function') {
                field.onChange({value: v, ctx});
              } else {
                handleDropdownChange(field.name, v);
              }
            }}
            placeholder={field.placeholder || 'Select...'}
            searchPlaceholder={field.searchPlaceholder || 'Search...'}
            multiple={false}
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
            chrome={toggleChrome}
            onToggle={() => {
              const next = !Boolean(value);
              if (typeof field.onChange === 'function') {
                field.onChange({value: next, ctx});
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
          <label className={`mb-2 block text-sm font-medium ${labelClass}`}>{label}</label>
          <textarea
            name={field.name}
            value={value || ''}
            onChange={handleInputChange}
            rows={field.rows || 3}
            placeholder={field.placeholder || ''}
            className={error ? fieldInputErr : fieldInputOk}
            style={{resize: 'none'}}
          />
          <FieldError error={error} />
        </div>
      );
    }

    const inputType = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';
    return (
      <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
        <label className={`mb-2 block text-sm font-medium ${labelClass}`}>{label}</label>
        <input
          type={inputType}
          name={field.name}
          value={value ?? ''}
          onChange={handleInputChange}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder || ''}
          className={error ? fieldInputErr : fieldInputOk}
        />
        <FieldError error={error} />
      </div>
    );
  };

  /* ── Step Renderers ────────────────────────────────────── */

  const renderDetailsStep = (step) => {
    const sections = step?.sections || [];
    return (
      <div className="space-y-6">
        {sections.map((section) => {
          const isVisible = typeof section.visibleWhen === 'function' ? section.visibleWhen(ctx) : true;
          if (!isVisible) return null;
          return (
            <SectionCard key={section.id || section.title} title={section.title} description={section.description}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
      <div className="space-y-6">
        <SectionCard title="Photos" description="Upload images of your item" icon={ImageIcon}>
          <ImageUpload
            onImageUpload={(imageUrl) => ctx.setValue('imageUrl', imageUrl)}
            onImageRemove={() => ctx.setValue('imageUrl', '')}
            imageUrl={formData?.imageUrl}
            disabled={false}
          />
        </SectionCard>
        <SectionCard title="Location" description="Where is the item located?" icon={MapPin}>
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
      {label: 'Title', value: String(formData?.title ?? '')},
      {label: 'Price', value: formData?.price != null && String(formData.price).trim() ? `${formData.price} ${formData?.currency || ''}`.trim() : ''},
      {label: 'Quantity', value: formData?.quantity != null && String(formData.quantity).trim() ? String(formData.quantity) : ''},
    ].filter((x) => String(x.value || '').trim());

    const location = [
      {label: 'City', value: String(formData?.city ?? '')},
      {label: 'District', value: String(formData?.district ?? '')},
    ].filter((x) => String(x.value || '').trim());

    const detailFields = [];
    (formSchema?.steps || []).forEach((step) => {
      if (step?.kind !== 'details') return;
      (step?.sections || []).forEach((section) => {
        const sectionVisible = typeof section.visibleWhen === 'function' ? Boolean(section.visibleWhen(ctx)) : true;
        if (!sectionVisible) return;
        (section.fields || []).forEach((field) => {
          const visible = typeof field.visibleWhen === 'function' ? Boolean(field.visibleWhen(ctx)) : true;
          if (!visible) return;
          const value = formatSummaryValue(field, formData?.[field.name]);
          if (!value) return;
          detailFields.push({label: field.label || field.name, value});
        });
      });
    });

    const typeLabel = listingConfig?.label || listingType;

    const sumHead = 'overflow-hidden rounded-lg border border-gray-200 bg-white';
    const sumBadge = 'inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600';

    return (
      <div className="space-y-3">
        <div className={sumHead}>
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className={sumBadge}>{typeLabel}</span>
                <h3 className={`mt-2 text-base font-medium tracking-tight ${labelClass}`}>{formData?.title || 'Untitled'}</h3>
                {formData?.description && (
                  <p className={`mt-2 whitespace-pre-wrap line-clamp-3 text-sm leading-relaxed ${descFieldClass}`}>{formData.description}</p>
                )}
              </div>
              {formData?.imageUrl && (
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                  <img src={formData.imageUrl} alt="Listing" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {basics.length > 0 && (
          <SummarySection title="Basics" icon={Package} rows={basics} tone={sectionTone} />
        )}
        {location.length > 0 && (
          <SummarySection title="Location" icon={MapPin} rows={location} tone={sectionTone} />
        )}
        {detailFields.length > 0 && (
          <SummarySection title="Details" icon={FileText} rows={detailFields} tone={sectionTone} />
        )}
      </div>
    );
  };

  const renderStep = (stepId) => {
    const step = wizardSteps?.find((s) => Number(s.id) === Number(stepId)) || null;
    const kind = step?.kind || (stepId === 1 ? 'basics' : stepId === totalSteps ? 'mediaLocation' : 'details');

    if (kind === 'basics') {
      const showQuantity = Boolean(step?.showQuantity);
      return (
        <ListingBasics
          formData={formData}
          errors={errors}
          onInputChange={handleInputChange}
          enums={enums}
          showQuantity={showQuantity}
          wizardTone={uiChrome === 'composer' ? 'composer' : 'default'}
        />
      );
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
        el.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
    }
  };

  const canGoForward = useMemo(() => {
    const step = wizardSteps?.find((s) => Number(s.id) === Number(currentStep)) || null;
    if (step?.kind === 'mediaLocation') {
      return Boolean(String(formData?.city ?? '').trim() && String(formData?.district ?? '').trim());
    }
    return true;
  }, [wizardSteps, currentStep, formData?.city, formData?.district]);

  if (!formSchema) return null;

  return (
    <ListingWizard
      title={
        typeof formSchema.getTitle === 'function'
          ? formSchema.getTitle({ isEdit, listingType })
          : isEdit
            ? 'Edit Listing'
            : 'Create Listing'
      }
      subtitle={
        typeof formSchema.getSubtitle === 'function'
          ? formSchema.getSubtitle({ isEdit, listingType })
          : isEdit
            ? 'Update your listing details'
            : undefined
      }
      steps={wizardSteps}
      currentStep={currentStep}
      onBack={onBack || (() => navigate(-1))}
      onNext={handleNext}
      onPrev={prevStep}
      onSubmit={(e) => {
        submitIntentRef.current = 'PUBLISH';
        handleSubmit(e);
      }}
      onSaveDraft={
        !isEdit
          ? (e) => {
              submitIntentRef.current = 'DRAFT';
              handleSubmit(e);
            }
          : undefined
      }
      isLoading={Boolean(isLoading)}
      canSubmit={canGoForward}
      renderStep={renderStep}
      wizardVariant={undefined}
      layoutViewportLocked={false}
      onStepPick={isEdit ? undefined : (stepId) => goToStep(stepId)}
      continueLabel="Continue"
    />
  );
};

/* ── Summary Section ────────────────────────────────────────── */

const SummarySection = ({ title, icon: Icon, rows }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-500" />}
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">{title}</h4>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map((row) => (
          <div key={`${row.label}-${row.value}`} className="flex items-start justify-between gap-3 px-4 py-3">
            <span className="text-[12px] text-gray-500">{row.label}</span>
            <span className="text-right text-[13px] font-medium tabular-nums text-gray-900">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenericListingForm;

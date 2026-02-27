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

const resolveEnumName = (enums, enumKey, idOrValue) => {
  const list = enums?.[enumKey] || [];
  const target = String(idOrValue ?? '');
  if (!target) return '';
  const found = list.find((x) => String(x?.id ?? x?.value ?? '') === target);
  return String(found?.name || found?.label || '').trim();
};

const FieldError = ({ error }) => {
  if (!error) return null;
  return <p className="mt-1.5 text-[11px] text-red-500">{error}</p>;
};

const SectionCard = ({ title, description, children }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5">
      <div className="pb-3 border-b border-gray-50 mb-5">
        <h3 className="text-[13px] font-semibold text-gray-900 tracking-[-0.01em]">{title}</h3>
        {description ? <p className="text-[11px] text-gray-400 mt-0.5">{description}</p> : null}
      </div>
      {children}
    </div>
  );
};

const ToggleCardField = ({ name, label, description, value, onToggle }) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150 cursor-pointer focus:outline-none ${
        value ? 'border-gray-900 bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'
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
      <input
        id={name}
        type="checkbox"
        name={name}
        checked={Boolean(value)}
        onChange={() => onToggle()}
        className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-1 focus:ring-gray-300"
      />
      <div>
        <label htmlFor={name} className="block text-[13px] font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        {description ? <p className="text-[11px] text-gray-400 mt-0.5">{description}</p> : null}
      </div>
    </div>
  );
};

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
  const { enums } = useEnums();

  const listingConfig = useMemo(() => getListingConfig(listingType), [listingType]);
  const formSchema = listingConfig?.formSchema || null;

  const wizardSteps = useMemo(() => {
    const steps = Array.isArray(formSchema?.steps) ? formSchema.steps : [];
    if (!steps.length) return steps;
    const maxId = Math.max(...steps.map((s) => Number(s?.id ?? 0)));
    const summaryId = Number.isFinite(maxId) ? maxId + 1 : steps.length + 1;
    return [
      ...steps,
      {
        id: summaryId,
        title: 'Summary',
        description: 'Review your listing before publishing',
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
    return { ...base, ...(normalizedInitialData || {}) };
  }, [formSchema?.initialData, normalizedInitialData]);

  const totalSteps = wizardSteps?.length || 3;

  const formState = useFormState({
    initialData: mergedInitialData,
    totalSteps,
    listingType,
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: (isEdit && onUpdate) ? onUpdate : submitFunction,
    formState,
    successMessage: successMessage || (isEdit ? 'Listing updated successfully!' : 'Listing created successfully!'),
    errorMessage: errorMessage || (isEdit ? 'Failed to update listing' : 'Failed to create listing'),
    redirectRoute,
  });

  const {
    formData,
    errors,
    currentStep,
    handleInputChange,
    handleDropdownChange,
    nextStep,
    prevStep,
    validateCurrentStep,
  } = formState;

  const ctx = useMemo(() => {
    const setValue = (field, value) => handleDropdownChange(field, value);
    const setChecked = (field, checked) => handleInputChange({ target: { name: field, checked, type: 'checkbox' } });
    const getName = (enumKey, idOrValue, { upper = false } = {}) => {
      const n = resolveEnumName(enums, enumKey, idOrValue);
      return upper ? n.toUpperCase() : n;
    };

    return {
      enums,
      formData,
      errors,
      setValue,
      setChecked,
      getName,
      isEdit,
    };
  }, [enums, errors, formData, handleDropdownChange, handleInputChange, isEdit]);

  useEffect(() => {
    if (!formSchema?.derivedFields?.length) return;
    formSchema.derivedFields.forEach((d) => {
      const sourceValue = formData?.[d.sourceField];
      const computed = ctx.getName(d.enumKey, sourceValue, { upper: Boolean(d.uppercase) });
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
                field.onChange({ value: v, ctx });
              } else {
                handleDropdownChange(field.name, v);
              }
            }}
            options={options}
            disabled={disabled}
          />
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
                field.onChange({ value: v, ctx });
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
            onToggle={() => {
              const next = !Boolean(value);
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
          <label className="block text-[13px] font-medium text-gray-900 mb-2">{label}</label>
          <textarea
            name={field.name}
            value={value || ''}
            onChange={handleInputChange}
            rows={field.rows || 3}
            placeholder={field.placeholder || ''}
            className={`w-full px-3 py-2.5 text-[13px] border rounded-lg focus:outline-none focus:ring-1 transition-colors resize-none ${
              error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200 focus:border-gray-300'
            }`}
          />
          <FieldError error={error} />
        </div>
      );
    }

    const inputType = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';
    return (
      <div key={field.name} data-field={field.name} data-has-error={Boolean(error) || undefined}>
        <label className="block text-[13px] font-medium text-gray-900 mb-2">{label}</label>
        <input
          type={inputType}
          name={field.name}
          value={value ?? ''}
          onChange={handleInputChange}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder || ''}
          className={`w-full px-3 py-2.5 text-[13px] border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
            error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200 focus:border-gray-300'
          }`}
        />
        <FieldError error={error} />
      </div>
    );
  };

  const renderDetailsStep = (step) => {
    const sections = step?.sections || [];
    return (
      <div className="space-y-6">
        {sections.map((section) => {
          const isVisible = typeof section.visibleWhen === 'function' ? section.visibleWhen(ctx) : true;
          if (!isVisible) return null;
          return (
            <SectionCard key={section.id || section.title} title={section.title} description={section.description}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <ImageUpload
          onImageUpload={(imageUrl) => ctx.setValue('imageUrl', imageUrl)}
          onImageRemove={() => ctx.setValue('imageUrl', '')}
          imageUrl={formData?.imageUrl}
          disabled={false}
        />
        <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
      </div>
    );
  };

  const formatSummaryValue = (field, rawValue) => {
    if (rawValue === null || rawValue === undefined) return '';
    if (typeof rawValue === 'boolean') return rawValue ? 'Yes' : 'No';
    if (Array.isArray(rawValue)) return rawValue.filter(Boolean).join(', ');
    const value = String(rawValue);
    if (!value.trim()) return '';

    if (field?.enumKey) {
      const label = resolveEnumName(enums, field.enumKey, rawValue);
      return label || value;
    }

    return value;
  };

  const renderSummaryStep = () => {
    const basics = [
      { label: 'Title', value: String(formData?.title ?? '') },
      { label: 'Price', value: formData?.price != null && String(formData.price).trim() ? `${formData.price} ${formData?.currency || ''}`.trim() : '' },
      { label: 'Quantity', value: formData?.quantity != null && String(formData.quantity).trim() ? String(formData.quantity) : '' },
    ].filter((x) => String(x.value || '').trim());

    const location = [
      { label: 'City', value: String(formData?.city ?? '') },
      { label: 'District', value: String(formData?.district ?? '') },
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
          detailFields.push({ label: field.label || field.name, value });
        });
      });
    });

    const typeLabel = listingConfig?.label || listingType;

    const SummaryRow = ({ label, value }) => (
      <div className="flex items-baseline justify-between py-2 border-b border-gray-50 last:border-0">
        <span className="text-[11px] text-gray-400">{label}</span>
        <span className="text-[13px] font-medium text-gray-900 text-right ml-4 tabular-nums">{value}</span>
      </div>
    );

    return (
      <div className="space-y-4">
        {/* Header card */}
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{typeLabel}</span>
              <h3 className="mt-0.5 text-[15px] font-semibold text-gray-900 tracking-[-0.01em]">{formData?.title || 'Untitled'}</h3>
              {formData?.description ? (
                <p className="mt-2 text-[12px] text-gray-500 line-clamp-3 whitespace-pre-wrap">{formData.description}</p>
              ) : null}
            </div>
            {formData?.imageUrl ? (
              <div className="w-20 h-20 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 shrink-0">
                <img src={formData.imageUrl} alt="Listing" className="w-full h-full object-cover" />
              </div>
            ) : null}
          </div>
        </div>

        {basics.length ? (
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <h4 className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Basics</h4>
            {basics.map((row) => (
              <SummaryRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        ) : null}

        {location.length ? (
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <h4 className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Location</h4>
            {location.map((row) => (
              <SummaryRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        ) : null}

        {detailFields.length ? (
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <h4 className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Details</h4>
            {detailFields.map((row) => (
              <SummaryRow key={`${row.label}:${row.value}`} label={row.label} value={row.value} />
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderStep = (stepId) => {
    const step = wizardSteps?.find((s) => Number(s.id) === Number(stepId)) || null;
    const kind = step?.kind || (stepId === 1 ? 'basics' : stepId === totalSteps ? 'mediaLocation' : 'details');

    if (kind === 'basics') {
      const showQuantity = Boolean(step?.showQuantity);
      return <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} isEdit={isEdit} showQuantity={showQuantity} />;
    }

    if (kind === 'mediaLocation') {
      return renderMediaLocationStep();
    }

    if (kind === 'details') {
      return renderDetailsStep(step);
    }

    if (kind === 'summary') {
      return renderSummaryStep();
    }

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
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (!formSchema) return null;

  return (
    <ListingWizard
      title={typeof formSchema.getTitle === 'function' ? formSchema.getTitle({ isEdit, listingType }) : (isEdit ? 'Edit Listing' : 'Create Listing')}
      subtitle={typeof formSchema.getSubtitle === 'function' ? formSchema.getSubtitle({ isEdit, listingType }) : (isEdit ? 'Update your listing details' : 'Create your listing step by step')}
      steps={wizardSteps}
      currentStep={currentStep}
      onBack={onBack || (() => navigate(-1))}
      onNext={handleNext}
      onPrev={prevStep}
      onSubmit={handleSubmit}
      isLoading={Boolean(isLoading)}
      canSubmit={Boolean(formData?.city?.trim?.() && formData?.district?.trim?.())}
      renderStep={renderStep}
    />
  );
};

export default GenericListingForm;


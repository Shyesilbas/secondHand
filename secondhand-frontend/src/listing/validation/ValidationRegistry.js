import { getListingConfig } from '../config/listingConfig.js';

const toErrorsObject = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  return {};
};

const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

const toNumber = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const buildValidationCtx = (formData) => ({ formData: formData || {} });

const validateBaseStep1 = (formData) => {
  const errors = {};
  if (!formData?.title || !String(formData.title).trim()) errors.title = 'Title is required';
  if (!formData?.description || !String(formData.description).trim()) errors.description = 'Description is required';
  const price = toNumber(formData?.price);
  if (!price || price <= 0) errors.price = 'Valid price is required';
  if (!formData?.currency) errors.currency = 'Currency is required';
  return errors;
};

const validateBaseStepLocation = (formData) => {
  const errors = {};
  if (!formData?.city || !String(formData.city).trim()) errors.city = 'City is required';
  if (!formData?.district || !String(formData.district).trim()) errors.district = 'District is required';
  return errors;
};

const shouldValidateField = (field, ctx) => {
  if (!field) return false;
  if (typeof field.visibleWhen === 'function') {
    return Boolean(field.visibleWhen(ctx));
  }
  return true;
};

const isFieldRequired = (field, ctx) => {
  if (!field) return false;
  if (typeof field.requiredWhen === 'function') return Boolean(field.requiredWhen(ctx));
  return Boolean(field.required);
};

const validateField = (field, ctx) => {
  if (!shouldValidateField(field, ctx)) return null;

  const { formData } = ctx;
  const value = formData?.[field.name];
  const required = isFieldRequired(field, ctx);

  if (required) {
    if (field.type === 'toggle') {
      if (!Boolean(value)) return `${field.label} is required`;
    } else if (isEmpty(value)) {
      return `${field.label} is required`;
    }
  }

  if (isEmpty(value)) return null;

  if (field.type === 'number') {
    const n = toNumber(value);
    if (n === null) return `${field.label} must be a valid number`;
    if (field.min !== undefined && field.min !== null && n < Number(field.min)) return `${field.label} must be at least ${field.min}`;
    if (field.max !== undefined && field.max !== null && n > Number(field.max)) return `${field.label} must be at most ${field.max}`;
  }

  if (typeof field.validate === 'function') {
    const res = field.validate(value, ctx);
    if (typeof res === 'string' && res.trim()) return res.trim();
  }

  return null;
};

const collectStepFields = (step, ctx) => {
  if (!step || step.kind !== 'details') return [];
  const sections = step.sections || [];
  const fields = [];
  sections.forEach((section) => {
    const sectionVisible = typeof section?.visibleWhen === 'function' ? Boolean(section.visibleWhen(ctx)) : true;
    if (!sectionVisible) return;
    (section?.fields || []).forEach((f) => fields.push(f));
  });
  return fields;
};

const runCustomValidators = (formSchema, stepId, ctx) => {
  const list = Array.isArray(formSchema?.customValidators) ? formSchema.customValidators : [];
  const errors = {};
  list.forEach((v) => {
    if (!v || typeof v.validate !== 'function') return;
    const applies = typeof v.when === 'function' ? Boolean(v.when({ stepId, ctx })) : true;
    if (!applies) return;
    const res = v.validate({ stepId, ctx });
    Object.assign(errors, toErrorsObject(res));
  });
  return errors;
};

const getFormSchema = (listingType) => {
  const cfg = getListingConfig(listingType);
  return cfg?.formSchema || null;
};

export const validationRegistry = {
  getSchema: (listingType) => {
    if (!listingType) return null;
    const cfg = getListingConfig(listingType);
    return cfg?.formSchema || cfg?.validationSchema || null;
  },

  getStepErrors: (listingType, step, data) => {
    const formSchema = getFormSchema(listingType);
    if (!formSchema) {
      const legacy = getListingConfig(listingType)?.validationSchema || null;
      if (!legacy?.validateStep) return {};
      const res = legacy.validateStep(step, data);
      if (typeof res === 'boolean') return {};
      return toErrorsObject(res);
    }

    const ctx = buildValidationCtx(data);
    const stepId = Number(step);
    const stepDef = (formSchema.steps || []).find((s) => Number(s.id) === stepId) || null;
    const kind = stepDef?.kind || (stepId === 1 ? 'basics' : 'details');

    const errors = {};

    if (kind === 'basics') {
      Object.assign(errors, validateBaseStep1(ctx.formData));
      Object.assign(errors, runCustomValidators(formSchema, stepId, ctx));
      return errors;
    }

    if (kind === 'mediaLocation') {
      Object.assign(errors, validateBaseStepLocation(ctx.formData));
      Object.assign(errors, runCustomValidators(formSchema, stepId, ctx));
      return errors;
    }

    if (kind === 'details') {
      const fields = collectStepFields(stepDef, ctx);
      fields.forEach((field) => {
        const err = validateField(field, ctx);
        if (err) errors[field.name] = err;
      });
      Object.assign(errors, runCustomValidators(formSchema, stepId, ctx));
      return errors;
    }

    return {};
  },

  getAllErrors: (listingType, data) => {
    const formSchema = getFormSchema(listingType);
    if (!formSchema) {
      const legacy = getListingConfig(listingType)?.validationSchema || null;
      if (!legacy?.validateAll) return {};
      const res = legacy.validateAll(data);
      if (typeof res === 'boolean') return {};
      return toErrorsObject(res);
    }

    const ctx = buildValidationCtx(data);
    const errors = {};
    const steps = formSchema.steps || [];
    steps.forEach((s) => {
      const stepId = Number(s.id);
      Object.assign(errors, validationRegistry.getStepErrors(listingType, stepId, ctx.formData));
    });
    Object.assign(errors, runCustomValidators(formSchema, 'all', ctx));
    return errors;
  },

  validate: (listingType, step, data) => {
    const errors = validationRegistry.getStepErrors(listingType, step, data);
    return { isValid: Object.keys(errors).length === 0, errors };
  },
};


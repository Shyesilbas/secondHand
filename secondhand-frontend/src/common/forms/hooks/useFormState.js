import { useState, useCallback } from 'react';
import { validationRegistry } from '../../../listing/validation/ValidationRegistry.js';

export const useFormState = (config) => {
  const { 
    initialData, 
    totalSteps = 3, 
    validateStep, 
    validateAll,
    listingType,
  } = config;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
        if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleDropdownChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
        if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const validateCurrentStep = useCallback(() => {
    const validator = validateStep || (listingType ? ((step, data) => validationRegistry.getStepErrors(listingType, step, data)) : null);
    if (!validator) return true;

    const newErrors = validator(currentStep, formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData, listingType, validateStep]);

  const validateAllSteps = useCallback(() => {
    const validator = validateAll || (listingType ? ((data) => validationRegistry.getAllErrors(listingType, data)) : null);
    if (!validator) return true;

    const allErrors = validator(formData);
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  }, [formData, listingType, validateAll]);

  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  }, [validateCurrentStep, totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(Math.max(1, Math.min(step, totalSteps)));
  }, [totalSteps]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setCurrentStep(1);
  }, [initialData]);

  const setFormDataField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const setFormErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return {
        currentStep,
    formData,
    errors,
    isFirstStep,
    isLastStep,
    totalSteps,
    
        handleInputChange,
    handleDropdownChange,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    setFormData: setFormDataField,
    setFormDataFull: setFormData,
    setErrors: setFormErrors,
    clearErrors,
    
        validateCurrentStep,
    validateAllSteps
  };
};

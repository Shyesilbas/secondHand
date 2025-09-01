import React from 'react';
import { useEnums } from '../../../hooks/useEnums';
import LocationFields from '../../../components/forms/LocationFields';
import ListingWizard from '../../../listing/components/ListingWizard.jsx';
import EnumDropdown from '../../../components/ui/EnumDropdown';
import { useFormState } from '../../../forms/hooks/useFormState';
import { useFormSubmission } from '../../../forms/hooks/useFormSubmission';
import { booksService } from '../services/booksService';
import booksValidator from '../../../utils/validators/booksValidator.js';
import { createFormConfig } from '../../../forms/config/formConfigs.js';
import ListingBasics from "../../../components/forms/ListingBasics.jsx";

const BooksCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { enums } = useEnums();
  const formConfig = createFormConfig('books');

  const formState = useFormState({
    initialData: { ...formConfig.initialData, ...(initialData || {}) },
    totalSteps: formConfig.totalSteps,
    validateStep: booksValidator.validateStep,
    validateAll: booksValidator.validateAll,
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: (isEdit && onUpdate) ? onUpdate : booksService.createBooksListing,
    validateAll: booksValidator.validateAll,
    formState,
    successMessage: isEdit ? 'Books listing updated successfully!' : 'Books listing created successfully!',
    errorMessage: isEdit ? 'Failed to update books listing' : 'Failed to create books listing',
  });

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const renderStep = (stepId) => {
    if (stepId === 1) {
      // Step 1: Basic info
      return (
          <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} />
      );
    }

    if (stepId === 2) {
      // Step 2: Book details
      const fields = formConfig.fieldGroups.step2;
      return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => {
              if (['genre', 'language', 'format', 'condition'].includes(field)) {
                return (
                    <div key={field}>
                      <EnumDropdown
                          label={field.charAt(0).toUpperCase() + field.slice(1) + ' *'}
                          enumKey={`book${field.charAt(0).toUpperCase() + field.slice(1)}s`}
                          value={formData[field]}
                          onChange={(v) => handleDropdownChange(field, v)}
                      />
                      {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                    </div>
                );
              } else {
                return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">{field.charAt(0).toUpperCase() + field.slice(1)} *</label>
                      <input
                          type={['publicationYear', 'pageCount', 'price'].includes(field) ? 'number' : 'text'}
                          name={field}
                          value={formData[field]}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors[field] ? 'border-red-500' : 'border-slate-200'
                          }`}
                      />
                      {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                    </div>
                );
              }
            })}
          </div>
      );
    }

    if (stepId === 3) {
      // Step 3: Location
      return <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />;
    }

    return null;
  };

  return (
      <ListingWizard
          title={isEdit ? 'Edit Books Listing' : 'Create Books Listing'}
          subtitle={isEdit ? 'Update your book listing details' : 'Create your book listing step by step'}
          steps={formConfig.steps}
          currentStep={currentStep}
          onBack={onBack}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={handleSubmit}
          isLoading={booksService.isLoading || false}
          canSubmit={Boolean(formData.city?.trim() && formData.district?.trim())}
          renderStep={(step) => renderStep(step)}
      />
  );
};

export default BooksCreateForm;

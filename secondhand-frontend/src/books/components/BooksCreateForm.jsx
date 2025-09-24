import React from 'react';
import { useEnums } from '../../common/hooks/useEnums.js';
import LocationFields from '../../common/components/forms/LocationFields.jsx';
import ListingWizard from '../../listing/components/ListingWizard.jsx';
import EnumDropdown from '../../common/components/ui/EnumDropdown.jsx';
import { useFormState } from '../../common/forms/hooks/useFormState.js';
import { useFormSubmission } from '../../common/forms/hooks/useFormSubmission.js';
import { booksService } from '../services/booksService.js';
import booksValidator from '../booksValidator.js';
import { createFormConfig } from '../../common/forms/config/formConfigs.js';
import ListingBasics from "../../common/components/forms/ListingBasics.jsx";

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
            return (
          <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} />
      );
    }

    if (stepId === 2) {
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

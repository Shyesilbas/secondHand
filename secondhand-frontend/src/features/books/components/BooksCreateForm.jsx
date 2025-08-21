import React from 'react';
import { useEnums } from '../../../hooks/useEnums';
import LocationFields from '../../../components/forms/LocationFields';
import ListingWizard from '../../listings/components/ListingWizard';
import EnumDropdown from '../../../components/ui/EnumDropdown';
import { useFormState } from '../../../forms/hooks/useFormState';
import { useFormSubmission } from '../../../forms/hooks/useFormSubmission';
import { booksService } from '../services/booksService';
import booksValidator from '../../../utils/validators/booksValidator.js';
import { createFormConfig } from '../../../forms/config/formConfigs.js';

const BooksCreateForm = ({ onBack }) => {
  const { enums } = useEnums();
  const formConfig = createFormConfig('books');

  const formState = useFormState({
    initialData: formConfig.initialData,
    totalSteps: formConfig.totalSteps,
    validateStep: booksValidator.validateStep,
    validateAll: booksValidator.validateBooksAll,
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: booksService.createBooksListing,
    validateAll: booksValidator.validateBooksAll,
    formState,
    successMessage: 'Books listing created successfully!',
    errorMessage: 'Failed to create books listing',
  });

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const renderStep = (stepId) => {
    const fields = formConfig.fieldGroups[`step${stepId}`];
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
                        type={field === 'publicationYear' || field === 'pageCount' || field === 'price' ? 'number' : 'text'}
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors[field] ? 'border-red-500' : 'border-slate-200'
                        }`}
                        placeholder=""
                    />
                    {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                  </div>
              );
            }
          })}
          {stepId === 3 && <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />}
        </div>
    );
  };

  return (
      <ListingWizard
          title="Create Books Listing"
          subtitle="Create your book listing step by step"
          steps={formConfig.steps}
          currentStep={currentStep}
          onBack={onBack}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={handleSubmit}
          isLoading={false}
          canSubmit={Boolean(formData.city?.trim() && formData.district?.trim())}
          renderStep={(step) => renderStep(step)}
      />
  );
};

export default BooksCreateForm;

import React from 'react';
import { useClothing } from '../hooks/useClothing.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import ListingBasics from '../../common/components/forms/ListingBasics.jsx';
import LocationFields from '../../common/components/forms/LocationFields.jsx';
import ListingWizard from '../../listing/components/ListingWizard.jsx';
import EnumDropdown from '../../common/components/ui/EnumDropdown.jsx';
import { useFormState } from '../../common/forms/hooks/useFormState.js';
import { useFormSubmission } from '../../common/forms/hooks/useFormSubmission.js';
import { createFormConfig } from '../../common/forms/config/formConfigs.js';
import clothingValidator from '../clothingValidator.js';

const ClothingCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { createClothingListing, isLoading } = useClothing();
  const { enums } = useEnums();
  const formConfig = createFormConfig('clothing');

  const formState = useFormState({
    initialData: { ...formConfig.initialData, ...(initialData || {}) },
    totalSteps: formConfig.totalSteps,
    validateStep: clothingValidator.validateStep,
    validateAll: clothingValidator.validateAll,
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: (isEdit && onUpdate) ? onUpdate : createClothingListing,
    validateAll: clothingValidator.validateAll,
    formState,
    successMessage: isEdit ? 'Clothing listing updated successfully!' : 'Clothing listing created successfully!',
    errorMessage: isEdit ? 'Failed to update clothing listing' : 'Failed to create clothing listing'
  });

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const renderStep = (stepId) => {
    switch (stepId) {
      case 1:
        return <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} isEdit={isEdit} />;
      case 2:
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['brand', 'clothingType', 'color', 'condition'].map((field) => (
                  <div key={field}>
                    <EnumDropdown
                        label={field.charAt(0).toUpperCase() + field.slice(1) + ' *'}
                        enumKey={field === 'brand' ? 'clothingBrands' :
                            field === 'clothingType' ? 'clothingTypes' :
                                field === 'condition' ? 'clothingConditions' : 'colors'}
                        value={formData[field]}
                        onChange={(v) => handleDropdownChange(field, v)}
                    />
                    {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                  </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Date *</label>
                <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.purchaseDate ? 'border-red-500' : 'border-slate-200'
                    }`}
                />
                {errors.purchaseDate && <p className="mt-1 text-sm text-red-600">{errors.purchaseDate}</p>}
              </div>
            </div>
        );
      case 3:
        return <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
      <ListingWizard
          title={isEdit ? 'Edit Clothing Listing' : 'Create Clothing Listing'}
          subtitle={isEdit ? 'Update your clothing listing details' : 'Create your clothing listing step by step'}
          steps={formConfig.steps}
          currentStep={currentStep}
          onBack={onBack}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          canSubmit={Boolean(formData.city?.trim() && formData.district?.trim())}
          renderStep={(step) => renderStep(step)}
      />
  );
};

export default ClothingCreateForm;

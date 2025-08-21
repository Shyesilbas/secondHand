import React from 'react';
import { useClothing } from '../hooks/useClothing';
import { useEnums } from '../../../hooks/useEnums';
import ListingBasics from '../../../components/forms/ListingBasics';
import LocationFields from '../../../components/forms/LocationFields';
import ListingWizard from '../../listings/components/ListingWizard';
import EnumDropdown from '../../../components/ui/EnumDropdown';
import { useFormState } from '../../../forms/hooks/useFormState';
import { useFormSubmission } from '../../../forms/hooks/useFormSubmission';
import { createFormConfig } from '../../../forms/config/formConfigs';
import clothingValidator from '../../../utils/validators/clothingValidator.js';

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
        return <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} />;
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

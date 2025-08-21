import React from 'react';
import { useRealEstate } from '../hooks/useRealEstate';
import { useEnums } from '../../../hooks/useEnums';
import ListingBasics from '../../../components/forms/ListingBasics';
import LocationFields from '../../../components/forms/LocationFields';
import ListingWizard from '../../listings/components/ListingWizard';
import EnumDropdown from '../../../components/ui/EnumDropdown';
import { useFormState } from '../../../forms/hooks/useFormState';
import { useFormSubmission } from '../../../forms/hooks/useFormSubmission';
import { createFormConfig } from '../../../forms/config/formConfigs';
import realEstateValidator from "../../../utils/validators/realEstateValidators.js";

const RealEstateCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { createRealEstate, isLoading } = useRealEstate();
  const { enums } = useEnums();
  const formConfig = createFormConfig('realEstate');

  const formState = useFormState({
    initialData: { ...formConfig.initialData, ...(initialData || {}) },
    totalSteps: formConfig.totalSteps,
    validateStep:realEstateValidator.validateStep,
    validateAll: realEstateValidator.validateAll,
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: (isEdit && onUpdate) ? onUpdate : createRealEstate,
    validateAll: realEstateValidator.validateAll,
    formState,
    successMessage: isEdit ? 'Real estate listing updated successfully!' : undefined,
    errorMessage: isEdit ? 'Failed to update real estate listing' : undefined
  });

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const renderStep = (stepId) => {
    switch (stepId) {
      case 1:
        return <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} />;
      case 2:
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {['adType', 'realEstateType', 'heatingType', 'ownerType'].map((field) => (
                  <div key={field}>
                    <EnumDropdown
                        label={`${field.replace(/([A-Z])/g, ' $1')} *`}
                        enumKey={field === 'adType' ? 'realEstateAdTypes' :
                            field === 'realEstateType' ? 'realEstateTypes' :
                                field === 'heatingType' ? 'heatingTypes' : 'ownerTypes'}
                        value={formData[field]}
                        onChange={(v) => handleDropdownChange(field, v)}
                    />
                    {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                  </div>
              ))}

              {['squareMeters', 'roomCount', 'bathroomCount', 'floor', 'buildingAge'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{field.replace(/([A-Z])/g, ' $1')} *</label>
                    <input
                        type="number"
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        min="0"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors[field] ? 'border-red-500' : 'border-slate-200'
                        }`}
                    />
                    {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                  </div>
              ))}

              <div className="flex items-center gap-3">
                <input
                    id="furnished"
                    type="checkbox"
                    name="furnished"
                    checked={Boolean(formData.furnished)}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded"
                />
                <label htmlFor="furnished" className="text-sm font-medium text-slate-700">Furnished</label>
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
          title={isEdit ? 'Edit Real Estate Listing' : 'Create Real Estate Listing'}
          subtitle={isEdit ? 'Update your real estate listing details' : 'Create your real estate listing step by step'}
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

export default RealEstateCreateForm;

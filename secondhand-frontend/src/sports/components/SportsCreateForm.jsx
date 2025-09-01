import React from 'react';
import { useEnums } from '../../common/hooks/useEnums.js';
import ListingBasics from '../../common/components/forms/ListingBasics.jsx';
import LocationFields from '../../common/components/forms/LocationFields.jsx';
import ListingWizard from '../../listing/components/ListingWizard.jsx';
import EnumDropdown from '../../common/components/ui/EnumDropdown.jsx';
import { useFormState } from '../../common/forms/hooks/useFormState.js';
import { useFormSubmission } from '../../common/forms/hooks/useFormSubmission.js';
import { sportsService } from '../services/sportsService.js';
import sportsValidator from '../sportsValidator.js';
import { createFormConfig } from '../../common/forms/config/formConfigs.js';

const SportsCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { enums } = useEnums();
  const formConfig = createFormConfig('sports');

  const formState = useFormState({
    initialData: { ...formConfig.initialData, ...(initialData || {}) },
    totalSteps: formConfig.totalSteps,
    validateStep: sportsValidator.validateStep,
    validateAll: sportsValidator.validateAll,
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: (isEdit && onUpdate) ? onUpdate : (data) => sportsService.createSportsListing(data),
    validateAll: sportsValidator.validateAll,
    formState,
    successMessage: isEdit ? 'Sports listing updated successfully!' : 'Sports listing created successfully!',
    errorMessage: isEdit ? 'Failed to update sports listing' : 'Failed to create sports listing',
  });

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const renderStep = (stepId) => {
    switch (stepId) {
      case 1:
        return (
            <ListingBasics
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
                enums={enums}
            />
        );
      case 2:
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <EnumDropdown
                    label="Sport Type *"
                    enumKey="sportDisciplines"
                    value={formData.sportType}
                    onChange={(v) => handleDropdownChange('sportType', v)}
                />
                {errors.sportType && <p className="mt-1 text-sm text-red-600">{errors.sportType}</p>}
              </div>
              <div>
                <EnumDropdown
                    label="Brand *"
                    enumKey="sportBrands"
                    value={formData.brand}
                    onChange={(v) => handleDropdownChange('brand', v)}
                />
                {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
              </div>
              <div>
                <EnumDropdown
                    label="Model *"
                    enumKey="sportModels"
                    value={formData.model}
                    onChange={(v) => handleDropdownChange('model', v)}
                />
                {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
              </div>
              <div>
                <EnumDropdown
                    label="Condition *"
                    enumKey="sportConditions"
                    value={formData.condition}
                    onChange={(v) => handleDropdownChange('condition', v)}
                />
                {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
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
          title={isEdit ? 'Edit Sports Listing' : 'Create Sports Listing'}
          subtitle={isEdit ? 'Update your sports listing details' : 'Create your sports listing step by step'}
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

export default SportsCreateForm;

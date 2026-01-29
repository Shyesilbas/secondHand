import React from 'react';
import { useEnums } from '../../common/hooks/useEnums.js';
import ListingBasics from '../../common/components/forms/ListingBasics.jsx';
import LocationFields from '../../common/components/forms/LocationFields.jsx';
import ImageUpload from '../../common/components/ImageUpload.jsx';
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

  const handleImageUpload = (imageUrl) => {
    handleInputChange({ target: { name: 'imageUrl', value: imageUrl } });
  };

  const handleImageRemove = () => {
    handleInputChange({ target: { name: 'imageUrl', value: '' } });
  };

  const renderStep = (stepId) => {
    switch (stepId) {
      case 1:
        return (
            <ListingBasics
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
                enums={enums}
                isEdit={isEdit}
            />
        );
      case 2:
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <div className="pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">Spor Ekipmanı Detayları</h3>
                <p className="text-xs text-slate-500 mt-1 tracking-tight">Spor tipi, ekipman tipi ve durum</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <EnumDropdown
                      label="Spor Tipi *"
                      enumKey="sportDisciplines"
                      value={formData.disciplineId}
                      onChange={(v) => handleDropdownChange('disciplineId', v)}
                  />
                  {errors.disciplineId && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.disciplineId}</p>}
                </div>
                <div>
                  <EnumDropdown
                      label="Ekipman Tipi *"
                      enumKey="sportEquipmentTypes"
                      value={formData.equipmentTypeId}
                      onChange={(v) => handleDropdownChange('equipmentTypeId', v)}
                  />
                  {errors.equipmentTypeId && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.equipmentTypeId}</p>}
                </div>
                <div>
                  <EnumDropdown
                      label="Durum *"
                      enumKey="sportConditions"
                      value={formData.conditionId}
                      onChange={(v) => handleDropdownChange('conditionId', v)}
                  />
                  {errors.conditionId && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.conditionId}</p>}
                </div>
              </div>
            </div>
        );
      case 3:
        return (
          <div className="space-y-10">
            <ImageUpload
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              imageUrl={formData.imageUrl}
              disabled={false}
            />
            <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
          </div>
        );
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

import React from 'react';
import { useRealEstate } from '../hooks/useRealEstate.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import ListingBasics from '../../common/components/forms/ListingBasics.jsx';
import LocationFields from '../../common/components/forms/LocationFields.jsx';
import ImageUpload from '../../common/components/ImageUpload.jsx';
import ListingWizard from '../../listing/components/ListingWizard.jsx';
import EnumDropdown from '../../common/components/ui/EnumDropdown.jsx';
import { useFormState } from '../../common/forms/hooks/useFormState.js';
import { useFormSubmission } from '../../common/forms/hooks/useFormSubmission.js';
import { createFormConfig } from '../../common/forms/config/formConfigs.js';
import realEstateValidator from "../realEstateValidators.js";

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

  const handleImageUpload = (imageUrl) => {
    handleInputChange({ target: { name: 'imageUrl', value: imageUrl } });
  };

  const handleImageRemove = () => {
    handleInputChange({ target: { name: 'imageUrl', value: '' } });
  };

  const renderStep = (stepId) => {
    switch (stepId) {
      case 1:
        return <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} isEdit={isEdit} showQuantity={false} />;
      case 2:
        return (
            <div className="space-y-10">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="pb-4 border-b border-slate-100 mb-6">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">Temel Bilgiler</h3>
                  <p className="text-xs text-slate-500 mt-1 tracking-tight">İlan tipi, gayrimenkul tipi ve sahiplik durumu</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { key: 'adTypeId', label: 'Ad Type *', enumKey: 'realEstateAdTypes' },
                    { key: 'realEstateTypeId', label: 'Property Type *', enumKey: 'realEstateTypes' },
                    { key: 'heatingTypeId', label: 'Heating Type *', enumKey: 'heatingTypes' },
                    { key: 'ownerTypeId', label: 'Owner Type *', enumKey: 'ownerTypes' },
                  ].map((field) => (
                    <div key={field.key}>
                      <EnumDropdown
                        label={field.label}
                        enumKey={field.enumKey}
                        value={formData[field.key]}
                        onChange={(v) => handleDropdownChange(field.key, v)}
                      />
                      {errors[field.key] && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors[field.key]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="pb-4 border-b border-slate-100 mb-6">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">Fiziksel Özellikler</h3>
                  <p className="text-xs text-slate-500 mt-1 tracking-tight">Metrekare, oda sayısı ve diğer detaylar</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {['squareMeters', 'roomCount', 'bathroomCount', 'floor', 'buildingAge'].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">{field.replace(/([A-Z])/g, ' $1')} *</label>
                        <input
                            type="number"
                            name={field}
                            value={formData[field]}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${
                                errors[field] ? 'border-red-300' : 'border-slate-200'
                            }`}
                        />
                        {errors[field] && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors[field]}</p>}
                      </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="pb-4 border-b border-slate-100 mb-6">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">Ek Bilgiler</h3>
                  <p className="text-xs text-slate-500 mt-1 tracking-tight">Eşyalı durumu</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer" onClick={() => handleInputChange({ target: { name: 'furnished', checked: !formData.furnished, type: 'checkbox' } })}>
                  <input
                      id="furnished"
                      type="checkbox"
                      name="furnished"
                      checked={Boolean(formData.furnished)}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="furnished" className="text-sm font-semibold text-slate-900 tracking-tight cursor-pointer">Eşyalı</label>
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

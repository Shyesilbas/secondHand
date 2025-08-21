import React from 'react';
import { useClothing } from '../hooks/useClothing';
import { useEnums } from '../../../hooks/useEnums';
import ListingWizard from '../../listings/components/ListingWizard';
import { useFormState } from '../../../forms/hooks/useFormState';
import { useFormSubmission } from '../../../forms/hooks/useFormSubmission';
import clothingValidator from '../../../utils/validators/clothingValidator.js';
import LocationFields from '../../../components/forms/LocationFields';
import { createFormConfig } from '../../../forms/config/formConfigs';
import EnumDropdown from '../../../components/ui/EnumDropdown';

const ClothingCreateForm = ({ onBack }) => {
  const { createClothingListing, isLoading } = useClothing();
  const { enums } = useEnums();
  const formConfig = createFormConfig('clothing');

  const formState = useFormState({
    initialData: formConfig.initialData,
    totalSteps: formConfig.totalSteps,
    validateStep: clothingValidator.validateStep,
    validateAll: clothingValidator.validateAll,
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: createClothingListing,
    validateAll: clothingValidator.validateAll,
    formState,
    successMessage: 'Clothing listing created successfully!',
    errorMessage: 'Failed to create clothing listing'
  });

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const renderStep = (stepId) => {
    const fields = formConfig.fieldGroups[`step${stepId}`];

    return (
        <div className="space-y-6">
          {stepId !== 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{formConfig.steps[stepId - 1].title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fields.map((field) => {
                    if (['brand', 'clothingType', 'color', 'condition'].includes(field)) {
                      return (
                          <div key={field}>
                            <EnumDropdown
                                label={field.charAt(0).toUpperCase() + field.slice(1) + ' *'}
                                enumKey={field === 'brand' ? 'clothingBrands' : field === 'clothingType' ? 'clothingTypes' : field === 'condition' ? 'clothingConditions' : 'colors'}
                                value={formData[field]}
                                onChange={(v) => handleDropdownChange(field, v)}
                            />
                            {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                          </div>
                      );
                    } else if (field === 'purchaseDate') {
                      return (
                          <div key={field}>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Date *</label>
                            <input
                                type="date"
                                name={field}
                                value={formData[field]}
                                onChange={handleInputChange}
                                max={new Date().toISOString().split('T')[0]}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors[field] ? 'border-red-500' : 'border-slate-200'}`}
                            />
                            {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                          </div>
                      );
                    } else {
                      return (
                          <div key={field}>
                            <label className="block text-sm font-medium text-slate-700 mb-2">{field.charAt(0).toUpperCase() + field.slice(1)} *</label>
                            <input
                                type={field === 'price' ? 'number' : 'text'}
                                name={field}
                                value={formData[field]}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors[field] ? 'border-red-500' : 'border-slate-200'}`}
                            />
                            {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                          </div>
                      );
                    }
                  })}
                </div>
              </div>
          )}

          {stepId === 3 && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Listing Preview</h3>
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">{formData.title || 'Listing Title'}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                  <span className="flex items-center gap-1">
                    <span>👕</span> {enums.clothingBrands?.find(b => b.value === formData.brand)?.label || formData.brand} {enums.clothingTypes?.find(t => t.value === formData.clothingType)?.label || formData.clothingType}
                  </span>
                      {formData.color && <span className="flex items-center gap-1"><span>🎨</span> {enums.colors?.find(c => c.value === formData.color)?.label || formData.color}</span>}
                      {formData.condition && <span className="flex items-center gap-1"><span>⭐</span> {enums.clothingConditions?.find(c => c.value === formData.condition)?.label || formData.condition}</span>}
                      {formData.purchaseDate && <span className="flex items-center gap-1"><span>📅</span> {new Date(formData.purchaseDate).toLocaleDateString()}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-600">
                    {formData.price ? `${parseInt(formData.price).toLocaleString('en-US')} ${formData.currency}` : 'Price not specified'}
                  </span>
                      <span className="text-sm text-slate-500">
                    {formData.city ? `${formData.district ? formData.district + ', ' : ''}${formData.city}` : 'Location not specified'}
                  </span>
                    </div>
                  </div>
                </div>
              </>
          )}
        </div>
    );
  };

  return (
      <ListingWizard
          title="Create Clothing Listing"
          subtitle="Create your clothing listing step by step"
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

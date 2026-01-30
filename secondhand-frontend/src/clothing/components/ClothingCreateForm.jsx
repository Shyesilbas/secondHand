import React, { useEffect, useMemo } from 'react';
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
import ImageUpload from '../../common/components/ImageUpload.jsx';

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

  const selectedClothingTypeName = useMemo(() => {
    const types = enums?.clothingTypes || [];
    const found = types.find((t) => String(t.id) === String(formData.clothingTypeId));
    return found?.name || '';
  }, [enums?.clothingTypes, formData.clothingTypeId]);

  const isFootwear = useMemo(() => {
    const n = String(selectedClothingTypeName || '').toUpperCase();
    return ['SHOES', 'SNEAKERS', 'BOOTS', 'SANDALS', 'HEELS', 'FLATS'].includes(n);
  }, [selectedClothingTypeName]);

  const isAccessory = useMemo(() => {
    const n = String(selectedClothingTypeName || '').toUpperCase();
    return ['HAT', 'CAP', 'SCARF', 'GLOVES', 'BELT', 'TIE', 'BAG'].includes(n);
  }, [selectedClothingTypeName]);

  const showSize = useMemo(() => !isFootwear && !isAccessory, [isFootwear, isAccessory]);
  const showShoeSize = useMemo(() => isFootwear, [isFootwear]);

  useEffect(() => {
    if (formData._clothingTypeName !== selectedClothingTypeName) {
      handleInputChange({ target: { name: '_clothingTypeName', value: selectedClothingTypeName } });
    }
  }, [formData._clothingTypeName, selectedClothingTypeName, handleInputChange]);

  useEffect(() => {
    if (showShoeSize) {
      if (formData.size) handleDropdownChange('size', '');
    } else if (showSize) {
      if (formData.shoeSizeEu) handleInputChange({ target: { name: 'shoeSizeEu', value: '' } });
    } else if (isAccessory) {
      if (formData.size) handleDropdownChange('size', '');
      if (formData.shoeSizeEu) handleInputChange({ target: { name: 'shoeSizeEu', value: '' } });
    }
  }, [
    showShoeSize,
    showSize,
    isAccessory,
    formData.size,
    formData.shoeSizeEu,
    handleDropdownChange,
    handleInputChange
  ]);

  const handleImageUpload = (imageUrl) => {
    handleInputChange({ target: { name: 'imageUrl', value: imageUrl } });
  };

  const handleImageRemove = () => {
    handleInputChange({ target: { name: 'imageUrl', value: '' } });
  };

  const renderStep = (stepId) => {
    switch (stepId) {
      case 1:
        return <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} isEdit={isEdit} />;
      case 2:
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <div className="pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">Ürün Detayları</h3>
                <p className="text-xs text-slate-500 mt-1 tracking-tight">Kıyafet tipi, marka ve diğer özellikler</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['brandId', 'clothingTypeId', 'color', 'condition', 'clothingGender', 'clothingCategory'].map((field) => (
                    <div key={field}>
                      <EnumDropdown
                          label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1') + ' *'}
                          enumKey={field === 'brandId' ? 'clothingBrands' :
                              field === 'clothingTypeId' ? 'clothingTypes' :
                                  field === 'condition' ? 'clothingConditions' :
                                      field === 'clothingGender' ? 'clothingGenders' :
                                          field === 'clothingCategory' ? 'clothingCategories' : 'colors'}
                          value={formData[field]}
                          disabled={field !== 'clothingTypeId' && !formData.clothingTypeId}
                          onChange={(v) => handleDropdownChange(field, v)}
                      />
                      {errors[field] && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors[field]}</p>}
                    </div>
                ))}

                {showSize && (
                    <div>
                      <EnumDropdown
                          label="Size *"
                          enumKey="clothingSizes"
                          value={formData.size}
                          onChange={(v) => handleDropdownChange('size', v)}
                      />
                      {errors.size && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.size}</p>}
                    </div>
                )}

                {showShoeSize && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Shoe Size (EU) *</label>
                      <input
                          type="number"
                          name="shoeSizeEu"
                          value={formData.shoeSizeEu}
                          onChange={handleInputChange}
                          min="20"
                          max="55"
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${
                              errors.shoeSizeEu ? 'border-red-300' : 'border-slate-200'
                          }`}
                      />
                      {errors.shoeSizeEu && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.shoeSizeEu}</p>}
                    </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Material</label>
                  <input
                      type="text"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${
                          errors.material ? 'border-red-300' : 'border-slate-200'
                      }`}
                  />
                  {errors.material && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.material}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Satın Alma Tarihi *</label>
                  <input
                      type="number"
                      name="purchaseYear"
                      value={formData.purchaseYear}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${
                          errors.purchaseYear ? 'border-red-300' : 'border-slate-200'
                      }`}
                  />
                  {errors.purchaseYear && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.purchaseYear}</p>}
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

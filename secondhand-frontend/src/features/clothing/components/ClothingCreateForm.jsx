import React from 'react';
import { useClothing } from '../hooks/useClothing';
import { useEnums } from '../../../hooks/useEnums';
import EnumDropdown from '../../../components/ui/EnumDropdown';
import ListingBasics from '../../../components/forms/ListingBasics';
import LocationFields from '../../../components/forms/LocationFields';
import ListingWizard from '../../listings/components/ListingWizard';
import { useFormState } from '../../../forms/hooks/useFormState';
import {validateBasicListingStep1} from '../../../utils/validators/commonListingValidators.js'
import { useFormSubmission } from '../../../forms/hooks/useFormSubmission';

const ClothingCreateForm = ({ onBack }) => {
  const { createClothingListing, isLoading } = useClothing();
  const { enums } = useEnums();

  const validateStep = (step, formData) => {
    if (step === 1) return validateBasicListingStep1(formData);
    if (step === 2) return validateClothingStep2(formData);
    if (step === 3) return validateClothingStep3(formData);
    return {};
  };

  const validateClothingStep2 = (formData) => {
    const errors = {};
    if (!formData.brand) errors.brand = 'Brand is required';
    if (!formData.clothingType) errors.clothingType = 'Type is required';
    if (!formData.color) errors.color = 'Color is required';
    if (!formData.condition) errors.condition = 'Condition is required';
    if (!formData.purchaseDate) errors.purchaseDate = 'Purchase date is required';
    return errors;
  };

  const validateClothingStep3 = (formData) => {
    const errors = {};
    if (!formData.city?.trim()) errors.city = 'City is required';
    if (!formData.district?.trim()) errors.district = 'District is required';
    return errors;
  };

  const validateClothingAll = (formData) => {
    return {
      ...validateBasicListingStep1(formData),
      ...validateClothingStep2(formData),
      ...validateClothingStep3(formData)
    };
  };

  // Form state management
  const formState = useFormState({
    initialData: {
      title: '',
      description: '',
      price: '',
      currency: 'TRY',
      brand: '',
      clothingType: '',
      color: '',
      condition: '',
      purchaseDate: '',
      city: '',
      district: ''
    },
    totalSteps: 3,
    validateStep,
    validateAll: validateClothingAll
  });

  // Form submission
  const { handleSubmit } = useFormSubmission({
    submitFunction: createClothingListing,
    validateAll: validateClothingAll,
    formState,
    successMessage: 'Clothing listing created successfully!',
    errorMessage: 'Failed to create clothing listing'
  });

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Set the title, description and price' },
    { id: 2, title: 'Clothing Details', description: 'Specify clothing characteristics' },
    { id: 3, title: 'Location', description: 'Set the location' }
  ];

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl">📝</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
            <p className="text-sm text-slate-600">Set the title, description and price of your listing</p>
          </div>
        </div>
        <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-xl">👕</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Clothing Specifications</h3>
            <p className="text-sm text-slate-600">Specify the details of your clothing item</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <EnumDropdown label="Brand *" enumKey="clothingBrands" value={formData.brand} onChange={(v) => handleDropdownChange('brand', v)} />
            {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
          </div>

          <div>
            <EnumDropdown label="Type *" enumKey="clothingTypes" value={formData.clothingType} onChange={(v) => handleDropdownChange('clothingType', v)} />
            {errors.clothingType && <p className="mt-1 text-sm text-red-600">{errors.clothingType}</p>}
          </div>

          <div>
            <EnumDropdown label="Color *" enumKey="colors" value={formData.color} onChange={(v) => handleDropdownChange('color', v)} />
            {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
          </div>

          <div>
            <EnumDropdown label="Condition *" enumKey="clothingConditions" value={formData.condition} onChange={(v) => handleDropdownChange('condition', v)} />
            {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Purchase Date *
            </label>
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
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-xl">📍</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Location Information</h3>
            <p className="text-sm text-slate-600">Specify the location where your clothing item is located</p>
          </div>
        </div>

        <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg">👁️</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Listing Preview</h3>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="text-lg font-semibold text-slate-900 mb-3">{formData.title || 'Listing Title'}</h4>

          {/* Main info */}
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
            <span className="flex items-center gap-1">
              <span>👕</span> {enums.clothingBrands?.find(b => b.value === formData.brand)?.label || formData.brand} {enums.clothingTypes?.find(t => t.value === formData.clothingType)?.label || formData.clothingType}
            </span>
            {formData.color && (
              <span className="flex items-center gap-1">
                <span>🎨</span> {enums.colors?.find(c => c.value === formData.color)?.label || formData.color}
              </span>
            )}
            {formData.condition && (
              <span className="flex items-center gap-1">
                <span>⭐</span> {enums.clothingConditions?.find(c => c.value === formData.condition)?.label || formData.condition}
              </span>
            )}
            {formData.purchaseDate && (
              <span className="flex items-center gap-1">
                <span>📅</span> {new Date(formData.purchaseDate).toLocaleDateString()}
              </span>
            )}
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
    </div>
  );

  return (
    <ListingWizard
      title="Create Clothing Listing"
      subtitle="Create your clothing listing step by step"
      steps={steps}
      currentStep={currentStep}
      onBack={onBack}
      onNext={nextStep}
      onPrev={prevStep}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      canSubmit={Boolean(formData.city?.trim() && formData.district?.trim())}
      renderStep={(step) => (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </>
      )}
    />
  );
};

export default ClothingCreateForm;

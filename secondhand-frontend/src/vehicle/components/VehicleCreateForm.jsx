import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../hooks/useVehicle.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { VehicleCreateRequestDTO } from '../vehicles.js';
import ListingWizard from '../../listing/components/ListingWizard.jsx';
import ListingBasics from '../../common/components/forms/ListingBasics.jsx';
import EnumDropdown from '../../common/components/ui/EnumDropdown.jsx';
import LocationFields from '../../common/components/forms/LocationFields.jsx';
import ImageUpload from '../../common/components/ImageUpload.jsx';
import { vehicleFormConfig } from '../../common/forms/config/formConfigs.js';
import vehicleValidator from '../vehicleValidators.js';
import { useFormState } from '../../common/forms/hooks/useFormState.js';
import { useFormSubmission } from '../../common/forms/hooks/useFormSubmission.js';

const VehicleCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const navigate = useNavigate();
  const { createVehicle, isLoading } = useVehicle();
  const { enums } = useEnums();

  const formState = useFormState({
    initialData: { ...VehicleCreateRequestDTO, ...vehicleFormConfig.initialData, ...(initialData || {}) },
    totalSteps: vehicleFormConfig.totalSteps,
    validateStep: vehicleValidator.validateStep,
    validateAll: vehicleValidator.validateAll
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: (isEdit && onUpdate) ? onUpdate : createVehicle,
    validateAll: vehicleValidator.validateAll,
    formState,
    successMessage: isEdit ? 'Vehicle listing updated successfully!' : undefined,
    errorMessage: isEdit ? 'Failed to update vehicle listing' : undefined
  });

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const handleImageUpload = (imageUrl) => {
    handleInputChange({ target: { name: 'imageUrl', value: imageUrl } });
  };

  const handleImageRemove = () => {
    handleInputChange({ target: { name: 'imageUrl', value: '' } });
  };

  const renderStep = (step) => {
    switch (step) {
      case 1:
        return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">{vehicleFormConfig.steps[0].icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{vehicleFormConfig.steps[0].title}</h3>
                    <p className="text-sm text-slate-600">{vehicleFormConfig.steps[0].description}</p>
                  </div>
                </div>
                <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} isEdit={isEdit} />
              </div>
            </div>
        );

      case 2:
        return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">{vehicleFormConfig.steps[1].icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{vehicleFormConfig.steps[1].title}</h3>
                    <p className="text-sm text-slate-600">{vehicleFormConfig.steps[1].description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <EnumDropdown label="Brand *" enumKey="carBrands" value={formData.brand} onChange={(v) => handleDropdownChange('brand', v)} />
                  <EnumDropdown label="Fuel Type *" enumKey="fuelTypes" value={formData.fuelType} onChange={(v) => handleDropdownChange('fuelType', v)} />
                  <EnumDropdown label="Color" enumKey="colors" value={formData.color} onChange={(v) => handleDropdownChange('color', v)} />
                  <EnumDropdown label="Door Count" enumKey="doors" value={formData.doors} onChange={(v) => handleDropdownChange('doors', v)} />
                  <EnumDropdown label="Transmission" enumKey="gearTypes" value={formData.gearbox} onChange={(v) => handleDropdownChange('gearbox', v)} />
                  <EnumDropdown label="Seat Count" enumKey="seatCounts" value={formData.seatCount} onChange={(v) => handleDropdownChange('seatCount', v)} />
                  <input type="text" name="model" value={formData.model} onChange={handleInputChange} placeholder="Model *" className={`w-full px-4 py-3 border rounded-lg ${errors.model ? 'border-red-500' : 'border-slate-200'}`} />
                  <input type="number" name="year" value={formData.year} onChange={handleInputChange} min="1950" max={new Date().getFullYear() + 1} placeholder="Year *" className={`w-full px-4 py-3 border rounded-lg ${errors.year ? 'border-red-500' : 'border-slate-200'}`} />
                  <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} placeholder="Mileage" className="w-full px-4 py-3 border border-slate-200 rounded-lg" />
                  <input type="number" name="engineCapacity" value={formData.engineCapacity} onChange={handleInputChange} placeholder="Engine Capacity (cc)" className="w-full px-4 py-3 border border-slate-200 rounded-lg" />
                  <input type="number" name="horsePower" value={formData.horsePower} onChange={handleInputChange} placeholder="Horsepower" className="w-full px-4 py-3 border border-slate-200 rounded-lg" />
                  <input type="number" name="wheels" value={formData.wheels} onChange={handleInputChange} placeholder="Wheel Size (inch)" className="w-full px-4 py-3 border border-slate-200 rounded-lg" />
                  <input type="number" name="fuelCapacity" value={formData.fuelCapacity} onChange={handleInputChange} placeholder="Fuel Capacity (L)" className="w-full px-4 py-3 border border-slate-200 rounded-lg" />
                  <input type="number" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleInputChange} placeholder="Fuel Consumption (L/100km)" className="w-full px-4 py-3 border border-slate-200 rounded-lg" />
                  <input type="number" name="kilometersPerLiter" value={formData.kilometersPerLiter} onChange={handleInputChange} placeholder="Kilometers/Liter" className="w-full px-4 py-3 border border-slate-200 rounded-lg" />
                </div>
                
                {/* Swap Option */}
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      name="swap" 
                      checked={formData.swap} 
                      onChange={handleInputChange}
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <div>
                      <label className="text-sm font-medium text-emerald-800">Open to Swap</label>
                      <p className="text-xs text-emerald-600">Check this if you're open to exchanging your vehicle with another one</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        );

      case 3:
        return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">{vehicleFormConfig.steps[2].icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{vehicleFormConfig.steps[2].title}</h3>
                    <p className="text-sm text-slate-600">{vehicleFormConfig.steps[2].description}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    imageUrl={formData.imageUrl}
                    disabled={false}
                  />
                  <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
                </div>
              </div>
            </div>
        );

      default:
        return null;
    }
  };

  return (
      <ListingWizard
          title={isEdit ? 'Edit Vehicle Listing' : 'Create Vehicle Listing'}
          subtitle={isEdit ? 'Update your vehicle listing details' : 'Create your vehicle listing step by step'}
          steps={vehicleFormConfig.steps}
          currentStep={currentStep}
          onBack={onBack || (() => navigate(-1))}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          canSubmit={Boolean(formData.city?.trim() && formData.district?.trim())}
          renderStep={renderStep}
      />
  );
};

export default VehicleCreateForm;

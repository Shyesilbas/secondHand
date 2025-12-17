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
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  <EnumDropdown label="Brand *" enumKey="carBrands" value={formData.brand} onChange={(v) => handleDropdownChange('brand', v)} />
                  <EnumDropdown label="Fuel Type *" enumKey="fuelTypes" value={formData.fuelType} onChange={(v) => handleDropdownChange('fuelType', v)} />
                  <EnumDropdown label="Color" enumKey="colors" value={formData.color} onChange={(v) => handleDropdownChange('color', v)} />
                  <EnumDropdown label="Door Count" enumKey="doors" value={formData.doors} onChange={(v) => handleDropdownChange('doors', v)} />
                  <EnumDropdown label="Transmission" enumKey="gearTypes" value={formData.gearbox} onChange={(v) => handleDropdownChange('gearbox', v)} />
                  <EnumDropdown label="Seat Count" enumKey="seatCounts" value={formData.seatCount} onChange={(v) => handleDropdownChange('seatCount', v)} />
                  <EnumDropdown label="Drivetrain" enumKey="drivetrains" value={formData.drivetrain} onChange={(v) => handleDropdownChange('drivetrain', v)} />
                  <EnumDropdown label="Body Type" enumKey="bodyTypes" value={formData.bodyType} onChange={(v) => handleDropdownChange('bodyType', v)} />
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Model *</label>
                    <input type="text" name="model" value={formData.model} onChange={handleInputChange} placeholder="Model Name" className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all ${errors.model ? 'border-red-500' : 'border-gray-200'}`} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                    <input type="number" name="year" value={formData.year} onChange={handleInputChange} min="1950" max={new Date().getFullYear() + 1} placeholder="Year" className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all ${errors.year ? 'border-red-500' : 'border-gray-200'}`} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mileage (km)</label>
                    <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Engine (cc)</label>
                     <input type="number" name="engineCapacity" value={formData.engineCapacity} onChange={handleInputChange} placeholder="e.g. 1600" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Horsepower</label>
                     <input type="number" name="horsePower" value={formData.horsePower} onChange={handleInputChange} placeholder="e.g. 110" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Wheel Size (inch)</label>
                     <input type="number" name="wheels" value={formData.wheels} onChange={handleInputChange} placeholder="e.g. 17" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                  </div>
                  
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Capacity (L)</label>
                     <input type="number" name="fuelCapacity" value={formData.fuelCapacity} onChange={handleInputChange} placeholder="e.g. 50" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Consumption (L/100km)</label>
                     <input type="number" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleInputChange} placeholder="e.g. 6.5" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Inspection Valid Until</label>
                    <input type="date" name="inspectionValidUntil" value={formData.inspectionValidUntil} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                  </div>
              </div>

              <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleInputChange({ target: { name: 'accidentHistory', checked: !formData.accidentHistory, type: 'checkbox' } })}>
                    <input type="checkbox" name="accidentHistory" checked={Boolean(formData.accidentHistory)} onChange={handleInputChange} className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <span className="text-sm font-medium text-gray-900">This vehicle has an accident history</span>
                  </div>
                  
                  {Boolean(formData.accidentHistory) && (
                    <div className="pl-8 animate-fade-in">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Accident Details</label>
                        <textarea name="accidentDetails" value={formData.accidentDetails} onChange={handleInputChange} placeholder="Please describe the damage or accident details..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl cursor-pointer" onClick={() => handleInputChange({ target: { name: 'swap', checked: !formData.swap, type: 'checkbox' } })}>
                    <input type="checkbox" name="swap" checked={formData.swap} onChange={handleInputChange} className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                    <div>
                      <span className="text-sm font-medium text-emerald-900">Open to Swap</span>
                      <p className="text-xs text-emerald-700">Check this if you're willing to trade</p>
                    </div>
                  </div>
              </div>
            </div>
        );

      case 3:
        return (
            <div className="space-y-8">
               <ImageUpload
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  imageUrl={formData.imageUrl}
                  disabled={false}
               />
               <div className="border-t border-gray-100 pt-8">
                  <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
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

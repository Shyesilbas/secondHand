import React, { useState } from 'react';
import { useVehicle } from '../hooks/useVehicle';
import { useEnums } from '../../../hooks/useEnums';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useNotification } from '../../../context/NotificationContext';
import { VehicleCreateRequestDTO } from '../../../types/vehicles';
import EnumDropdown from '../../../components/ui/EnumDropdown';
import ListingBasics from '../../../components/forms/ListingBasics';
import LocationFields from '../../../components/forms/LocationFields';
import { vehicleFormSteps } from '../config/vehicleFormSteps';
import ListingWizard from '../../listings/components/ListingWizard';
import { validateVehicleStep1, validateVehicleStep2, validateVehicleStep3, validateVehicleAll } from '../../../utils/validators/vehicleValidators';

const VehicleCreateForm = ({ onBack }) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const { createVehicle, isLoading } = useVehicle();
  const { enums } = useEnums();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    ...VehicleCreateRequestDTO,
    price: '',
    year: '',
    mileage: '',
    engineCapacity: '',
    gearbox: '',
    seatCount: '',
    wheels: '',
    fuelCapacity: '',
    fuelConsumption: '',
    horsePower: '',
    kilometersPerLiter: '',
  });

  const steps = vehicleFormSteps;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    let newErrors = {};
    if (step === 1) newErrors = validateVehicleStep1(formData);
    if (step === 2) newErrors = validateVehicleStep2(formData, { isCreate: true });
    if (step === 3) newErrors = validateVehicleStep3(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateAllSteps = () => {
    const allErrors = validateVehicleAll(formData);
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllSteps()) {
      notification.showError('Missing Information', 'Please fill in all required fields. Location information is especially required!');

      if (errors.title || errors.description || errors.price) {
        setCurrentStep(1);
      } else if (errors.brand || errors.model || errors.year || errors.fuelType) {
        setCurrentStep(2);
      } else if (errors.city || errors.district) {
        setCurrentStep(3);
      }
      return;
    }

    try {
      // VehicleService will handle DTO transformation
      await createVehicle(formData);
      notification.showSuccess('Success', 'Listing created successfully!');
      navigate(ROUTES.MY_LISTINGS);
    } catch (error) {
      notification.showError('Error', 'An error occurred while creating the listing');
    }
  };

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
              <span className="text-xl">🚗</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Vehicle Specifications</h3>
              <p className="text-sm text-slate-600">Specify the technical details of your vehicle</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div>
              <EnumDropdown label="Brand *" enumKey="carBrands" value={formData.brand} onChange={(v) => setFormData(prev => ({...prev, brand: v}))} />
              {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Model *
              </label>
              <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.model ? 'border-red-500' : 'border-slate-200'
                  }`}
                  placeholder="e.g: 320i"
              />
              {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Year *
              </label>
              <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.year ? 'border-red-500' : 'border-slate-200'
                  }`}
                  placeholder="2020"
              />
              {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mileage
              </label>
              <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="50000"
              />
            </div>

            <div>
              <EnumDropdown label="Fuel Type *" enumKey="fuelTypes" value={formData.fuelType} onChange={(v) => setFormData(prev => ({...prev, fuelType: v}))} />
              {errors.fuelType && <p className="mt-1 text-sm text-red-600">{errors.fuelType}</p>}
            </div>

            <div>
              <EnumDropdown label="Color" enumKey="colors" value={formData.color} onChange={(v) => setFormData(prev => ({...prev, color: v}))} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Engine Capacity (cc)
              </label>
              <input
                  type="number"
                  name="engineCapacity"
                  value={formData.engineCapacity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Horsepower
              </label>
              <input
                  type="number"
                  name="horsePower"
                  value={formData.horsePower}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="150"
              />
            </div>

            <div>
              <EnumDropdown label="Door Count" enumKey="doors" value={formData.doors} onChange={(v) => setFormData(prev => ({...prev, doors: v}))} />
            </div>

            <div>
              <EnumDropdown label="Transmission" enumKey="gearTypes" value={formData.gearbox} onChange={(v) => setFormData(prev => ({...prev, gearbox: v}))} />
            </div>

            <div>
              <EnumDropdown label="Seat Count" enumKey="seatCounts" value={formData.seatCount} onChange={(v) => setFormData(prev => ({...prev, seatCount: v}))} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Wheel Size (inch)
              </label>
              <input
                  type="number"
                  name="wheels"
                  value={formData.wheels}
                  onChange={handleInputChange}
                  min="13"
                  max="24"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="17"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fuel Capacity (L)
              </label>
              <input
                  type="number"
                  name="fuelCapacity"
                  value={formData.fuelCapacity}
                  onChange={handleInputChange}
                  min="30"
                  max="150"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fuel Consumption (L/100km)
              </label>
              <input
                  type="number"
                  name="fuelConsumption"
                  value={formData.fuelConsumption}
                  onChange={handleInputChange}
                  min="1"
                  max="30"
                  step="0.1"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="7.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kilometers/Liter
              </label>
              <input
                  type="number"
                  name="kilometersPerLiter"
                  value={formData.kilometersPerLiter}
                  onChange={handleInputChange}
                  min="5"
                  max="35"
                  step="0.1"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="13.3"
              />
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
              <p className="text-sm text-slate-600">Specify the location where your vehicle is located</p>
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
              <span>🚗</span> {formData.brand} {formData.model}
            </span>
              {formData.year && (
                  <span className="flex items-center gap-1">
                <span>📅</span> {formData.year}
              </span>
              )}
              {formData.mileage && (
                  <span className="flex items-center gap-1">
                <span>🛣️</span> {parseInt(formData.mileage).toLocaleString('en-US')} km
              </span>
              )}
              {formData.fuelType && (
                  <span className="flex items-center gap-1">
                <span>⛽</span> {enums.fuelTypes?.find(f => f.value === formData.fuelType)?.label || formData.fuelType}
              </span>
              )}
            </div>

            {/* Additional details */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
              {formData.gearbox && <span>🔧 Transmission: {enums.gearTypes?.find(g => g.value === formData.gearbox)?.label || formData.gearbox}</span>}
              {formData.color && <span>🎨 Color: {enums.colors?.find(c => c.value === formData.color)?.label || formData.color}</span>}
              {formData.doors && <span>🚪 Doors: {enums.doors?.find(d => d.value === formData.doors)?.label || formData.doors}</span>}
              {formData.seatCount && <span>💺 Seats: {enums.seatCounts?.find(s => s.value === formData.seatCount)?.label || formData.seatCount}</span>}
              {formData.engineCapacity && <span>🔧 Engine: {formData.engineCapacity} cc</span>}
              {formData.horsePower && <span>💪 Power: {formData.horsePower} HP</span>}
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
          title="Create Vehicle Listing"
          subtitle="Create your vehicle listing step by step"
          steps={steps}
          currentStep={currentStep}
          onBack={onBack || (() => navigate(-1))}
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

export default VehicleCreateForm;
import React, { useState } from 'react';
import { useRealEstate } from '../hooks/useRealEstate';
import { useEnums } from '../../../hooks/useEnums';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useNotification } from '../../../context/NotificationContext';
import { RealEstateCreateRequestDTO } from '../../../types/realEstates';
import EnumDropdown from '../../../components/ui/EnumDropdown';
import ListingBasics from '../../../components/forms/ListingBasics';
import LocationFields from '../../../components/forms/LocationFields';
import { realEstateFormSteps } from '../config/realEstateFormSteps';
import ListingWizard from '../../listings/components/ListingWizard';
import { validateRealEstateStep1, validateRealEstateStep2, validateRealEstateStep3, validateRealEstateAll } from '../../../utils/validators/realEstateValidators';

const RealEstateCreateForm = ({ onBack }) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const { createRealEstate, isLoading } = useRealEstate();
  const { enums } = useEnums();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    ...RealEstateCreateRequestDTO,
    price: '',
    squareMeters: '',
    roomCount: '',
    bathroomCount: '',
    floor: '',
    buildingAge: '',
  });

  const steps = realEstateFormSteps;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    if (step === 1) newErrors = validateRealEstateStep1(formData);
    if (step === 2) newErrors = validateRealEstateStep2(formData, { isCreate: true });
    if (step === 3) newErrors = validateRealEstateStep3(formData);
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
    const allErrors = validateRealEstateAll(formData);
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllSteps()) {
      notification.showError('Missing Information', 'Please fill in all required fields. Location information is especially required!');

      if (errors.title || errors.description || errors.price) {
        setCurrentStep(1);
      } else if (errors.adType || errors.realEstateType || errors.heatingType || errors.ownerType || errors.squareMeters || errors.roomCount) {
        setCurrentStep(2);
      } else if (errors.city || errors.district) {
        setCurrentStep(3);
      }
      return;
    }

    try {
      // RealEstateService will handle DTO transformation
      await createRealEstate(formData);
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
            <span className="text-xl">🏠</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Property Details</h3>
            <p className="text-sm text-slate-600">Specify the property type, features and specifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div>
            <EnumDropdown 
              label="Ad Type *" 
              enumKey="realEstateAdTypes" 
              value={formData.adType} 
              onChange={(v) => setFormData(prev => ({...prev, adType: v}))} 
            />
            {errors.adType && <p className="mt-1 text-sm text-red-600">{errors.adType}</p>}
          </div>

          <div>
            <EnumDropdown 
              label="Property Type *" 
              enumKey="realEstateTypes" 
              value={formData.realEstateType} 
              onChange={(v) => setFormData(prev => ({...prev, realEstateType: v}))} 
            />
            {errors.realEstateType && <p className="mt-1 text-sm text-red-600">{errors.realEstateType}</p>}
          </div>

          <div>
            <EnumDropdown 
              label="Heating Type *" 
              enumKey="heatingTypes" 
              value={formData.heatingType} 
              onChange={(v) => setFormData(prev => ({...prev, heatingType: v}))} 
            />
            {errors.heatingType && <p className="mt-1 text-sm text-red-600">{errors.heatingType}</p>}
          </div>

          <div>
            <EnumDropdown 
              label="Owner Type *" 
              enumKey="ownerTypes" 
              value={formData.ownerType} 
              onChange={(v) => setFormData(prev => ({...prev, ownerType: v}))} 
            />
            {errors.ownerType && <p className="mt-1 text-sm text-red-600">{errors.ownerType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Square Meters *
            </label>
            <input
              type="number"
              name="squareMeters"
              value={formData.squareMeters}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.squareMeters ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="120"
            />
            {errors.squareMeters && <p className="mt-1 text-sm text-red-600">{errors.squareMeters}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Room Count *
            </label>
            <input
              type="number"
              name="roomCount"
              value={formData.roomCount}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.roomCount ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="3"
            />
            {errors.roomCount && <p className="mt-1 text-sm text-red-600">{errors.roomCount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bathroom Count
            </label>
            <input
              type="number"
              name="bathroomCount"
              value={formData.bathroomCount}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="2"
            />
            {errors.bathroomCount && <p className="mt-1 text-sm text-red-600">{errors.bathroomCount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Floor
            </label>
            <input
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="3"
            />
            {errors.floor && <p className="mt-1 text-sm text-red-600">{errors.floor}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Building Age
            </label>
            <input
              type="number"
              name="buildingAge"
              value={formData.buildingAge}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="5"
            />
            {errors.buildingAge && <p className="mt-1 text-sm text-red-600">{errors.buildingAge}</p>}
          </div>

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
            <p className="text-sm text-slate-600">Specify the location where your property is located</p>
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
              <span>🏠</span> {enums.realEstateTypes?.find(t => t.value === formData.realEstateType)?.label || formData.realEstateType}
            </span>
            {formData.adType && (
              <span className="flex items-center gap-1">
                <span>📋</span> {enums.realEstateAdTypes?.find(a => a.value === formData.adType)?.label || formData.adType}
              </span>
            )}
            {formData.squareMeters && (
              <span className="flex items-center gap-1">
                <span>📏</span> {formData.squareMeters} m²
              </span>
            )}
            {formData.roomCount && (
              <span className="flex items-center gap-1">
                <span>🚪</span> {formData.roomCount} rooms
              </span>
            )}
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
            {formData.heatingType && <span>🔥 Heating: {enums.heatingTypes?.find(h => h.value === formData.heatingType)?.label || formData.heatingType}</span>}
            {formData.ownerType && <span>👤 Owner: {enums.ownerTypes?.find(o => o.value === formData.ownerType)?.label || formData.ownerType}</span>}
            {formData.bathroomCount && <span>🚿 Bathrooms: {formData.bathroomCount}</span>}
            {formData.floor && <span>🏢 Floor: {formData.floor}</span>}
            {formData.buildingAge && <span>🏗️ Age: {formData.buildingAge} years</span>}
            {formData.furnished && <span>🪑 Furnished: Yes</span>}
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
      title="Create Real Estate Listing"
      subtitle="Create your real estate listing step by step"
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

export default RealEstateCreateForm;

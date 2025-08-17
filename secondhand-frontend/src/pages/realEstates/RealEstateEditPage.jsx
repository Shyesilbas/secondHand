import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRealEstate } from '../../features/realEstates/hooks/useRealEstate';
import { useEnums } from '../../hooks/useEnums';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import { realEstateFormSteps } from '../../features/realEstates/config/realEstateFormSteps';
import EnumDropdown from '../../components/ui/EnumDropdown';
import ListingBasics from '../../components/forms/ListingBasics';
import LocationFields from '../../components/forms/LocationFields';

const RealEstateEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const { enums } = useEnums();
  const { realEstate, isLoading, error, fetchRealEstate, updateRealEstate } = useRealEstate(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRealEstate(id);
  }, [id]);

  useEffect(() => {
    if (realEstate) {
      setFormData({
        title: realEstate.title || '',
        description: realEstate.description || '',
        price: realEstate.price ?? '',
        currency: realEstate.currency || 'TRY',
        city: realEstate.city || '',
        district: realEstate.district || '',

        adType: realEstate.adType || '',
        realEstateType: realEstate.realEstateType || '',
        heatingType: realEstate.heatingType || '',
        ownerType: realEstate.ownerType || '',
        squareMeters: realEstate.squareMeters ?? '',
        roomCount: realEstate.roomCount ?? '',
        bathroomCount: realEstate.bathroomCount ?? '',
        floor: realEstate.floor ?? '',
        buildingAge: realEstate.buildingAge ?? '',
        furnished: realEstate.furnished || false,
      });
    }
  }, [realEstate]);

  const steps = useMemo(() => realEstateFormSteps, []);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title || !String(formData.title).trim()) newErrors.title = 'Title is required';
      if (!formData.description || !String(formData.description).trim()) newErrors.description = 'Description is required';
      if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Please enter a valid price';
    }
    if (step === 2) {
      if (!formData.realEstateType || !String(formData.realEstateType).trim()) newErrors.realEstateType = 'Property type is required';
      if (!formData.adType || !String(formData.adType).trim()) newErrors.adType = 'Ad type is required';
      if (formData.squareMeters && parseFloat(formData.squareMeters) <= 0) newErrors.squareMeters = 'Please enter a valid square meters';
    }
    if (step === 3) {
      if (!formData.city || !String(formData.city).trim()) newErrors.city = 'City is required';
      if (!formData.district || !String(formData.district).trim()) newErrors.district = 'District is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDropdownChange = (field, values) => {
    setFormData(prev => ({ ...prev, [field]: values.length > 0 ? values[0] : '' }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If not on the last step, move forward instead of submitting
    if (currentStep < steps.length) {
      if (validateStep(currentStep)) {
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
      }
      return;
    }

    // Only send changed fields vs original realEstate
    const changed = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== (realEstate?.[key] ?? '')) {
        changed[key] = formData[key];
      }
    });

    if (Object.keys(changed).length === 0) {
      notification.showInfo('Info', 'No changes were made');
      return;
    }

    try {
      await updateRealEstate(id, changed);
      notification.showSuccess('Success', 'Listing updated successfully!');
      navigate(ROUTES.MY_LISTINGS);
    } catch (err) {
      notification.showError('Error', 'An error occurred while updating the listing');
    }
  };

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Prevent accidental submit on Enter before the last step
      e.preventDefault();
      if (currentStep < steps.length) {
        if (validateStep(currentStep)) {
          setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
      } else {
        // On last step, allow submit via explicit button only
        // No-op here; submit button will handle
      }
    }
  };

  if (isLoading && !realEstate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse h-8 w-40 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Listing</h1>
        <p className="text-slate-600">Follow the steps to update your listing</p>
      </div>

      <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${idx + 1 < currentStep ? 'bg-emerald-500 text-white' : idx + 1 === currentStep ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {idx + 1 < currentStep ? '✓' : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${idx + 1 < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-xl">📝</span></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                <p className="text-sm text-slate-600">Title, description and price</p>
              </div>
            </div>
            <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} />
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><span className="text-xl">🏠</span></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Property Features</h3>
                <p className="text-sm text-slate-600">Property type, features and details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div>
                <EnumDropdown label="Ad Type *" enumKey="realEstateAdTypes" value={formData.adType} onChange={(v) => setFormData(prev => ({...prev, adType: v}))} />
                {errors.adType && <p className="mt-1 text-sm text-red-600">{errors.adType}</p>}
              </div>

              <div>
                <EnumDropdown label="Property Type *" enumKey="realEstateTypes" value={formData.realEstateType} onChange={(v) => setFormData(prev => ({...prev, realEstateType: v}))} />
                {errors.realEstateType && <p className="mt-1 text-sm text-red-600">{errors.realEstateType}</p>}
              </div>

              <div>
                <EnumDropdown label="Heating Type" enumKey="heatingTypes" value={formData.heatingType} onChange={(v) => setFormData(prev => ({...prev, heatingType: v}))} />
              </div>

              <div>
                <EnumDropdown label="Owner Type" enumKey="ownerTypes" value={formData.ownerType} onChange={(v) => setFormData(prev => ({...prev, ownerType: v}))} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Square Meters</label>
                <input type="number" name="squareMeters" value={formData.squareMeters} onChange={handleInputChange} min="1" className="w-full px-4 py-3 border rounded-lg" />
                {errors.squareMeters && <p className="mt-1 text-sm text-red-600">{errors.squareMeters}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Room Count</label>
                <input type="number" name="roomCount" value={formData.roomCount} onChange={handleInputChange} min="0" className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bathroom Count</label>
                <input type="number" name="bathroomCount" value={formData.bathroomCount} onChange={handleInputChange} min="0" className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Floor</label>
                <input type="number" name="floor" value={formData.floor} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Building Age (years)</label>
                <input type="number" name="buildingAge" value={formData.buildingAge} onChange={handleInputChange} min="0" className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="furnished"
                  checked={formData.furnished}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-slate-700">Furnished</label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><span className="text-xl">📍</span></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Location Information</h3>
                <p className="text-sm text-slate-600">City and district</p>
              </div>
            </div>
            <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-4 py-2 rounded-lg border text-slate-700 disabled:opacity-50">Previous</button>
          {currentStep < steps.length ? (
            <button type="button" onClick={nextStep} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Next</button>
          ) : (
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Save</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RealEstateEditPage;

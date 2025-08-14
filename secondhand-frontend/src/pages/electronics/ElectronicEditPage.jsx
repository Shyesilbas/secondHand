import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnums } from '../../hooks/useEnums';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import ListingBasics from '../../components/forms/ListingBasics';
import LocationFields from '../../components/forms/LocationFields';
import EnumDropdown from '../../components/ui/EnumDropdown';
import { electronicFormSteps } from '../../features/electronics/config/electronicFormSteps';
import { useElectronic } from '../../features/electronics/hooks/useElectronic';

const ElectronicEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const { enums } = useEnums();
  const { electronic, isLoading, fetchElectronic, updateElectronic } = useElectronic(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchElectronic(id);
  }, [id]);

  useEffect(() => {
    if (electronic) {
      setFormData({
        title: electronic.title || '',
        description: electronic.description || '',
        price: electronic.price ?? '',
        currency: electronic.currency || 'TRY',
        city: electronic.city || '',
        district: electronic.district || '',

        electronicType: electronic.electronicType || '',
        electronicBrand: electronic.electronicBrand || '',
        model: electronic.model || '',
        origin: electronic.origin || '',
        warrantyProof: Boolean(electronic.warrantyProof),
        year: electronic.year ?? '',
        color: electronic.color || '',
      });
    }
  }, [electronic]);

  const steps = useMemo(() => electronicFormSteps, []);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title || !String(formData.title).trim()) newErrors.title = 'Title is required';
      if (!formData.description || !String(formData.description).trim()) newErrors.description = 'Description is required';
      if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Enter a valid price';
    }
    if (step === 2) {
      if (!formData.electronicType) newErrors.electronicType = 'Electronic type is required';
      if (!formData.electronicBrand) newErrors.electronicBrand = 'Brand is required';
      if (!formData.model || !String(formData.model).trim()) newErrors.model = 'Model is required';
      if (formData.year && parseInt(formData.year) <= 0) newErrors.year = 'Enter a valid year';
      if (!formData.color) newErrors.color = 'Color is required';
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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, steps.length)); };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, steps.length));
      return;
    }

    const changed = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== (electronic?.[key] ?? '')) changed[key] = formData[key];
    });
    if (Object.keys(changed).length === 0) {
      notification.showInfo('Info', 'No changes to save');
      return;
    }
    try {
      await updateElectronic(id, changed);
      notification.showSuccess('Success', 'Listing updated successfully!');
      navigate(ROUTES.MY_LISTINGS);
    } catch (err) {
      notification.showError('Error', 'An error occurred while updating the listing');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Electronics Listing</h1>
        <p className="text-slate-600">Follow the steps to update</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><span className="text-xl">📱</span></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Electronics Details</h3>
                <p className="text-sm text-slate-600">Type, brand and specifications</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div>
                <EnumDropdown label="Type *" enumKey="electronicTypes" value={formData.electronicType} onChange={(v) => setFormData(prev => ({...prev, electronicType: v}))} />
                {errors.electronicType && <p className="mt-1 text-sm text-red-600">{errors.electronicType}</p>}
              </div>
              <div>
                <EnumDropdown label="Brand *" enumKey="electronicBrands" value={formData.electronicBrand} onChange={(v) => setFormData(prev => ({...prev, electronicBrand: v}))} />
                {errors.electronicBrand && <p className="mt-1 text-sm text-red-600">{errors.electronicBrand}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model *</label>
                <input type="text" name="model" value={formData.model} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg ${errors.model ? 'border-red-500' : 'border-slate-200'}`} />
                {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Origin</label>
                <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" />
              </div>
              <div className="flex items-center gap-3">
                <input id="warrantyProof" type="checkbox" name="warrantyProof" checked={Boolean(formData.warrantyProof)} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-slate-300 rounded" />
                <label htmlFor="warrantyProof" className="text-sm font-medium text-slate-700">Warranty Proof Available</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
                <input type="number" name="year" value={formData.year} onChange={handleInputChange} min="1990" max={new Date().getFullYear() + 1} className={`w-full px-4 py-3 border rounded-lg ${errors.year ? 'border-red-500' : 'border-slate-200'}`} />
                {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
              </div>
              <div>
                <EnumDropdown label="Color *" enumKey="colors" value={formData.color} onChange={(v) => setFormData(prev => ({...prev, color: v}))} />
                {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><span className="text-xl">📍</span></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Location</h3>
                <p className="text-sm text-slate-600">City and district</p>
              </div>
            </div>
            <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-4 py-2 rounded-lg border text-slate-700 disabled:opacity-50">Back</button>
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

export default ElectronicEditPage;

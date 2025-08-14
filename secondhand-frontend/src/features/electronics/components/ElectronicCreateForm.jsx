import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import { useEnums } from '../../../hooks/useEnums';
import { ROUTES } from '../../../constants/routes';
import ListingBasics from '../../../components/forms/ListingBasics';
import EnumDropdown from '../../../components/ui/EnumDropdown';
import LocationFields from '../../../components/forms/LocationFields';
import { ElectronicCreateRequestDTO } from '../../../types/electronics';
import { useElectronic } from '../hooks/useElectronic';
import { electronicFormSteps } from '../config/electronicFormSteps';

const ElectronicCreateForm = ({ onBack }) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const { createElectronic, isLoading } = useElectronic();
  const { enums } = useEnums();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    ...ElectronicCreateRequestDTO,
    price: '',
    year: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.electronicType) newErrors.electronicType = 'Electronic type is required';
    if (!formData.electronicBrand) newErrors.electronicBrand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year || Number(formData.year) <= 0) newErrors.year = 'Year is required';
    if (!formData.color) newErrors.color = 'Color is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    }
    if (step === 2) {
      if (!formData.electronicType) newErrors.electronicType = 'Electronic type is required';
      if (!formData.electronicBrand) newErrors.electronicBrand = 'Brand is required';
      if (!formData.model.trim()) newErrors.model = 'Model is required';
      if (!formData.year || Number(formData.year) <= 0) newErrors.year = 'Year is required';
      if (!formData.color) newErrors.color = 'Color is required';
    }
    if (step === 3) {
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.district.trim()) newErrors.district = 'District is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const steps = useMemo(() => electronicFormSteps, []);

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep((s) => Math.min(s + 1, steps.length));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      if (validateStep(currentStep)) setCurrentStep((s) => Math.min(s + 1, steps.length));
      return;
    }
    if (!validate()) {
      notification.showError('Missing Information', 'Please fill in all required fields.');
      return;
    }
    try {
      await createElectronic(formData);
      notification.showSuccess('Success', 'Listing created successfully');
      navigate(ROUTES.MY_LISTINGS);
    } catch (err) {
      notification.showError('Error', 'An error occurred while creating the listing');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack || (() => navigate(-1))}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Create Electronics Listing</h1>
              <p className="text-slate-600 mt-1">Enter product details and location</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    {currentStep > step.id ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-300'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                  <p className="text-sm text-slate-600">Title, description and price</p>
                </div>
              </div>
              {currentStep === 1 && (
                <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} />
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📱</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Electronics Details</h3>
                  <p className="text-sm text-slate-600">Type, brand and specifications</p>
                </div>
              </div>

              {currentStep === 2 && (
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
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg ${errors.model ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="e.g. iPhone 13"
                  />
                  {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Origin</label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg"
                    placeholder="e.g. TR"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="warrantyProof"
                    type="checkbox"
                    name="warrantyProof"
                    checked={Boolean(formData.warrantyProof)}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded"
                  />
                  <label htmlFor="warrantyProof" className="text-sm font-medium text-slate-700">Warranty Proof Available</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className={`w-full px-4 py-3 border rounded-lg ${errors.year ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="2022"
                  />
                  {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                </div>

                <div>
                  <EnumDropdown label="Color *" enumKey="colors" value={formData.color} onChange={(v) => setFormData(prev => ({...prev, color: v}))} />
                  {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
                </div>
              </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Location</h3>
                  <p className="text-sm text-slate-600">Specify where the item is located</p>
                </div>
              </div>
              {currentStep === 3 && (
                <>
                  <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
                  {(!formData.city.trim() || !formData.district.trim()) && (
                    <div className="mt-3 text-sm text-red-600">City and district are required</div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <button
              type="button"
              onClick={currentStep === 1 ? (onBack || (() => navigate(-1))) : prevStep}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            <div className="flex items-center gap-2">
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Next Step
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !formData.city.trim() || !formData.district.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Listing
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ElectronicCreateForm;



import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { useEnums } from '../../../common/hooks/useEnums.js';
import { ROUTES } from '../../../common/constants/routes.js';
import ListingBasics from '../../../common/components/forms/ListingBasics.jsx';
import EnumDropdown from '../../../common/components/ui/EnumDropdown.jsx';
import LocationFields from '../../../common/components/forms/LocationFields.jsx';
import { ElectronicCreateRequestDTO } from '../../electronics.js';
import { useElectronic } from '../hooks/useElectronic.js';
import ListingWizard from '../../../listing/components/ListingWizard.jsx';
import electronicValidators from '../../electronicValidators.js';
import { createFormConfig } from '../../../common/forms/config/formConfigs.js';

const ElectronicCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const { createElectronic, isLoading } = useElectronic();
  const { enums } = useEnums();

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(() => ({
    ...ElectronicCreateRequestDTO,
    price: '',
    year: '',
    ...(initialData || {}),
  }));

  const formConfig = useMemo(() => createFormConfig('electronics'), []);
  const { steps } = formConfig;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDropdownChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const nextStep = () => {
    if (electronicValidators.validateStep(currentStep, formData, setErrors)) {
      setCurrentStep((s) => Math.min(s + 1, steps.length));
    }
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      nextStep();
      return;
    }
    if (!electronicValidators.validateStep(null, formData, setErrors)) {
      notification.showError('Missing Information', 'Please fill in all required fields.');
      return;
    }
    try {
      if (isEdit && onUpdate) {
        await onUpdate(formData);
        notification.showSuccess('Success', 'Listing updated successfully');
      } else {
        await createElectronic(formData);
        notification.showSuccess('Success', 'Listing created successfully');
      }
      navigate(ROUTES.MY_LISTINGS);
    } catch (err) {
      notification.showError('Error', isEdit ? 'An error occurred while updating the listing' : 'An error occurred while creating the listing');
    }
  };

  return (
      <ListingWizard
          title={isEdit ? 'Edit Electronics Listing' : 'Create Electronics Listing'}
          subtitle={isEdit ? 'Update product details and location' : 'Enter product details and location'}
          steps={steps}
          currentStep={currentStep}
          onBack={onBack || (() => navigate(-1))}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          canSubmit={Boolean(formData.city?.trim() && formData.district?.trim())}
          renderStep={(step) => (
              <div className="space-y-6">
                {step === 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">{steps[0].icon}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{steps[0].title}</h3>
                          <p className="text-sm text-slate-600">{steps[0].description}</p>
                        </div>
                      </div>
                      <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} />
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: steps[1].bgColor }}>
                          <span className="text-xl">{steps[1].icon}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{steps[1].title}</h3>
                          <p className="text-sm text-slate-600">{steps[1].description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <EnumDropdown label="Type *" enumKey="electronicTypes" value={formData.electronicType} onChange={(v) => handleDropdownChange('electronicType', v)} />
                        <EnumDropdown label="Brand *" enumKey="electronicBrands" value={formData.electronicBrand} onChange={(v) => handleDropdownChange('electronicBrand', v)} />
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Model *</label>
                          <input type="text" name="model" value={formData.model} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg ${errors.model ? 'border-red-500' : 'border-slate-200'}`} />
                          {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
                          <input type="number" name="year" value={formData.year} onChange={handleInputChange} min="1990" max={new Date().getFullYear() + 1} className={`w-full px-4 py-3 border rounded-lg ${errors.year ? 'border-red-500' : 'border-slate-200'}`} />
                          {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                        </div>
                        <EnumDropdown label="Color *" enumKey="colors" value={formData.color} onChange={(v) => handleDropdownChange('color', v)} />
                        <div className="flex items-center gap-3">
                          <input id="warrantyProof" type="checkbox" name="warrantyProof" checked={Boolean(formData.warrantyProof)} onChange={handleInputChange} className="h-4 w-4 text-btn-primary border-slate-300 rounded" />
                          <label htmlFor="warrantyProof" className="text-sm font-medium text-slate-700">Warranty Proof Available</label>
                        </div>
                      </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: steps[2].bgColor }}>
                          <span className="text-xl">{steps[2].icon}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{steps[2].title}</h3>
                          <p className="text-sm text-slate-600">{steps[2].description}</p>
                        </div>
                      </div>
                      <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
                      {(!formData.city?.trim() || !formData.district?.trim()) && (
                          <div className="mt-3 text-sm text-red-600">City and district are required</div>
                      )}
                    </div>
                )}
              </div>
          )}
      />
  );
};

export default ElectronicCreateForm;

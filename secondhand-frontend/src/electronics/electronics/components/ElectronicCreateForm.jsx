import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { useEnums } from '../../../common/hooks/useEnums.js';
import { ROUTES } from '../../../common/constants/routes.js';
import ListingBasics from '../../../common/components/forms/ListingBasics.jsx';
import EnumDropdown from '../../../common/components/ui/EnumDropdown.jsx';
import LocationFields from '../../../common/components/forms/LocationFields.jsx';
import ImageUpload from '../../../common/components/ImageUpload.jsx';
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

  const handleImageUpload = (imageUrl) => {
    handleInputChange({ target: { name: 'imageUrl', value: imageUrl } });
  };

  const handleImageRemove = () => {
    handleInputChange({ target: { name: 'imageUrl', value: '' } });
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
          <div className="space-y-10">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <div className="pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">Temel Bilgiler</h3>
                <p className="text-xs text-slate-500 mt-1 tracking-tight">Ürün tipi, marka ve model bilgileri</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <EnumDropdown label="Tip *" enumKey="electronicTypes" value={formData.electronicType} onChange={(v) => handleDropdownChange('electronicType', v)} />
                <EnumDropdown label="Marka *" enumKey="electronicBrands" value={formData.electronicBrand} onChange={(v) => handleDropdownChange('electronicBrand', v)} />
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Model *</label>
                  <input type="text" name="model" value={formData.model} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${errors.model ? 'border-red-300' : 'border-slate-200'}`} placeholder="e.g. MacBook Pro M1" />
                  {errors.model && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.model}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Menşei</label>
                  <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight" placeholder="e.g. Apple Store TR" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Yıl *</label>
                  <input type="number" name="year" value={formData.year} onChange={handleInputChange} min="1990" max={new Date().getFullYear() + 1} className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${errors.year ? 'border-red-300' : 'border-slate-200'}`} placeholder="YYYY" />
                  {errors.year && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.year}</p>}
                </div>
                <EnumDropdown label="Renk *" enumKey="colors" value={formData.color} onChange={(v) => handleDropdownChange('color', v)} />
              </div>
            </div>

            {formData.electronicType === 'LAPTOP' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="pb-4 border-b border-slate-100 mb-6">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">Teknik Özellikler</h3>
                  <p className="text-xs text-slate-500 mt-1 tracking-tight">RAM, depolama ve ekran bilgileri</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">RAM (GB) *</label>
                    <input type="number" name="ram" value={formData.ram} onChange={handleInputChange} min="1" className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${errors.ram ? 'border-red-300' : 'border-slate-200'}`} placeholder="8, 16, 32..." />
                    {errors.ram && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.ram}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Depolama (GB) *</label>
                    <input type="number" name="storage" value={formData.storage} onChange={handleInputChange} min="1" className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${errors.storage ? 'border-red-300' : 'border-slate-200'}`} placeholder="256, 512, 1024..." />
                    {errors.storage && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.storage}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Ekran Boyutu (inch) *</label>
                    <input type="number" name="screenSize" value={formData.screenSize} onChange={handleInputChange} min="1" step="0.1" className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${errors.screenSize ? 'border-red-300' : 'border-slate-200'}`} placeholder="13.3, 15.6..." />
                    {errors.screenSize && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.screenSize}</p>}
                  </div>
                  <EnumDropdown label="İşlemci" enumKey="processors" value={formData.processor} onChange={(v) => handleDropdownChange('processor', v)} />
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <div className="pb-4 border-b border-slate-100 mb-6">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">Ek Bilgiler</h3>
                <p className="text-xs text-slate-500 mt-1 tracking-tight">Garanti belgesi durumu</p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => handleInputChange({ target: { name: 'warrantyProof', checked: !formData.warrantyProof, type: 'checkbox' } })}>
                <input id="warrantyProof" type="checkbox" name="warrantyProof" checked={Boolean(formData.warrantyProof)} onChange={handleInputChange} className="h-5 w-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                <div>
                  <label htmlFor="warrantyProof" className="block text-sm font-semibold text-slate-900 cursor-pointer tracking-tight">Garanti Belgesi Mevcut</label>
                  <p className="text-xs text-slate-500 tracking-tight mt-1">Orijinal garanti belgeleriniz varsa işaretleyin</p>
                </div>
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
          renderStep={renderStep}
      />
  );
};

export default ElectronicCreateForm;

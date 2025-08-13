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
    // Convert numbers to strings for form inputs
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

  const handleDropdownChange = (field, values) => {
    setFormData(prev => ({
      ...prev,
      [field]: values.length > 0 ? values[0] : ''
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
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
    
    // Final validation - tüm adımları kontrol et
    if (!validateAllSteps()) {
      notification.showError('Eksik Bilgi', 'Lütfen tüm zorunlu alanları doldurun. Özellikle konum bilgileri zorunludur!');
      
      // Hata varsa ilk hatanın olduğu step'e git
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
      notification.showSuccess('Başarılı', 'İlan başarıyla oluşturuldu!');
      navigate(ROUTES.MY_LISTINGS);
    } catch (error) {
      notification.showError('Hata', 'İlan oluşturulurken bir hata oluştu');
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
                <h3 className="text-lg font-semibold text-slate-900">Temel Bilgiler</h3>
                <p className="text-sm text-slate-600">İlanınızın başlığını, açıklamasını ve fiyatını belirleyin</p>
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
            <h3 className="text-lg font-semibold text-slate-900">Araç Özellikleri</h3>
            <p className="text-sm text-slate-600">Aracınızın teknik özelliklerini belirtin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div>
            <EnumDropdown label="Marka *" enumKey="carBrands" value={formData.brand} onChange={(v) => setFormData(prev => ({...prev, brand: v}))} />
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
              placeholder="ör: 320i"
            />
            {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Yıl *
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
              Kilometre
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
            <EnumDropdown label="Yakıt Türü *" enumKey="fuelTypes" value={formData.fuelType} onChange={(v) => setFormData(prev => ({...prev, fuelType: v}))} />
            {errors.fuelType && <p className="mt-1 text-sm text-red-600">{errors.fuelType}</p>}
          </div>

          <div>
            <EnumDropdown label="Renk" enumKey="colors" value={formData.color} onChange={(v) => setFormData(prev => ({...prev, color: v}))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Motor Hacmi (cc)
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
              Beygir Gücü
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
            <EnumDropdown label="Kapı Sayısı" enumKey="doors" value={formData.doors} onChange={(v) => setFormData(prev => ({...prev, doors: v}))} />
          </div>

          <div>
            <EnumDropdown label="Vites" enumKey="gearTypes" value={formData.gearbox} onChange={(v) => setFormData(prev => ({...prev, gearbox: v}))} />
          </div>

          <div>
            <EnumDropdown label="Koltuk Sayısı" enumKey="seatCounts" value={formData.seatCount} onChange={(v) => setFormData(prev => ({...prev, seatCount: v}))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Jant Boyutu (inç)
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
              Yakıt Kapasitesi (L)
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
              Yakıt Tüketimi (L/100km)
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
              Kilometre/Litre
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
            <h3 className="text-lg font-semibold text-slate-900">Konum Bilgileri</h3>
            <p className="text-sm text-slate-600">Aracınızın bulunduğu konumu belirtin</p>
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
          <h3 className="text-lg font-semibold text-slate-900">İlan Önizleme</h3>
        </div>
        
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="text-lg font-semibold text-slate-900 mb-3">{formData.title || 'İlan Başlığı'}</h4>
          
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
                <span>🛣️</span> {parseInt(formData.mileage).toLocaleString('tr-TR')} km
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
            {formData.gearbox && <span>🔧 Vites: {enums.gearTypes?.find(g => g.value === formData.gearbox)?.label || formData.gearbox}</span>}
            {formData.color && <span>🎨 Renk: {enums.colors?.find(c => c.value === formData.color)?.label || formData.color}</span>}
            {formData.doors && <span>🚪 Kapı: {enums.doors?.find(d => d.value === formData.doors)?.label || formData.doors}</span>}
            {formData.seatCount && <span>💺 Koltuk: {enums.seatCounts?.find(s => s.value === formData.seatCount)?.label || formData.seatCount}</span>}
            {formData.engineCapacity && <span>🔧 Motor: {formData.engineCapacity} cc</span>}
            {formData.horsePower && <span>💪 Güç: {formData.horsePower} HP</span>}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-600">
              {formData.price ? `${parseInt(formData.price).toLocaleString('tr-TR')} ${formData.currency}` : 'Fiyat belirtilmemiş'}
            </span>
            <span className="text-sm text-slate-500">
              {formData.city ? `${formData.district ? formData.district + ', ' : ''}${formData.city}` : 'Konum belirtilmemiş'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
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
              <h1 className="text-3xl font-bold text-slate-900">Araç İlanı Oluştur</h1>
              <p className="text-slate-600 mt-1">Adım adım araç ilanınızı oluşturun</p>
            </div>
          </div>

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
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <button
              type="button"
              onClick={currentStep === 1 ? (onBack || (() => navigate(-1))) : prevStep}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {currentStep === 1 ? 'İptal' : 'Geri'}
            </button>

            <div className="flex items-center gap-2">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sonraki Adım
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
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      İlanı Oluştur
                    </>
                  )}
                </button>
              )}
            </div>
            
            {/* Location requirement message */}
            {currentStep === 3 && (!formData.city.trim() || !formData.district.trim()) && (
              <div className="text-center text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Şehir ve ilçe bilgileri zorunludur! İlan oluşturmak için konum bilgilerini doldurun.
                </span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleCreateForm;
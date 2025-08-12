import React, { useState } from 'react';
import { useVehicle } from '../hooks/useVehicle';
import { useEnums } from '../../../hooks/useEnums';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useToast } from '../../../context/ToastContext';
import { VehicleCreateRequestDTO } from '../../../types/vehicles';
import SearchableDropdown from '../../../components/ui/SearchableDropdown';

const VehicleCreateForm = ({ onBack }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
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

  const steps = [
    { id: 1, title: 'Temel Bilgiler', icon: '📝', description: 'Başlık, açıklama ve fiyat' },
    { id: 2, title: 'Araç Özellikleri', icon: '🚗', description: 'Marka, model ve teknik detaylar' },
    { id: 3, title: 'Konum & Önizleme', icon: '📍', description: 'Konum bilgileri ve son kontrol' }
  ];

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
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Başlık gereklidir';
        if (!formData.description.trim()) newErrors.description = 'Açıklama gereklidir';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Geçerli bir fiyat giriniz';
        break;
      case 2:
        if (!formData.brand) newErrors.brand = 'Marka seçiniz';
        if (!formData.model.trim()) newErrors.model = 'Model giriniz';
        if (!formData.year || parseInt(formData.year) < 1950) newErrors.year = 'Geçerli bir yıl giriniz';
        if (!formData.fuelType) newErrors.fuelType = 'Yakıt türü seçiniz';
        break;
      case 3:
        if (!formData.city.trim()) newErrors.city = 'Şehir gereklidir';
        break;
    }
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // VehicleService will handle DTO transformation
      await createVehicle(formData);
      showToast('İlan başarıyla oluşturuldu!', 'success');
      navigate(ROUTES.MY_LISTINGS);
    } catch (error) {
      showToast('İlan oluşturulurken bir hata oluştu', 'error');
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

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              İlan Başlığı *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.title ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="ör: 2020 BMW 320i Luxury Line"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fiyat *
              </label>
              <div className="flex">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`flex-1 px-4 py-3 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.price ? 'border-red-500' : 'border-slate-200'
                  }`}
                  placeholder="0"
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="px-4 py-3 border border-l-0 border-slate-200 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                >
                  {enums.currencies?.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Açıklama *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                errors.description ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="Aracınızın detaylı açıklamasını yazın. Özellikler, durum, bakım geçmişi gibi bilgiler ekleyebilirsiniz..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-2 text-xs text-slate-500">İyi bir açıklama potansiyel alıcıları çeker.</p>
          </div>
        </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <SearchableDropdown
              label="Marka *"
              options={enums.carBrands || []}
              selectedValues={formData.brand ? [formData.brand] : []}
              onSelectionChange={(values) => handleDropdownChange('brand', values)}
              placeholder="Marka seçin..."
              searchPlaceholder="Marka ara..."
              multiple={false}
            />
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
            <SearchableDropdown
              label="Yakıt Türü *"
              options={enums.fuelTypes || []}
              selectedValues={formData.fuelType ? [formData.fuelType] : []}
              onSelectionChange={(values) => handleDropdownChange('fuelType', values)}
              placeholder="Yakıt türü seçin..."
              searchPlaceholder="Yakıt türü ara..."
              multiple={false}
            />
            {errors.fuelType && <p className="mt-1 text-sm text-red-600">{errors.fuelType}</p>}
          </div>

          <div>
            <SearchableDropdown
              label="Renk"
              options={enums.colors || []}
              selectedValues={formData.color ? [formData.color] : []}
              onSelectionChange={(values) => handleDropdownChange('color', values)}
              placeholder="Renk seçin..."
              searchPlaceholder="Renk ara..."
              multiple={false}
            />
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
            <SearchableDropdown
              label="Kapı Sayısı"
              options={enums.doors || []}
              selectedValues={formData.doors ? [formData.doors] : []}
              onSelectionChange={(values) => handleDropdownChange('doors', values)}
              placeholder="Kapı sayısı seçin..."
              searchPlaceholder="Kapı ara..."
              multiple={false}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Şehir *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.city ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="ör: İstanbul"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              İlçe
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="ör: Kadıköy"
            />
          </div>
        </div>
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
          <h4 className="text-lg font-semibold text-slate-900 mb-2">{formData.title || 'İlan Başlığı'}</h4>
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
                  disabled={isLoading}
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleCreateForm;
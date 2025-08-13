import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicle } from '../../features/vehicles/hooks/useVehicle';
import { useEnums } from '../../hooks/useEnums';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import { vehicleFormSteps } from '../../features/vehicles/config/vehicleFormSteps';
import SearchableDropdown from '../../components/ui/SearchableDropdown';

const VehicleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const { enums } = useEnums();
  const { vehicle, isLoading, error, fetchVehicle, updateVehicle } = useVehicle(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchVehicle(id);
  }, [id]);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        title: vehicle.title || '',
        description: vehicle.description || '',
        price: vehicle.price ?? '',
        currency: vehicle.currency || 'TRY',
        city: vehicle.city || '',
        district: vehicle.district || '',

        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year ?? '',
        mileage: vehicle.mileage ?? '',
        engineCapacity: vehicle.engineCapacity ?? '',
        gearbox: vehicle.gearbox || '',
        seatCount: vehicle.seatCount || '',
        doors: vehicle.doors || '',
        wheels: vehicle.wheels ?? '',
        color: vehicle.color || '',
        fuelCapacity: vehicle.fuelCapacity ?? '',
        fuelConsumption: vehicle.fuelConsumption ?? '',
        horsePower: vehicle.horsePower ?? '',
        kilometersPerLiter: vehicle.kilometersPerLiter ?? '',
        fuelType: vehicle.fuelType || '',
      });
    }
  }, [vehicle]);

  const steps = useMemo(() => vehicleFormSteps, []);

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Başlık gereklidir';
        if (!formData.description.trim()) newErrors.description = 'Açıklama gereklidir';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Geçerli bir fiyat giriniz';
        break;
      case 2:
        if (!formData.model.trim()) newErrors.model = 'Model giriniz';
        if (formData.year && parseInt(formData.year) < 1950) newErrors.year = 'Geçerli bir yıl giriniz';
        break;
      case 3:
        if (!formData.city.trim()) newErrors.city = 'Şehir gereklidir';
        if (!formData.district.trim()) newErrors.district = 'İlçe gereklidir';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    // Only send changed fields vs original vehicle
    const changed = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== (vehicle?.[key] ?? '')) {
        changed[key] = formData[key];
      }
    });

    if (Object.keys(changed).length === 0) {
      notification.showInfo('Bilgi', 'Herhangi bir değişiklik yapılmadı');
      return;
    }

    try {
      await updateVehicle(id, changed);
      notification.showSuccess('Başarılı', 'İlan başarıyla güncellendi!');
      navigate(ROUTES.MY_LISTINGS);
    } catch (err) {
      notification.showError('Hata', 'İlan güncellenirken bir hata oluştu');
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

  if (isLoading && !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse h-8 w-40 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">İlanı Düzenle</h1>
        <p className="text-slate-600">Adımları izleyerek ilanını güncelle</p>
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
                <h3 className="text-lg font-semibold text-slate-900">Temel Bilgiler</h3>
                <p className="text-sm text-slate-600">Başlık, açıklama ve fiyat</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">İlan Başlığı *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg ${errors.title ? 'border-red-500' : 'border-slate-200'}`} />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fiyat *</label>
                <div className="flex">
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} className={`flex-1 px-4 py-3 border rounded-l-lg ${errors.price ? 'border-red-500' : 'border-slate-200'}`} />
                  <select name="currency" value={formData.currency} onChange={handleInputChange} className="px-4 py-3 border border-l-0 border-slate-200 rounded-r-lg bg-slate-50">
                    {enums.currencies?.map(c => (
                      <option key={c.value} value={c.value}>{c.symbol} {c.label}</option>
                    ))}
                  </select>
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className={`w-full px-4 py-3 border rounded-lg resize-none ${errors.description ? 'border-red-500' : 'border-slate-200'}`} />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><span className="text-xl">🚗</span></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Araç Özellikleri</h3>
                <p className="text-sm text-slate-600">Marka, model ve teknik detaylar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model *</label>
                <input type="text" name="model" value={formData.model} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg ${errors.model ? 'border-red-500' : 'border-slate-200'}`} />
                {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Yıl</label>
                <input type="number" name="year" value={formData.year} onChange={handleInputChange} min="1950" max={new Date().getFullYear() + 1} className="w-full px-4 py-3 border rounded-lg" />
                {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kilometre</label>
                <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <div>
                <SearchableDropdown
                  label="Yakıt Türü"
                  options={enums.fuelTypes || []}
                  selectedValues={formData.fuelType ? [formData.fuelType] : []}
                  onSelectionChange={(values) => handleDropdownChange('fuelType', values)}
                  placeholder="Yakıt türü seçin..."
                  searchPlaceholder="Yakıt türü ara..."
                  multiple={false}
                />
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Motor Hacmi (cc)</label>
                <input type="number" name="engineCapacity" value={formData.engineCapacity} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Beygir Gücü</label>
                <input type="number" name="horsePower" value={formData.horsePower} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" />
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

              <div>
                <SearchableDropdown
                  label="Vites"
                  options={enums.gearTypes || []}
                  selectedValues={formData.gearbox ? [formData.gearbox] : []}
                  onSelectionChange={(values) => handleDropdownChange('gearbox', values)}
                  placeholder="Vites türü seçin..."
                  searchPlaceholder="Vites ara..."
                  multiple={false}
                />
              </div>

              <div>
                <SearchableDropdown
                  label="Koltuk Sayısı"
                  options={enums.seatCounts || []}
                  selectedValues={formData.seatCount ? [formData.seatCount] : []}
                  onSelectionChange={(values) => handleDropdownChange('seatCount', values)}
                  placeholder="Koltuk sayısı seçin..."
                  searchPlaceholder="Koltuk ara..."
                  multiple={false}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jant Boyutu (inç)</label>
                <input type="number" name="wheels" value={formData.wheels} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Yakıt Kapasitesi (L)</label>
                <input type="number" name="fuelCapacity" value={formData.fuelCapacity} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Yakıt Tüketimi (L/100km)</label>
                <input type="number" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleInputChange} step="0.1" className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kilometre/Litre</label>
                <input type="number" name="kilometersPerLiter" value={formData.kilometersPerLiter} onChange={handleInputChange} step="0.1" className="w-full px-4 py-3 border rounded-lg" />
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
                <h3 className="text-lg font-semibold text-slate-900">Konum Bilgileri</h3>
                <p className="text-sm text-slate-600">Şehir ve ilçe</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Şehir *</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg ${errors.city ? 'border-red-500' : 'border-slate-200'}`} />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">İlçe *</label>
                <input type="text" name="district" value={formData.district} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-lg ${errors.district ? 'border-red-500' : 'border-slate-200'}`} />
                {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-4 py-2 rounded-lg border text-slate-700 disabled:opacity-50">Geri</button>
          {currentStep < steps.length ? (
            <button type="button" onClick={nextStep} className="px-4 py-2 rounded-lg bg-blue-600 text-white">İleri</button>
          ) : (
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Kaydet</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VehicleEditPage;


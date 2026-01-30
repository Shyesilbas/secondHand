import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../hooks/useVehicle.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { VehicleCreateRequestDTO } from '../vehicles.js';
import ListingWizard from '../../listing/components/ListingWizard.jsx';
import ListingBasics from '../../common/components/forms/ListingBasics.jsx';
import EnumDropdown from '../../common/components/ui/EnumDropdown.jsx';
import SearchableDropdown from '../../common/components/ui/SearchableDropdown.jsx';
import LocationFields from '../../common/components/forms/LocationFields.jsx';
import ImageUpload from '../../common/components/ImageUpload.jsx';
import { vehicleFormConfig } from '../../common/forms/config/formConfigs.js';
import vehicleValidator from '../vehicleValidators.js';
import { useFormState } from '../../common/forms/hooks/useFormState.js';
import { useFormSubmission } from '../../common/forms/hooks/useFormSubmission.js';

const VehicleCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const navigate = useNavigate();
  const { createVehicle, isLoading } = useVehicle();
  const { enums } = useEnums();

  const formState = useFormState({
    initialData: { ...VehicleCreateRequestDTO, ...vehicleFormConfig.initialData, ...(initialData || {}) },
    totalSteps: vehicleFormConfig.totalSteps,
    validateStep: vehicleValidator.validateStep,
    validateAll: vehicleValidator.validateAll
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: (isEdit && onUpdate) ? onUpdate : createVehicle,
    validateAll: vehicleValidator.validateAll,
    formState,
    successMessage: isEdit ? 'Vehicle listing updated successfully!' : undefined,
    errorMessage: isEdit ? 'Failed to update vehicle listing' : undefined
  });

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const selectedVehicleTypeName = useMemo(() => {
    const typeId = formData.vehicleTypeId;
    if (!typeId) return '';
    const t = (enums.vehicleTypes || []).find((x) => (x.id || x.value) === typeId);
    return String(t?.name || '').toUpperCase();
  }, [enums.vehicleTypes, formData.vehicleTypeId]);

  const isCar = selectedVehicleTypeName === 'CAR';
  const isMotorcycle = selectedVehicleTypeName === 'MOTORCYCLE';
  const isScooter = selectedVehicleTypeName === 'SCOOTER';
  const isBicycle = selectedVehicleTypeName === 'BICYCLE';
  const isTruck = selectedVehicleTypeName === 'TRUCK';
  const isVan = selectedVehicleTypeName === 'VAN';
  const isOther = selectedVehicleTypeName === 'OTHER';

  const showFuelFields = isCar || isMotorcycle || isScooter || isTruck || isVan || isOther;
  const showDoors = isCar || isTruck || isVan;
  const showSeatCount = isCar || isTruck || isVan;
  const showBodyType = isCar;
  const showDrivetrain = isCar;
  const showGearbox = isCar;

  const showEngineCapacity = isCar || isMotorcycle || isScooter || isTruck || isVan || isOther;
  const showMileage = isCar || isMotorcycle || isScooter || isTruck || isVan || isOther;
  const showPowerAndConsumption = isCar || isTruck || isVan || isOther;
  const showInspection = isCar || isTruck || isVan || isOther;

  const filteredBrandOptions = useMemo(() => {
    const allBrands = enums.carBrands || [];
    const typeId = formData.vehicleTypeId;
    if (!typeId) {
      return allBrands;
    }

    const models = enums.vehicleModels || [];
    const brandIdsForType = new Set(
      models
        .filter((m) => (m.typeId || m.type_id) === typeId)
        .map((m) => m.brandId || m.brand_id)
        .filter(Boolean)
        .map(String)
    );

    if (brandIdsForType.size === 0) {
      return allBrands;
    }

    const filtered = allBrands.filter((b) => brandIdsForType.has(String(b.id || b.value)));
    return filtered.length > 0 ? filtered : allBrands;
  }, [enums.carBrands, enums.vehicleModels, formData.vehicleTypeId]);

  const selectedModelInfo = useMemo(() => {
    if (!formData.vehicleModelId) return null;
    const m = (enums.vehicleModels || []).find((x) => String(x.id) === String(formData.vehicleModelId));
    if (!m) return null;
    return {
      modelId: String(m.id),
      brandId: String(m.brandId || m.brand_id || ''),
      typeId: String(m.typeId || m.type_id || '')
    };
  }, [enums.vehicleModels, formData.vehicleModelId]);

  useEffect(() => {
    if (!selectedModelInfo) return;
    if (formData._modelBrandId !== selectedModelInfo.brandId) {
      handleDropdownChange('_modelBrandId', selectedModelInfo.brandId);
    }
    if (formData._modelTypeId !== selectedModelInfo.typeId) {
      handleDropdownChange('_modelTypeId', selectedModelInfo.typeId);
    }
  }, [selectedModelInfo, formData._modelBrandId, formData._modelTypeId, handleDropdownChange]);

  useEffect(() => {
    if (!selectedModelInfo) return;
    if (selectedModelInfo.brandId && formData.brandId && String(formData.brandId) !== selectedModelInfo.brandId) {
      handleDropdownChange('vehicleModelId', '');
      return;
    }
    if (selectedModelInfo.typeId && formData.vehicleTypeId && String(formData.vehicleTypeId) !== selectedModelInfo.typeId) {
      handleDropdownChange('vehicleModelId', '');
      return;
    }
    if (selectedModelInfo.brandId && (!formData.brandId || String(formData.brandId) !== selectedModelInfo.brandId)) {
      handleDropdownChange('brandId', selectedModelInfo.brandId);
    }
    if (selectedModelInfo.typeId && (!formData.vehicleTypeId || String(formData.vehicleTypeId) !== selectedModelInfo.typeId)) {
      const t = (enums.vehicleTypes || []).find((x) => String(x.id || x.value) === String(selectedModelInfo.typeId));
      const tn = String(t?.name || '').toUpperCase();
      handleDropdownChange('vehicleTypeId', selectedModelInfo.typeId);
      handleDropdownChange('_vehicleTypeName', tn);
    }
  }, [
    selectedModelInfo,
    formData.brandId,
    formData.vehicleTypeId,
    formData.vehicleModelId,
    enums.vehicleTypes,
    handleDropdownChange
  ]);

  useEffect(() => {
    if (!selectedVehicleTypeName) return;
    if (formData._vehicleTypeName === selectedVehicleTypeName) return;
    handleDropdownChange('_vehicleTypeName', selectedVehicleTypeName);
  }, [selectedVehicleTypeName, formData._vehicleTypeName, handleDropdownChange]);

  const handleImageUpload = (imageUrl) => {
    handleInputChange({ target: { name: 'imageUrl', value: imageUrl } });
  };

  const handleImageRemove = () => {
    handleInputChange({ target: { name: 'imageUrl', value: '' } });
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
              showQuantity={false}
            />
        );

      case 2:
        return (
            <div className="space-y-10">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="pb-4 border-b border-slate-100 mb-6">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">Temel Bilgiler</h3>
                  <p className="text-xs text-slate-500 mt-1 tracking-tight">Araç markası, model ve temel özellikler</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <EnumDropdown
                    label="Araç Tipi *"
                    enumKey="vehicleTypes"
                    value={formData.vehicleTypeId}
                    onChange={(v) => {
                      const t = (enums.vehicleTypes || []).find((x) => (x.id || x.value) === v);
                      const tn = String(t?.name || '').toUpperCase();
                      handleDropdownChange('vehicleTypeId', v);
                      handleDropdownChange('_vehicleTypeName', tn);
                      handleDropdownChange('brandId', '');
                      handleDropdownChange('vehicleModelId', '');
                    }}
                  />
                  {errors.vehicleTypeId && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.vehicleTypeId}</p>}
                  <EnumDropdown
                    label="Marka *"
                    enumKey="carBrands"
                    value={formData.brandId}
                    options={filteredBrandOptions}
                    onChange={(v) => {
                      handleDropdownChange('brandId', v);
                      handleDropdownChange('vehicleModelId', '');
                    }}
                  />
                  <SearchableDropdown
                    label="Model *"
                    options={(enums.vehicleModels || []).filter((m) => {
                      const b = (m.brandId || m.brand_id);
                      const t = (m.typeId || m.type_id);
                      if (formData.vehicleTypeId && t !== formData.vehicleTypeId) return false;
                      return !formData.brandId || b === formData.brandId;
                    })}
                    disabled={!formData.vehicleTypeId || !formData.brandId}
                    selectedValues={formData.vehicleModelId ? [formData.vehicleModelId] : []}
                    onSelectionChange={(values) => handleDropdownChange('vehicleModelId', values[0] || '')}
                    placeholder="Model seçin..."
                    searchPlaceholder="Model ara..."
                    multiple={false}
                  />
                  {errors.vehicleModelId && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.vehicleModelId}</p>}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Yıl *</label>
                    <input type="number" name="year" value={formData.year} onChange={handleInputChange} min="1950" max={new Date().getFullYear() + 1} placeholder="YYYY" className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${errors.year ? 'border-red-300' : 'border-slate-200'}`} />
                    {errors.year && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.year}</p>}
                  </div>
                  {showFuelFields && <EnumDropdown label="Yakıt Tipi *" enumKey="fuelTypes" value={formData.fuelType} onChange={(v) => handleDropdownChange('fuelType', v)} />}
                  <EnumDropdown label="Renk" enumKey="colors" value={formData.color} onChange={(v) => handleDropdownChange('color', v)} />
                  {showDoors && <EnumDropdown label="Kapı Sayısı" enumKey="doors" value={formData.doors} onChange={(v) => handleDropdownChange('doors', v)} />}
                  {showGearbox && (
                    <div>
                      <EnumDropdown label="Vites" enumKey="gearTypes" value={formData.gearbox} onChange={(v) => handleDropdownChange('gearbox', v)} />
                      {errors.gearbox && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.gearbox}</p>}
                    </div>
                  )}
                  {showSeatCount && <EnumDropdown label="Koltuk Sayısı" enumKey="seatCounts" value={formData.seatCount} onChange={(v) => handleDropdownChange('seatCount', v)} />}
                  {showDrivetrain && <EnumDropdown label="Çekiş" enumKey="drivetrains" value={formData.drivetrain} onChange={(v) => handleDropdownChange('drivetrain', v)} />}
                  {showBodyType && (
                    <div>
                      <EnumDropdown label="Kasa Tipi" enumKey="bodyTypes" value={formData.bodyType} onChange={(v) => handleDropdownChange('bodyType', v)} />
                      {errors.bodyType && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.bodyType}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="pb-4 border-b border-slate-100 mb-6">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">Teknik Özellikler</h3>
                  <p className="text-xs text-slate-500 mt-1 tracking-tight">Motor, performans ve diğer teknik detaylar</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {showMileage && <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Kilometre (km)</label>
                    <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight" />
                  </div>}
                  {showEngineCapacity && <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Motor Hacmi (cc)</label>
                    <input type="number" name="engineCapacity" value={formData.engineCapacity} onChange={handleInputChange} placeholder="e.g. 1600" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight" />
                    {errors.engineCapacity && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.engineCapacity}</p>}
                  </div>}
                  {showPowerAndConsumption && <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Beygir Gücü</label>
                    <input type="number" name="horsePower" value={formData.horsePower} onChange={handleInputChange} placeholder="e.g. 110" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight" />
                  </div>}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Jant Boyutu (inch)</label>
                    <input type="number" name="wheels" value={formData.wheels} onChange={handleInputChange} placeholder="e.g. 17" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight" />
                  </div>
                  {showPowerAndConsumption && <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Yakıt Kapasitesi (L)</label>
                    <input type="number" name="fuelCapacity" value={formData.fuelCapacity} onChange={handleInputChange} placeholder="e.g. 50" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight" />
                  </div>}
                  {showPowerAndConsumption && <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Yakıt Tüketimi (L/100km)</label>
                    <input type="number" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleInputChange} placeholder="e.g. 6.5" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight" />
                  </div>}
                  {showInspection && <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Muayene Geçerlilik Tarihi</label>
                    <input type="date" name="inspectionValidUntil" value={formData.inspectionValidUntil} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight" />
                  </div>}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="pb-4 border-b border-slate-100 mb-6">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight">Ek Bilgiler</h3>
                  <p className="text-xs text-slate-500 mt-1 tracking-tight">Kaza geçmişi ve takas durumu</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => handleInputChange({ target: { name: 'accidentHistory', checked: !formData.accidentHistory, type: 'checkbox' } })}>
                    <input type="checkbox" name="accidentHistory" checked={Boolean(formData.accidentHistory)} onChange={handleInputChange} className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                    <span className="text-sm font-semibold text-slate-900 tracking-tight">Bu aracın kaza geçmişi var</span>
                  </div>
                  
                  {Boolean(formData.accidentHistory) && (
                    <div className="pl-8 animate-fade-in">
                      <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">Kaza Detayları</label>
                      <textarea name="accidentDetails" value={formData.accidentDetails} onChange={handleInputChange} placeholder="Kaza veya hasar detaylarını açıklayın..." rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none tracking-tight" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-emerald-50/80 border border-emerald-200/60 rounded-xl cursor-pointer" onClick={() => handleInputChange({ target: { name: 'swap', checked: !formData.swap, type: 'checkbox' } })}>
                    <input type="checkbox" name="swap" checked={formData.swap} onChange={handleInputChange} className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" />
                    <div>
                      <span className="text-sm font-semibold text-emerald-900 tracking-tight">Takasa Açık</span>
                      <p className="text-xs text-emerald-700 tracking-tight mt-1">Takas yapmaya istekliyseniz işaretleyin</p>
                    </div>
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
          title={isEdit ? 'Edit Vehicle Listing' : 'Create Vehicle Listing'}
          subtitle={isEdit ? 'Update your vehicle listing details' : 'Create your vehicle listing step by step'}
          steps={vehicleFormConfig.steps}
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

export default VehicleCreateForm;

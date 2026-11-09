import { FilterConfig } from './FilterConfig';

// Vehicle filters follow the selected types' rules (`vehicleTypes[].fieldRules` / `bodyTypes`, backend types.json).
const selectedVehicleTypes = (filters, enums) => {
 const ids = (Array.isArray(filters?.vehicleTypeIds) ? filters.vehicleTypeIds : [filters?.vehicleTypeIds])
  .filter(Boolean).map(String);
 return (enums?.vehicleTypes || []).filter((t) => ids.includes(String(t?.id)));
};

const shownForVehicleTypes = (field) => (filters, enums) => {
 const types = selectedVehicleTypes(filters, enums);
 return types.length === 0 || types.some((t) => (t?.fieldRules?.[field] ?? 'HIDDEN') !== 'HIDDEN');
};

const asList = (value) => (Array.isArray(value) ? value : value ? [value] : []).map(String);
const optionId = (o) => String(o?.id ?? o?.value ?? o?.name ?? '');

// Keeps options the user already picked, so a selection that no longer fits can still be removed.
const keepSelected = (all, allowed, selected) => all.filter((o) => allowed.has(optionId(o)) || selected.includes(optionId(o)));

const vehicleBodyTypeOptions = (filters, enums) => {
 const types = selectedVehicleTypes(filters, enums);
 if (!types.length) return null;
 const allowed = new Set(types.flatMap((t) => t?.bodyTypes || []).map(String));
 return keepSelected(enums?.bodyTypes || [], allowed, asList(filters?.bodyTypes));
};

const vehicleBrandOptions = (filters, enums) => {
 const typeIds = selectedVehicleTypes(filters, enums).map((t) => String(t.id));
 if (!typeIds.length) return null;
 const allowed = new Set((enums?.vehicleModels || [])
  .filter((m) => typeIds.includes(String(m?.typeId ?? '')))
  .map((m) => String(m?.brandId ?? '')));
 return keepSelected(enums?.carBrands || [], allowed, asList(filters?.brandIds));
};

const vehicleModelOptions = (filters, enums) => {
 const typeIds = selectedVehicleTypes(filters, enums).map((t) => String(t.id));
 const brandIds = asList(filters?.brandIds);
 if (!typeIds.length && !brandIds.length) return null;
 const models = enums?.vehicleModels || [];
 const allowed = new Set(models
  .filter((m) => (!typeIds.length || typeIds.includes(String(m?.typeId ?? '')))
   && (!brandIds.length || brandIds.includes(String(m?.brandId ?? ''))))
  .map(optionId));
 return keepSelected(models, allowed, asList(filters?.vehicleModelIds));
};

const createVehicleFilterConfig = () => {
 return new FilterConfig()
 .addEnumField('vehicleTypeIds', 'Vehicle Type', 'vehicleTypes', { displayAs: 'chips' })
 .addEnumField('brandIds', 'Brand', 'carBrands', { getOptions: vehicleBrandOptions })
 .addEnumField('vehicleModelIds', 'Model', 'vehicleModels', { getOptions: vehicleModelOptions })
 .addEnumField('bodyTypes', 'Body Type / Kasa', 'bodyTypes', { displayAs: 'chips', multiple: true, getOptions: vehicleBodyTypeOptions })
 .addEnumField('drivetrains', 'Drivetrain / Çekiş', 'drivetrains', { displayAs: 'chips', multiple: true, visibleWhen: shownForVehicleTypes('drivetrain') })
 .addEnumField('fuelTypes', 'Fuel Type / Yakıt', 'fuelTypes', { displayAs: 'chips', multiple: true, visibleWhen: shownForVehicleTypes('fuelType') })
 .addEnumField('gearTypes', 'Gear Type / Vites', 'gearTypes', { displayAs: 'chips', multiple: true, visibleWhen: shownForVehicleTypes('gearbox') })
 .addEnumField('doors', 'Doors / Kapı', 'doors', { displayAs: 'chips', visibleWhen: shownForVehicleTypes('doors') })
 .addEnumField('seatCounts', 'Seat Count / Koltuk', 'seatCounts', { displayAs: 'chips', visibleWhen: shownForVehicleTypes('seatCount') })
 .addEnumField('colors', 'Color / Renk', 'colors')
 .addNumericRangeField('year', 'Year / Yıl', { min: 1950, max: new Date().getFullYear() + 1, placeholder: '2020' })
 .addNumericRangeField('mileage', 'Mileage (km)', { min: 0, placeholder: '150000', visibleWhen: shownForVehicleTypes('mileage') })
 .addNumericRangeField('engineCapacity', 'Engine Capacity (cc)', { min: 0, placeholder: '1600', visibleWhen: shownForVehicleTypes('engineCapacity') })
 .addNumericRangeField('horsePower', 'Horse Power (HP)', { min: 0, placeholder: '150', visibleWhen: shownForVehicleTypes('horsePower') })
 .addBooleanField('swap', 'Open To Swap / Takaslı')
 .addBooleanField('accidentHistory', 'Has Accident History / Hasarlı');
};

// Electronics filters follow the selected types' rules (`electronicTypes[].fieldRules`, backend types.json)
// and, for condition filters, the attribute keys the types define (`electronicTypes[].attributeKeys`).
const selectedElectronicTypes = (filters, enums) => {
 const ids = (Array.isArray(filters?.electronicTypeIds) ? filters.electronicTypeIds : [filters?.electronicTypeIds])
  .filter(Boolean).map(String);
 return (enums?.electronicTypes || []).filter((t) => ids.includes(String(t?.id)));
};

const shownForElectronicTypes = (field) => (filters, enums) => {
 const types = selectedElectronicTypes(filters, enums);
 return types.length === 0 || types.some((t) => (t?.fieldRules?.[field] ?? 'HIDDEN') !== 'HIDDEN');
};

const shownForElectronicAttribute = (key) => (filters, enums) => {
 const types = selectedElectronicTypes(filters, enums);
 return types.length === 0 || types.some((t) => (t?.attributeKeys || []).includes(key));
};

// Options of the headphone `batteryCondition` attribute (backend data/attributes/electronics.json).
const HEADPHONE_BATTERY_CONDITIONS = [
 { value: 'LIKE_NEW', label: 'İlk günkü süreye yakın' },
 { value: 'REDUCED', label: 'Belirgin kısalmış' },
 { value: 'WEAK', label: 'Çok kısa / zayıf' },
];

const createElectronicsFilterConfig = () => {
 return new FilterConfig()
 .addEnumField('electronicTypeIds', 'Type / Cihaz Tipi', 'electronicTypes', { displayAs: 'chips' })
 .addEnumField('electronicBrandIds', 'Brand / Marka', 'electronicBrands')
 .addEnumField('electronicModelIds', 'Model', 'electronicModels')
 .addEnumField('conditions', 'Condition / Durum', 'electronicConditions', { displayAs: 'chips', multiple: true })
 .addEnumField('colors', 'Color / Renk', 'colors')
 .addNumericRangeField('year', 'Year / Yıl', { min: 2000, max: new Date().getFullYear(), placeholder: '2022' })
 .addNumericRangeField('ram', 'RAM (GB)', { min: 1, placeholder: '16', visibleWhen: shownForElectronicTypes('ram') })
 .addNumericRangeField('storage', 'Storage / Depolama (GB)', { min: 1, placeholder: '512', visibleWhen: shownForElectronicTypes('storage') })
 .addEnumField('storageTypes', 'Storage Type / Disk Tipi', 'storageTypes', { displayAs: 'chips', multiple: true, visibleWhen: shownForElectronicTypes('storageType') })
 .addEnumField('processors', 'Processor / İşlemci', 'processors', { displayAs: 'chips', multiple: true, visibleWhen: shownForElectronicTypes('processor') })
 .addNumericRangeField('screenSize', 'Screen Size / Ekran (inch)', { min: 1, placeholder: '15', visibleWhen: shownForElectronicTypes('screenSize') })
 .addNumericRangeField('batteryHealthPercent', 'Battery Health (%) / Pil Sağlığı', { min: 1, max: 100, placeholder: '85', visibleWhen: shownForElectronicAttribute('batteryHealthPercent') })
 .addBooleanField('supports5g', '5G Support / 5G Desteği', { visibleWhen: shownForElectronicTypes('supports5g') })
 .addBooleanField('dualSim', 'Dual SIM / Çift SIM', { visibleWhen: shownForElectronicTypes('dualSim') })
 .addBooleanField('hasNfc', 'NFC Support / NFC', { visibleWhen: shownForElectronicTypes('hasNfc') })
 .addBooleanField('batteryOriginal', 'Original Battery / Orijinal Batarya', { visibleWhen: shownForElectronicAttribute('batteryOriginal') })
 .addBooleanField('screenReplaced', 'Screen Replaced / Ekran Değişen', { visibleWhen: shownForElectronicAttribute('screenReplaced') })
 .addBooleanField('imeiRegistered', 'IMEI Registered / IMEI Kayıtlı TR', { visibleWhen: shownForElectronicAttribute('imeiRegistered') })
 .addEnumField('connectionTypes', 'Connection Type / Bağlantı', 'electronicConnectionTypes', { displayAs: 'chips', multiple: true, visibleWhen: shownForElectronicTypes('connectionType') })
 .addBooleanField('wireless', 'Wireless / Kablosuz', { visibleWhen: shownForElectronicTypes('wireless') })
 .addBooleanField('noiseCancelling', 'Active Noise Cancelling / ANC', { visibleWhen: shownForElectronicTypes('noiseCancelling') })
 .addBooleanField('hasMicrophone', 'Microphone / Dahili Mikrofon', { visibleWhen: shownForElectronicTypes('hasMicrophone') })
 .addNumericRangeField('controllerCount', 'Controllers / Kol Sayısı', { min: 0, max: 8, placeholder: '2', visibleWhen: shownForElectronicAttribute('controllerCount') })
 .addBooleanField('modded', 'Modded / Modlu', { visibleWhen: shownForElectronicAttribute('modded') })
 .addEnumField('batteryConditions', 'Battery Condition / Pil Durumu', 'headphoneBatteryConditions', { displayAs: 'chips', multiple: true, getOptions: () => HEADPHONE_BATTERY_CONDITIONS, visibleWhen: shownForElectronicAttribute('batteryCondition') })
 .addBooleanField('bothSidesWorking', 'Both Sides Working / İki Taraf Sorunsuz', { visibleWhen: shownForElectronicAttribute('bothSidesWorking') })
 .addBooleanField('hasBox', 'Has Original Box / Kutulu', { visibleWhen: shownForElectronicAttribute('hasBox') })
 .addBooleanField('hasInvoice', 'Has Invoice / Faturalı', { visibleWhen: shownForElectronicAttribute('hasInvoice') });
};

const createRealEstateFilterConfig = () => {
 return new FilterConfig()
 .addEnumField('realEstateTypeIds', 'Property Type / Mülk Tipi', 'realEstateTypes', { displayAs: 'chips', multiple: true })
 .addEnumField('adTypeId', 'Ad Type / İlan Tipi', 'realEstateAdTypes', { multiple: false })
 .addEnumField('ownerTypeId', 'Owner Type / Kimden', 'ownerTypes', { multiple: false })
 .addNumericRangeField('grossArea', 'Gross Area / Brüt m²', { min: 0, placeholder: '120' })
 .addNumericRangeField('netArea', 'Net Area / Net m²', { min: 0, placeholder: '100' })
 .addEnumField('roomConfigKeys', 'Rooms / Oda Sayısı', 'roomConfigs', { displayAs: 'chips', multiple: true })
 .addNumericRangeField('floor', 'Floor / Kat', { min: -1, placeholder: '3' })
 .addNumericRangeField('buildingAge', 'Building Age / Bina Yaşı', { min: 0, placeholder: '5' })
 .addEnumField('heatingTypeIds', 'Heating Type / Isınma Tipi', 'heatingTypes', { displayAs: 'chips', multiple: true })
 .addBooleanField('furnished', 'Furnished / Eşyalı')
 .addBooleanField('hasElevator', 'Elevator / Asansörlü')
 .addBooleanField('hasParking', 'Parking / Otoparklı')
 .addBooleanField('inSite', 'In a Site / Site İçinde')
 .addBooleanField('loanEligible', 'Loan Eligible / Krediye Uygun')
 .addEnumField('zoningStatusKeys', 'Zoning Status / İmar Durumu', 'zoningStatuses', { displayAs: 'chips', multiple: true });
};

// Size keys repeat across systems ("38" is a numeric and a shoe size), so sizes are picked inside one system.
const clothingSizeSystemOptions = (_filters, enums) =>
 (enums?.sizeSystems || []).filter((s) => s?.value !== 'ONE_SIZE');

const clothingSizeOptions = (filters, enums) =>
 (enums?.sizeSystems || []).find((s) => s?.value === filters?.sizeSystem)?.values || [];

const createClothingFilterConfig = () => {
 return new FilterConfig()
 .addEnumField('audiences', 'For / Kimin için', 'clothingAudiences', { displayAs: 'chips', multiple: true })
 .addEnumField('types', 'Type / Giyim Türü', 'clothingTypes', { displayAs: 'chips', multiple: true })
 .addEnumField('brands', 'Brand / Marka', 'clothingBrands')
 .addEnumField('sizeSystem', 'Size System / Beden Sistemi', 'sizeSystems', { multiple: false, getOptions: clothingSizeSystemOptions })
 .addEnumField('sizes', 'Size / Beden', 'sizeSystems', { displayAs: 'chips', multiple: true, getOptions: clothingSizeOptions, visibleWhen: (filters) => Boolean(filters?.sizeSystem) })
 .addEnumField('colors', 'Color / Renk', 'colors')
 .addEnumField('conditions', 'Condition / Durum', 'clothingConditions', { displayAs: 'chips', multiple: true })
 .addNumericRangeField('purchaseYear', 'Purchase Year / Satın Alma Yılı', { min: 1950, max: new Date().getFullYear(), placeholder: '2022' });
};

const createBooksFilterConfig = () => {
 return new FilterConfig()
 .addEnumField('bookTypeIds', 'Type / Kitap Türü', 'bookTypes', { displayAs: 'chips', multiple: true })
 .addEnumField('genreIds', 'Genre / Alt Tür & Konu', 'bookGenres')
 .addEnumField('languageIds', 'Language / Dil', 'bookLanguages', { displayAs: 'chips' })
 .addEnumField('formatIds', 'Format / Kapak Tipi', 'bookFormats', { displayAs: 'chips', multiple: true })
 .addEnumField('conditionIds', 'Condition / Durum', 'bookConditions', { displayAs: 'chips', multiple: true })
 .addNumericRangeField('year', 'Year / Basım Yılı', { min: 1450, max: new Date().getFullYear(), placeholder: '2020' })
 .addNumericRangeField('pageCount', 'Page Count / Sayfa Sayısı', { min: 1, placeholder: '250' });
};

const createSportsFilterConfig = () => {
 return new FilterConfig()
 .addEnumField('disciplineIds', 'Discipline', 'sportDisciplines')
 .addEnumField('equipmentTypeIds', 'Equipment Type', 'sportEquipmentTypes')
 .addEnumField('conditionIds', 'Condition', 'sportConditions', { displayAs: 'chips' });
};

export const filterConfigs = {
 VEHICLE: createVehicleFilterConfig(),
 ELECTRONICS: createElectronicsFilterConfig(),
 REAL_ESTATE: createRealEstateFilterConfig(),
 CLOTHING: createClothingFilterConfig(),
 BOOKS: createBooksFilterConfig(),
 SPORTS: createSportsFilterConfig(),
};

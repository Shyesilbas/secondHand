import { FilterConfig } from './FilterConfig';

export const createVehicleFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('vehicleTypeIds', 'Vehicle Type', 'vehicleTypes', { displayAs: 'chips' })
    .addEnumField('brandIds', 'Brand', 'carBrands')
    .addEnumField('vehicleModelIds', 'Model', 'vehicleModels')
    .addEnumField('bodyTypes', 'Body Type / Kasa', 'bodyTypes', { displayAs: 'chips', multiple: true })
    .addEnumField('drivetrains', 'Drivetrain / Çekiş', 'drivetrains', { displayAs: 'chips', multiple: true })
    .addEnumField('fuelTypes', 'Fuel Type / Yakıt', 'fuelTypes', { displayAs: 'chips', multiple: true })
    .addEnumField('gearTypes', 'Gear Type / Vites', 'gearTypes', { displayAs: 'chips', multiple: true })
    .addEnumField('doors', 'Doors / Kapı', 'doors', { displayAs: 'chips' })
    .addEnumField('seatCounts', 'Seat Count / Koltuk', 'seatCounts', { displayAs: 'chips' })
    .addEnumField('colors', 'Color / Renk', 'colors')
    .addNumericRangeField('year', 'Year / Yıl', { min: 1950, max: new Date().getFullYear() + 1, placeholder: '2020' })
    .addNumericRangeField('mileage', 'Mileage (km)', { min: 0, placeholder: '150000' })
    .addNumericRangeField('engineCapacity', 'Engine Capacity (cc)', { min: 0, placeholder: '1600' })
    .addNumericRangeField('horsePower', 'Horse Power (HP)', { min: 0, placeholder: '150' })
    .addBooleanField('swap', 'Open To Swap / Takaslı')
    .addBooleanField('accidentHistory', 'Has Accident History / Hasarlı');
};

const getSelectedTypeNames = (filters, enums) => {
  const selectedIds = filters.electronicTypeIds || [];
  if (!selectedIds.length) return [];
  const allTypes = enums?.electronicTypes || [];
  const matchedNames = [];
  allTypes.forEach((t) => {
    if (selectedIds.includes(t.id) || selectedIds.includes(t.value)) {
      const raw = String(t.name || t.value || t.label || '').toUpperCase();
      matchedNames.push(raw);
      if (raw.includes('TELEFON') || raw.includes('PHONE')) matchedNames.push('MOBILE_PHONE');
      if (raw.includes('DİZÜSTÜ') || raw.includes('LAPTOP')) matchedNames.push('LAPTOP');
      if (raw.includes('MASAÜSTÜ') || raw.includes('DESKTOP')) matchedNames.push('DESKTOP');
      if (raw.includes('TABLET')) matchedNames.push('TABLET');
      if (raw.includes('KULAKLIK') || raw.includes('HEADPHONE')) matchedNames.push('HEADPHONES');
      if (raw.includes('MONİTÖR') || raw.includes('MONITOR')) matchedNames.push('MONITOR');
      if (raw.includes('TV')) matchedNames.push('TV');
      if (raw.includes('KAMERA') || raw.includes('CAMERA')) matchedNames.push('CAMERA');
    }
  });
  return matchedNames;
};

export const createElectronicsFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('electronicTypeIds', 'Type / Cihaz Tipi', 'electronicTypes', { displayAs: 'chips' })
    .addEnumField('electronicBrandIds', 'Brand / Marka', 'electronicBrands')
    .addEnumField('electronicModelIds', 'Model', 'electronicModels')
    .addEnumField('conditions', 'Condition / Durum', 'electronicConditions', { displayAs: 'chips', multiple: true })
    .addEnumField('colors', 'Color / Renk', 'colors')
    .addNumericRangeField('year', 'Year / Yıl', { min: 2000, max: new Date().getFullYear(), placeholder: '2022' })
    
    // Computer Specific Filters (visible for LAPTOP or DESKTOP)
    .addNumericRangeField('ram', 'RAM (GB)', {
      min: 1,
      placeholder: '16',
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('LAPTOP') || types.includes('DESKTOP');
      }
    })
    .addNumericRangeField('storage', 'Storage / Depolama (GB)', {
      min: 1,
      placeholder: '512',
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('LAPTOP') || types.includes('DESKTOP') || types.includes('MOBILE_PHONE') || types.includes('TABLET');
      }
    })
    .addEnumField('storageTypes', 'Storage Type / Disk Tipi', 'storageTypes', {
      displayAs: 'chips',
      multiple: true,
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('LAPTOP') || types.includes('DESKTOP');
      }
    })
    .addEnumField('processors', 'Processor / İşlemci', 'processors', {
      displayAs: 'chips',
      multiple: true,
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('LAPTOP') || types.includes('DESKTOP');
      }
    })

    // Screen Size Filter (visible for LAPTOP, TV, MONITOR, TABLET)
    .addNumericRangeField('screenSize', 'Screen Size / Ekran (inch)', {
      min: 1,
      placeholder: '15.6',
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('LAPTOP') || types.includes('TV') || types.includes('MONITOR') || types.includes('TABLET');
      }
    })

    // Mobile Phone / Tablet Specific Filters
    .addNumericRangeField('batteryHealthPercent', 'Battery Health (%) / Pil Sağlığı', {
      min: 1,
      max: 100,
      placeholder: '85',
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('MOBILE_PHONE') || types.includes('TABLET') || types.includes('LAPTOP');
      }
    })
    .addBooleanField('supports5g', '5G Support / 5G Desteği', {
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('MOBILE_PHONE') || types.includes('TABLET');
      }
    })
    .addBooleanField('dualSim', 'Dual SIM / Çift SIM', {
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('MOBILE_PHONE');
      }
    })
    .addBooleanField('hasNfc', 'NFC Support / NFC', {
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('MOBILE_PHONE');
      }
    })
    .addBooleanField('batteryOriginal', 'Original Battery / Orijinal Batarya')
    .addBooleanField('screenReplaced', 'Screen Replaced / Ekran Değişen')
    .addBooleanField('imeiRegistered', 'IMEI Registered / IMEI Kayıtlı TR')

    // Headphones & Audio Filters
    .addEnumField('connectionTypes', 'Connection Type / Bağlantı', 'electronicConnectionTypes', {
      displayAs: 'chips',
      multiple: true,
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('HEADPHONES') || types.includes('SPEAKER');
      }
    })
    .addBooleanField('wireless', 'Wireless / Kablosuz', {
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('HEADPHONES') || types.includes('SPEAKER');
      }
    })
    .addBooleanField('noiseCancelling', 'Active Noise Cancelling / ANC', {
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('HEADPHONES');
      }
    })
    .addBooleanField('hasMicrophone', 'Microphone / Dahili Mikrofon', {
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.length === 0 || types.includes('HEADPHONES') || types.includes('SPEAKER');
      }
    })

    // Generic Features
    .addBooleanField('hasBox', 'Has Original Box / Kutulu')
    .addBooleanField('hasInvoice', 'Has Invoice / Faturalı');
};

export const createRealEstateFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('realEstateTypeIds', 'Property Type / Mülk Tipi', 'realEstateTypes', { displayAs: 'chips', multiple: true })
    .addEnumField('adTypeId', 'Ad Type / İlan Tipi', 'realEstateAdTypes', { multiple: false })
    .addEnumField('heatingTypeIds', 'Heating Type / Isınma Tipi', 'heatingTypes', { displayAs: 'chips', multiple: true })
    .addEnumField('ownerTypeId', 'Owner Type / Kimden', 'ownerTypes', { multiple: false })
    .addNumericRangeField('squareMeters', 'Square Meters / Net m²', { min: 0, placeholder: '120' })
    .addNumericRangeField('roomCount', 'Room Count / Oda Sayısı', { min: 1, step: 1, placeholder: '3' })
    .addNumericRangeField('bathroomCount', 'Bathroom Count / Banyo Sayısı', { min: 1, step: 1, placeholder: '1' })
    .addNumericRangeField('buildingAge', 'Building Age / Bina Yaşı', { min: 0, placeholder: '5' })
    .addNumericRangeField('floor', 'Floor / Kat', { min: 0, placeholder: '3' })
    .addBooleanField('furnished', 'Furnished / Eşyalı')
    .addTextField('zoningStatus', 'Zoning Status / İmar Durumu', { placeholder: 'e.g. Konut İmarlı, Ticari' });
};

export const createClothingFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('types', 'Type / Giyim Türü', 'clothingTypes', { displayAs: 'chips', multiple: true })
    .addEnumField('clothingGenders', 'Gender / Cinsiyet', 'clothingGenders', { displayAs: 'chips', multiple: true })
    .addEnumField('clothingCategories', 'Category / Kategori', 'clothingCategories', { displayAs: 'chips', multiple: true })
    .addEnumField('brands', 'Brand / Marka', 'clothingBrands')
    .addEnumField('sizes', 'Size / Beden', 'clothingSizes', { displayAs: 'chips', multiple: true })
    .addNumericRangeField('shoeSizeEu', 'Shoe Size / Ayakkabı No (EU)', { min: 20, max: 55, step: 1, placeholder: '42' })
    .addEnumField('colors', 'Color / Renk', 'colors')
    .addEnumField('conditions', 'Condition / Durum', 'clothingConditions', { displayAs: 'chips', multiple: true })
    .addTextField('material', 'Material / Kumaş', { placeholder: 'Örn: Pamuk, Deri, Keten' });
};

export const createBooksFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('bookTypeIds', 'Type / Kitap Türü', 'bookTypes', { displayAs: 'chips', multiple: true })
    .addEnumField('genreIds', 'Genre / Alt Tür & Konu', 'bookGenres')
    .addEnumField('languageIds', 'Language / Dil', 'bookLanguages', { displayAs: 'chips' })
    .addEnumField('formatIds', 'Format / Kapak Tipi', 'bookFormats', { displayAs: 'chips', multiple: true })
    .addEnumField('conditionIds', 'Condition / Durum', 'bookConditions', { displayAs: 'chips', multiple: true })
    .addNumericRangeField('year', 'Year / Basım Yılı', { min: 1450, max: new Date().getFullYear(), placeholder: '2020' })
    .addNumericRangeField('pageCount', 'Page Count / Sayfa Sayısı', { min: 1, placeholder: '250' });
};

export const createSportsFilterConfig = () => {
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

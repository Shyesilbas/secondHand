import { FilterConfig } from './FilterConfig';

export const createVehicleFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('vehicleTypeIds', 'Vehicle Type', 'vehicleTypes', { displayAs: 'chips' })
    .addEnumField('brandIds', 'Brand', 'carBrands')
    .addEnumField('vehicleModelIds', 'Model', 'vehicleModels')
    .addNumericRangeField('year', 'Year', { min: 1980, max: new Date().getFullYear(), placeholder: '2000' })
    .addNumericRangeField('mileage', 'Mileage', { min: 0, placeholder: '200000' })
    .addEnumField('fuelTypes', 'Fuel Type', 'fuelTypes', { displayAs: 'chips' })
    .addEnumField('gearTypes', 'Gear Type', 'gearTypes', { displayAs: 'chips' })
    .addEnumField('seatCounts', 'Seat Count', 'seatCounts', { displayAs: 'chips' })
    .addEnumField('colors', 'Color', 'colors');
};

const getSelectedTypeNames = (filters, enums) => {
  const selectedIds = filters.electronicTypeIds || [];
  const allTypes = enums?.electronicTypes || [];
  return allTypes
    .filter(t => selectedIds.includes(t.id || t.value))
    .map(t => String(t.name || t.value || '').toUpperCase());
};

export const createElectronicsFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('electronicTypeIds', 'Type', 'electronicTypes', { displayAs: 'chips' })
    .addEnumField('electronicBrandIds', 'Brand', 'electronicBrands')
    .addEnumField('electronicModelIds', 'Model', 'electronicModels')
    .addEnumField('conditions', 'Condition', 'electronicConditions', { displayAs: 'chips', multiple: true })
    .addNumericRangeField('year', 'Year', { min: 2000, max: new Date().getFullYear(), placeholder: '2020' })
    
    // Computer Specific Filters (visible only when selected type is LAPTOP or DESKTOP)
    .addNumericRangeField('ram', 'RAM (GB)', {
      min: 1,
      placeholder: '16',
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.includes('LAPTOP') || types.includes('DESKTOP');
      }
    })
    .addNumericRangeField('storage', 'Storage (GB)', {
      min: 1,
      placeholder: '512',
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.includes('LAPTOP') || types.includes('DESKTOP');
      }
    })
    .addEnumField('storageTypes', 'Storage Type', 'storageTypes', {
      displayAs: 'chips',
      multiple: true,
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.includes('LAPTOP') || types.includes('DESKTOP');
      }
    })
    .addEnumField('processors', 'Processor', 'processors', {
      displayAs: 'chips',
      multiple: true,
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.includes('LAPTOP') || types.includes('DESKTOP');
      }
    })

    // Screen Size Filter (visible only for LAPTOP, TV, MONITOR, TABLET)
    .addNumericRangeField('screenSize', 'Screen Size (inch)', {
      min: 1,
      placeholder: '15.6',
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.includes('LAPTOP') || types.includes('TV') || types.includes('MONITOR') || types.includes('TABLET');
      }
    })

    // Mobile Phone Specific Filters (visible only when MOBILE_PHONE is selected)
    .addNumericRangeField('batteryHealthPercent', 'Battery Health (%)', {
      min: 1,
      max: 100,
      placeholder: '85',
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.includes('MOBILE_PHONE');
      }
    })
    .addBooleanField('batteryOriginal', 'Original Battery', {
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.includes('MOBILE_PHONE');
      }
    })
    .addBooleanField('screenReplaced', 'Screen Replaced', {
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.includes('MOBILE_PHONE');
      }
    })
    .addBooleanField('imeiRegistered', 'IMEI Registered', {
      visibleWhen: (filters, enums) => {
        const types = getSelectedTypeNames(filters, enums);
        return types.includes('MOBILE_PHONE');
      }
    })

    // Generic features
    .addBooleanField('hasBox', 'Has Box')
    .addBooleanField('hasInvoice', 'Has Invoice');
};

export const createRealEstateFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('realEstateTypeIds', 'Property Type', 'realEstateTypes', { displayAs: 'chips' })
    .addEnumField('heatingTypeIds', 'Heating Type', 'heatingTypes', { displayAs: 'chips' })
    .addEnumField('adTypeId', 'Ad Type', 'realEstateAdTypes', { multiple: false })
    .addEnumField('ownerTypeId', 'Owner Type', 'ownerTypes', { multiple: false })
    .addTextField('zoningStatus', 'Zoning Status', { placeholder: 'e.g. zoned, imarlı' })
    .addNumericRangeField('squareMeters', 'Square Meters', { min: 0, placeholder: '100' })
    .addNumericRangeField('roomCount', 'Room Count', { min: 1, step: 1, placeholder: '3' })
    .addNumericRangeField('buildingAge', 'Building Age', { min: 0, placeholder: '10' })
    .addNumericRangeField('floor', 'Floor', { min: 0, placeholder: '5' });
};

export const createClothingFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('brands', 'Brand', 'clothingBrands')
    .addEnumField('types', 'Type', 'clothingTypes')
    .addEnumField('sizes', 'Size', 'clothingSizes')
    .addEnumField('colors', 'Color', 'colors')
    .addEnumField('conditions', 'Condition', 'clothingConditions', { displayAs: 'chips' })
    .addEnumField('clothingGenders', 'Gender (male, female, unisex)', 'clothingGenders', { displayAs: 'chips' })
    .addEnumField('clothingCategories', 'Clothing Category', 'clothingCategories', { displayAs: 'chips' })
    .addNumericRangeField('shoeSizeEu', 'Shoe Size (EU)', { min: 20, max: 55, step: 1, placeholder: '42' })
    .addTextField('material', 'Material', { placeholder: 'e.g. cotton, leather' })
    .addDateRangeField('purchaseDate', 'Purchase Date');
};

export const createBooksFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('bookTypeIds', 'Book Type', 'bookTypes', { displayAs: 'chips' })
    .addEnumField('genreIds', 'Genre', 'bookGenres')
    .addEnumField('languageIds', 'Language', 'bookLanguages')
    .addEnumField('formatIds', 'Format', 'bookFormats', { displayAs: 'chips' })
    .addEnumField('conditionIds', 'Condition', 'bookConditions', { displayAs: 'chips' })
    .addNumericRangeField('year', 'Year', { min: 1450, max: new Date().getFullYear(), placeholder: '2000' })
    .addNumericRangeField('pageCount', 'Page Count', { min: 0, placeholder: '200' });
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

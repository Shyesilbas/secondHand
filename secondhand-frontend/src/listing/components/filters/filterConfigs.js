import { FilterConfig } from './FilterConfig';


export const createVehicleFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('brandIds', 'Brands', 'carBrands', { gridSize: 'md:grid-cols-1' })
    .addNumericRangeField('year', 'Year', { min: 1980, max: new Date().getFullYear(), placeholder: '2000' })
    .addNumericRangeField('mileage', 'Mileage', { min: 0, placeholder: '200000' })
    .addEnumField('fuelTypes', 'Fuel Type', 'fuelTypes')
    .addEnumField('gearTypes', 'Gear Type', 'gearTypes')
    .addEnumField('seatCounts', 'Seat Count', 'seatCounts')
    .addEnumField('colors', 'Color', 'colors');
};

export const createElectronicsFilterConfig = () => {
  return new FilterConfig()
    .addNumericRangeField('year', 'Year', { min: 2000, max: new Date().getFullYear(), placeholder: '2020' })
    .addEnumField('electronicBrandIds', 'Brand', 'electronicBrands')
    .addEnumField('electronicTypeIds', 'Type', 'electronicTypes');
};

export const createRealEstateFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('realEstateTypeIds', 'Property Type', 'realEstateTypes')
    .addEnumField('heatingTypeIds', 'Heating Type', 'heatingTypes')
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
    .addEnumField('conditions', 'Condition', 'clothingConditions')
    .addEnumField('clothingGenders', 'Clothing Gender', 'clothingGenders')
    .addEnumField('clothingCategories', 'Clothing Category', 'clothingCategories')
    .addNumericRangeField('shoeSizeEu', 'Shoe Size (EU)', { min: 20, max: 55, step: 1, placeholder: '42' })
    .addTextField('material', 'Material', { placeholder: 'e.g. cotton, leather' })
    .addDateRangeField('purchaseDate', 'Purchase Date');
};

export const createBooksFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('bookTypeIds', 'Book Type', 'bookTypes')
    .addEnumField('genreIds', 'Genre', 'bookGenres')
    .addEnumField('languageIds', 'Language', 'bookLanguages')
    .addEnumField('formatIds', 'Format', 'bookFormats')
    .addEnumField('conditionIds', 'Condition', 'bookConditions')
    .addNumericRangeField('year', 'Year', { min: 1450, max: new Date().getFullYear(), placeholder: '2000' })
    .addNumericRangeField('pageCount', 'Page Count', { min: 0, placeholder: '200' });
};

export const createSportsFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('disciplineIds', 'Discipline', 'sportDisciplines')
    .addEnumField('equipmentTypeIds', 'Equipment Type', 'sportEquipmentTypes')
    .addEnumField('conditionIds', 'Condition', 'sportConditions');
};


export const filterConfigs = {
  VEHICLE: createVehicleFilterConfig(),
  ELECTRONICS: createElectronicsFilterConfig(),
  REAL_ESTATE: createRealEstateFilterConfig(),
  CLOTHING: createClothingFilterConfig(),
  BOOKS: createBooksFilterConfig(),
  SPORTS: createSportsFilterConfig(),
};

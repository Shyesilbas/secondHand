import { FilterConfig } from './FilterConfig';


export const createVehicleFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('brands', 'Brands', 'carBrands', { gridSize: 'md:grid-cols-1' })
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
    .addEnumField('brands', 'Brand', 'electronicBrands')
    .addEnumField('types', 'Type', 'electronicTypes');
};

export const createRealEstateFilterConfig = () => {
  return new FilterConfig()
    .addNumericRangeField('squareMeters', 'Square Meters', { min: 0, placeholder: '100' })
    .addNumericRangeField('roomCount', 'Room Count', { min: 1, step: 1, placeholder: '3' })
    .addNumericRangeField('buildingAge', 'Building Age', { min: 0, placeholder: '10' })
    .addNumericRangeField('floor', 'Floor', { min: 0, placeholder: '5' });
};

export const createClothingFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('brands', 'Brand', 'clothingBrands')
    .addEnumField('types', 'Type', 'clothingTypes')
    .addEnumField('colors', 'Color', 'colors')
    .addEnumField('conditions', 'Condition', 'clothingConditions')
    .addDateRangeField('purchaseDate', 'Purchase Date');
};

export const createBooksFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('genres', 'Genre', 'bookGenres')
    .addEnumField('languages', 'Language', 'bookLanguages')
    .addEnumField('formats', 'Format', 'bookFormats')
    .addEnumField('conditions', 'Condition', 'bookConditions')
    .addNumericRangeField('year', 'Year', { min: 1450, max: new Date().getFullYear(), placeholder: '2000' })
    .addNumericRangeField('pageCount', 'Page Count', { min: 0, placeholder: '200' });
};

export const createSportsFilterConfig = () => {
  return new FilterConfig()
    .addEnumField('disciplines', 'Discipline', 'sportDisciplines')
    .addEnumField('equipmentTypes', 'Equipment Type', 'sportEquipmentTypes')
    .addEnumField('conditions', 'Condition', 'sportConditions');
};


export const filterConfigs = {
  VEHICLE: createVehicleFilterConfig(),
  ELECTRONICS: createElectronicsFilterConfig(),
  REAL_ESTATE: createRealEstateFilterConfig(),
  CLOTHING: createClothingFilterConfig(),
  BOOKS: createBooksFilterConfig(),
  SPORTS: createSportsFilterConfig(),
};

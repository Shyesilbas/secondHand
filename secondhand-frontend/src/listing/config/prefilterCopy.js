import i18n from '../../i18n.js';

// Turkish and English copy for the category prefilter screen. Config titles stay as fallbacks.

export const isTurkish = () => !i18n?.language || i18n.language.startsWith('tr');

export const PREFILTER_CATEGORY_COPY_TR = {
  VEHICLE: { label: 'Vasıta', description: 'Otomobil, motosiklet, bisiklet' },
  ELECTRONICS: { label: 'Elektronik', description: 'Telefon, bilgisayar, televizyon' },
  REAL_ESTATE: { label: 'Emlak', description: 'Satılık ve kiralık konut, iş yeri' },
  CLOTHING: { label: 'Giyim', description: 'Kıyafet, ayakkabı, aksesuar' },
  BOOKS: { label: 'Kitap', description: 'Kitap, dergi, basılı yayın' },
  SPORTS: { label: 'Spor', description: 'Spor ekipmanı ve aksesuarları' },
  OTHER: { label: 'Diğer', description: 'Diğer kategoriler ve eşyalar' },
};

export const PREFILTER_CATEGORY_COPY_EN = {
  VEHICLE: { label: 'Vehicles', description: 'Cars, motorcycles, bicycles' },
  ELECTRONICS: { label: 'Electronics', description: 'Phones, computers, televisions' },
  REAL_ESTATE: { label: 'Real Estate', description: 'Properties for sale and rent' },
  CLOTHING: { label: 'Clothing', description: 'Clothing, shoes, accessories' },
  BOOKS: { label: 'Books', description: 'Books, magazines, printed publications' },
  SPORTS: { label: 'Sports', description: 'Sports equipment and accessories' },
  OTHER: { label: 'Other', description: 'Other categories and items' },
};

export const PREFILTER_CATEGORY_COPY = new Proxy(PREFILTER_CATEGORY_COPY_TR, {
  get(target, prop) {
    if (typeof prop === 'string') {
      const copy = isTurkish() ? PREFILTER_CATEGORY_COPY_TR[prop] : PREFILTER_CATEGORY_COPY_EN[prop];
      if (copy) return copy;
    }
    return target[prop];
  },
});

export const PREFILTER_STEP_TITLES_TR = {
  vehicleTypeId: 'Araç tipi',
  brandId: 'Marka',
  bodyType: 'Kasa tipi',
  vehicleModelId: 'Model',
  vehicleGenerationId: 'Kasa / nesil',
  vehicleEngineId: 'Motor',
  electronicTypeId: 'Ürün tipi',
  electronicBrandId: 'Marka',
  electronicModelId: 'Model',
  realEstateCategory: 'Emlak kategorisi',
  realEstateTypeId: 'Emlak tipi',
  adTypeId: 'İlan tipi',
  heatingTypeId: 'Isıtma',
  ownerTypeId: 'Kimden',
  clothingTypeId: 'Giyim tipi',
  audience: 'Kimin için',
  color: 'Renk',
  condition: 'Durum',
  conditionId: 'Durum',
  size: 'Beden',
  bookTypeId: 'Kitap tipi',
  genreId: 'Tür',
  languageId: 'Dil',
  formatId: 'Format',
  disciplineId: 'Spor dalı',
  equipmentTypeId: 'Ekipman tipi',
};

export const PREFILTER_STEP_TITLES_EN = {
  vehicleTypeId: 'Vehicle type',
  brandId: 'Brand',
  bodyType: 'Body type',
  vehicleModelId: 'Model',
  vehicleGenerationId: 'Generation',
  vehicleEngineId: 'Engine',
  electronicTypeId: 'Device type',
  electronicBrandId: 'Brand',
  electronicModelId: 'Model',
  realEstateCategory: 'Property category',
  realEstateTypeId: 'Property type',
  adTypeId: 'Listing type',
  heatingTypeId: 'Heating',
  ownerTypeId: 'From',
  clothingTypeId: 'Clothing type',
  audience: 'Audience',
  color: 'Color',
  condition: 'Condition',
  conditionId: 'Condition',
  size: 'Size',
  bookTypeId: 'Book type',
  genreId: 'Genre',
  languageId: 'Language',
  formatId: 'Format',
  disciplineId: 'Sport discipline',
  equipmentTypeId: 'Equipment type',
};

export const PREFILTER_STEP_TITLES = new Proxy(PREFILTER_STEP_TITLES_TR, {
  get(target, prop) {
    if (typeof prop === 'string') {
      const copy = isTurkish() ? PREFILTER_STEP_TITLES_TR[prop] : PREFILTER_STEP_TITLES_EN[prop];
      if (copy) return copy;
    }
    return target[prop];
  },
});

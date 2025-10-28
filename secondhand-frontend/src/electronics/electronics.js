import { ListingDTO } from '../listing/listings.js';

export const ElectronicCreateRequestDTO = {
    title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  city: '',
  district: '',
  imageUrl: '',

    electronicType: '',
  electronicBrand: '',
  model: '',
  origin: '',
  warrantyProof: false,
  year: 0,
  color: '',
  ram: '',
  storage: '',
  processor: '',
  screenSize: '',
};

export const ElectronicListingDTO = {
  ...ListingDTO,
  imageUrl: '',
    electronicType: '',
  electronicBrand: '',
  model: '',
  origin: '',
  warrantyProof: false,
  year: 0,
  color: '',
  ram: '',
  storage: '',
  processor: '',
  screenSize: '',
};

export const ElectronicSearchFiltersDTO = {
  listingType: 'ELECTRONICS',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',

    electronicTypes: [],
  electronicBrands: [],
  minYear: 0,
  maxYear: 0,
  colors: [],
  minRam: 0,
  maxRam: 0,
  minStorage: 0,
  maxStorage: 0,
  processors: [],
  minScreenSize: 0,
  maxScreenSize: 0,

    sortBy: 'createdAt',
  sortDirection: 'DESC',

    page: 0,
  size: 20,
};

export const createElectronicCreateRequest = (data) => {
  return {
    title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    price: parseFloat(data.price) || 0,
    currency: data.currency || 'TRY',
    city: (data.city || '').trim(),
    district: (data.district || '').trim(),
    imageUrl: data.imageUrl || undefined,

    electronicType: data.electronicType || '',
    electronicBrand: data.electronicBrand || '',
    model: (data.model || '').trim(),
    origin: (data.origin || '').trim(),
    warrantyProof: Boolean(data.warrantyProof),
    year: parseInt(data.year) || 0,
    color: data.color || '',
    ...(data.electronicType === 'LAPTOP' ? {
      ram: data.ram ? parseInt(data.ram) : undefined,
      storage: data.storage ? parseInt(data.storage) : undefined,
      processor: data.processor || undefined,
      screenSize: data.screenSize ? parseInt(data.screenSize) : undefined,
    } : {}),
  };
};

export const createElectronicUpdateRequest = (data) => {
  const updateData = {};
  if (data.title !== undefined && data.title !== '') updateData.title = data.title.trim();
  if (data.description !== undefined && data.description !== '') updateData.description = data.description.trim();
  if (data.price !== undefined && data.price !== '') updateData.price = parseFloat(data.price);
  if (data.currency !== undefined && data.currency !== '') updateData.currency = data.currency;
  if (data.city !== undefined && data.city !== '') updateData.city = data.city.trim();
  if (data.district !== undefined && data.district !== '') updateData.district = data.district.trim();
  if (data.electronicType !== undefined && data.electronicType !== '') updateData.electronicType = data.electronicType;
  if (data.electronicBrand !== undefined && data.electronicBrand !== '') updateData.electronicBrand = data.electronicBrand;
  if (data.model !== undefined && data.model !== '') updateData.model = data.model.trim();
  if (data.origin !== undefined && data.origin !== '') updateData.origin = data.origin.trim();
  if (data.warrantyProof !== undefined && data.warrantyProof !== '') updateData.warrantyProof = Boolean(data.warrantyProof);
  if (data.year !== undefined && data.year !== '') updateData.year = parseInt(data.year);
  if (data.color !== undefined && data.color !== '') updateData.color = data.color;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || undefined;
  if (data.electronicType === 'LAPTOP') {
    if (data.ram !== undefined && data.ram !== '') updateData.ram = parseInt(data.ram);
    if (data.storage !== undefined && data.storage !== '') updateData.storage = parseInt(data.storage);
    if (data.processor !== undefined && data.processor !== '') updateData.processor = data.processor;
    if (data.screenSize !== undefined && data.screenSize !== '') updateData.screenSize = parseInt(data.screenSize);
  }
  return updateData;
};



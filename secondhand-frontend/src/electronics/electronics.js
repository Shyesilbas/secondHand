import { ListingDTO } from '../listing/listings.js';

export const ElectronicCreateRequestDTO = {
    title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  quantity: 1,
  city: '',
  district: '',
  imageUrl: '',

    electronicTypeId: '',
  electronicBrandId: '',
  electronicModelId: '',
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
    electronicType: null,
  electronicBrand: null,
  model: null,
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

    electronicTypeIds: [],
  electronicBrandIds: [],
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
    quantity: parseInt(data.quantity) || 1,
    city: (data.city || '').trim(),
    district: (data.district || '').trim(),
    imageUrl: data.imageUrl || undefined,

    electronicTypeId: data.electronicTypeId || null,
    electronicBrandId: data.electronicBrandId || null,
    electronicModelId: data.electronicModelId || null,
    origin: (data.origin || '').trim(),
    warrantyProof: Boolean(data.warrantyProof),
    year: parseInt(data.year) || 0,
    color: data.color || '',
    ram: data.ram ? parseInt(data.ram) : undefined,
    storage: data.storage ? parseInt(data.storage) : undefined,
    processor: data.processor || undefined,
    screenSize: data.screenSize ? parseInt(data.screenSize) : undefined,
  };
};

export const createElectronicUpdateRequest = (data) => {
  const updateData = {};
  if (data.title !== undefined && data.title !== '') updateData.title = data.title.trim();
  if (data.description !== undefined && data.description !== '') updateData.description = data.description.trim();
  if (data.price !== undefined && data.price !== '') updateData.price = parseFloat(data.price);
  if (data.currency !== undefined && data.currency !== '') updateData.currency = data.currency;
  if (data.quantity !== undefined && data.quantity !== '') updateData.quantity = parseInt(data.quantity);
  if (data.city !== undefined && data.city !== '') updateData.city = data.city.trim();
  if (data.district !== undefined && data.district !== '') updateData.district = data.district.trim();
  if (data.electronicTypeId !== undefined && data.electronicTypeId !== '') updateData.electronicTypeId = data.electronicTypeId;
  if (data.electronicBrandId !== undefined && data.electronicBrandId !== '') updateData.electronicBrandId = data.electronicBrandId;
  if (data.electronicModelId !== undefined && data.electronicModelId !== '') updateData.electronicModelId = data.electronicModelId;
  if (data.origin !== undefined && data.origin !== '') updateData.origin = data.origin.trim();
  if (data.warrantyProof !== undefined && data.warrantyProof !== '') updateData.warrantyProof = Boolean(data.warrantyProof);
  if (data.year !== undefined && data.year !== '') updateData.year = parseInt(data.year);
  if (data.color !== undefined && data.color !== '') updateData.color = data.color;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || undefined;
  if (data.ram !== undefined && data.ram !== '') updateData.ram = parseInt(data.ram);
  if (data.storage !== undefined && data.storage !== '') updateData.storage = parseInt(data.storage);
  if (data.processor !== undefined && data.processor !== '') updateData.processor = data.processor;
  if (data.screenSize !== undefined && data.screenSize !== '') updateData.screenSize = parseInt(data.screenSize);
  return updateData;
};



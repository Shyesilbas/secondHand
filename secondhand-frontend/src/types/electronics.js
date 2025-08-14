// Electronics Create Request DTO
export const ElectronicCreateRequestDTO = {
  // Basic Info
  title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  city: '',
  district: '',

  // Electronics specific
  electronicType: '',
  electronicBrand: '',
  model: '',
  origin: '',
  warrantyProof: false,
  year: 0,
  color: '',
};

// Electronics Response DTO (subset + base Listing fields come from backend)
export const ElectronicListingDTO = {
  id: '',
  listingNo: '',
  title: '',
  description: '',
  price: 0,
  currency: 'TRY',
  status: '',
  city: '',
  district: '',
  sellerName: '',
  sellerSurname: '',
  sellerId: 0,
  type: 'ELECTRONICS',
  createdAt: '',
  updatedAt: '',

  // Electronics fields
  electronicType: '',
  electronicBrand: '',
  model: '',
  origin: '',
  warrantyProof: false,
  year: 0,
  color: '',
};

export const ElectronicSearchFiltersDTO = {
  listingType: 'ELECTRONICS',
  status: 'ACTIVE',
  city: '',
  district: '',
  minPrice: 0,
  maxPrice: 0,
  currency: 'TRY',

  // Electronics specific filters
  electronicTypes: [],
  electronicBrands: [],
  minYear: 0,
  maxYear: 0,
  colors: [],

  // Sorting
  sortBy: 'createdAt',
  sortDirection: 'DESC',

  // Pagination
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

    electronicType: data.electronicType || '',
    electronicBrand: data.electronicBrand || '',
    model: (data.model || '').trim(),
    origin: (data.origin || '').trim(),
    warrantyProof: Boolean(data.warrantyProof),
    year: parseInt(data.year) || 0,
    color: data.color || '',
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
  return updateData;
};



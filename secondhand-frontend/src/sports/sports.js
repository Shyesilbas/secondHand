export const SportsListingDTO = {
    id: '',
    listingNo: '',
    title: '',
    description: '',
    price: 0,
    currency: '',
    status: '',
    city: '',
    district: '',
    createdAt: '',
    updatedAt: '',
    sellerName: '',
    sellerSurname: '',
    sellerId: 0,
    type: '',
    discipline: '',
    equipmentType: '',
    condition: ''
};

export const createSportsCreateRequest = (data) => ({
  title: data.title,
  description: data.description,
  price: data.price,
  currency: data.currency || 'TRY',
  city: data.city,
  district: data.district,
  discipline: data.discipline,
  equipmentType: data.equipmentType,
  condition: data.condition,
});

export const createSportsUpdateRequest = (data) => ({
  title: data.title ?? undefined,
  description: data.description ?? undefined,
  price: data.price ?? undefined,
  currency: data.currency ?? undefined,
  city: data.city ?? undefined,
  district: data.district ?? undefined,
  discipline: data.discipline ?? undefined,
  equipmentType: data.equipmentType ?? undefined,
  condition: data.condition ?? undefined,
});


export const createSportsFilterRequest = (data) => ({
  type: 'SPORTS',
  listingType: 'SPORTS',
  status: data.status || 'ACTIVE',
  city: data.city?.trim() || '',
  district: data.district?.trim() || '',
  minPrice: parseFloat(data.minPrice) || null,
  maxPrice: parseFloat(data.maxPrice) || null,
  currency: data.currency || 'TRY',
  disciplines: Array.isArray(data.disciplines) ? data.disciplines : [],
  equipmentTypes: Array.isArray(data.equipmentTypes) ? data.equipmentTypes : [],
  conditions: Array.isArray(data.conditions) ? data.conditions : [],
  sortBy: data.sortBy || 'createdAt',
  sortDirection: data.sortDirection || 'DESC',
  page: parseInt(data.page) || 0,
  size: parseInt(data.size) || 20,
});



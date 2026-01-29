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
    imageUrl: '',
    createdAt: '',
    updatedAt: '',
    sellerName: '',
    sellerSurname: '',
    sellerId: 0,
    type: '',
    discipline: null,
    equipmentType: null,
    condition: null
};

export const createSportsCreateRequest = (data) => ({
  title: data.title,
  description: data.description,
  price: data.price,
  currency: data.currency || 'TRY',
  quantity: parseInt(data.quantity) || 1,
  city: data.city,
  district: data.district,
  imageUrl: data.imageUrl || undefined,
  disciplineId: data.disciplineId,
  equipmentTypeId: data.equipmentTypeId,
  conditionId: data.conditionId,
});

export const createSportsUpdateRequest = (data) => ({
  title: data.title ?? undefined,
  description: data.description ?? undefined,
  price: data.price ?? undefined,
  currency: data.currency ?? undefined,
  quantity: data.quantity !== undefined && data.quantity !== '' ? parseInt(data.quantity) : undefined,
  city: data.city ?? undefined,
  district: data.district ?? undefined,
  imageUrl: data.imageUrl ?? undefined,
  disciplineId: data.disciplineId ?? undefined,
  equipmentTypeId: data.equipmentTypeId ?? undefined,
  conditionId: data.conditionId ?? undefined,
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
  disciplineIds: Array.isArray(data.disciplineIds) ? data.disciplineIds : [],
  equipmentTypeIds: Array.isArray(data.equipmentTypeIds) ? data.equipmentTypeIds : [],
  conditionIds: Array.isArray(data.conditionIds) ? data.conditionIds : [],
  sortBy: data.sortBy || 'createdAt',
  sortDirection: data.sortDirection || 'DESC',
  page: parseInt(data.page) || 0,
  size: parseInt(data.size) || 20,
});



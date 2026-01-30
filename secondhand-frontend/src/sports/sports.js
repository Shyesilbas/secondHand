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
  base: {
    title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    price: data.price,
    currency: data.currency || 'TRY',
    city: (data.city || '').trim(),
    district: (data.district || '').trim(),
    imageUrl: data.imageUrl || undefined,
  },
  quantity: parseInt(data.quantity) || 1,
  disciplineId: data.disciplineId,
  equipmentTypeId: data.equipmentTypeId,
  conditionId: data.conditionId,
});

export const createSportsUpdateRequest = (data) => {
  const updateData = {};
  const base = {};
  if (data.title !== undefined) base.title = data.title;
  if (data.description !== undefined) base.description = data.description;
  if (data.price !== undefined) base.price = data.price;
  if (data.currency !== undefined) base.currency = data.currency;
  if (data.city !== undefined) base.city = data.city;
  if (data.district !== undefined) base.district = data.district;
  if (data.imageUrl !== undefined) base.imageUrl = data.imageUrl;
  if (Object.keys(base).length > 0) updateData.base = base;

  updateData.quantity = data.quantity !== undefined && data.quantity !== '' ? parseInt(data.quantity) : undefined;
  updateData.disciplineId = data.disciplineId ?? undefined;
  updateData.equipmentTypeId = data.equipmentTypeId ?? undefined;
  updateData.conditionId = data.conditionId ?? undefined;
  return updateData;
};


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



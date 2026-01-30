

export const createClothingCreateRequest = (data) => ({
    base: {
        title: (data.title || '').trim(),
        description: (data.description || '').trim(),
        price: data.price,
        currency: data.currency || 'TRY',
        city: (data.city || '').trim(),
        district: (data.district || '').trim(),
        imageUrl: data.imageUrl || undefined
    },
    quantity: parseInt(data.quantity) || 1,
    brandId: data.brandId,
    clothingTypeId: data.clothingTypeId,
    color: data.color,
    purchaseYear: data.purchaseYear !== undefined && data.purchaseYear !== '' ? parseInt(data.purchaseYear) : undefined,
    condition: data.condition,
    size: data.size || null,
    shoeSizeEu: data.shoeSizeEu !== undefined && data.shoeSizeEu !== '' ? parseInt(data.shoeSizeEu) : null,
    material: data.material ? String(data.material).trim() : null,
    clothingGender: data.clothingGender,
    clothingCategory: data.clothingCategory
});

export const createClothingUpdateRequest = (data) => {
    const updateData = {};
    const base = {};
    if (data.title !== undefined && data.title !== '') base.title = data.title;
    if (data.description !== undefined && data.description !== '') base.description = data.description;
    if (data.price !== undefined && data.price !== '') base.price = data.price;
    if (data.currency !== undefined && data.currency !== '') base.currency = data.currency;
    if (data.city !== undefined && data.city !== '') base.city = data.city;
    if (data.district !== undefined && data.district !== '') base.district = data.district;
    if (data.imageUrl !== undefined) base.imageUrl = data.imageUrl;
    if (Object.keys(base).length > 0) updateData.base = base;

    updateData.quantity = data.quantity !== undefined && data.quantity !== '' ? parseInt(data.quantity) : undefined;
    updateData.brandId = data.brandId ? data.brandId : undefined;
    updateData.clothingTypeId = data.clothingTypeId ? data.clothingTypeId : undefined;
    updateData.color = data.color ? data.color : undefined;
    updateData.purchaseYear = data.purchaseYear !== undefined && data.purchaseYear !== '' ? parseInt(data.purchaseYear) : undefined;
    updateData.condition = data.condition ? data.condition : undefined;
    updateData.size = data.size ? data.size : undefined;
    updateData.shoeSizeEu = data.shoeSizeEu !== undefined && data.shoeSizeEu !== '' ? parseInt(data.shoeSizeEu) : undefined;
    updateData.material = data.material ? String(data.material).trim() : undefined;
    updateData.clothingGender = data.clothingGender ? data.clothingGender : undefined;
    updateData.clothingCategory = data.clothingCategory ? data.clothingCategory : undefined;
    return updateData;
};

export const ClothingListingDTO = {
    id: '',
    listingNo: '',
    title: '',
    description: '',
    price: 0,
    currency: '',
    status: '',
    listingFeePaid: false,
    city: '',
    district: '',
    createdAt: '',
    updatedAt: '',
    sellerName: '',
    sellerSurname: '',
    sellerId: 0,
    type: '',
    brand: null,
    clothingType: null,
    color: '',
    purchaseDate: '',
    condition: '',
    size: '',
    shoeSizeEu: null,
    material: '',
    clothingGender: '',
    clothingCategory: ''
};

export const createClothingListingDto = (data) => ({
    id: data.id,
    listingNo: data.listingNo,
    title: data.title,
    description: data.description,
    price: data.price,
    currency: data.currency,
    status: data.status,
    listingFeePaid: data.listingFeePaid,
    city: data.city,
    district: data.district,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    sellerName: data.sellerName,
    sellerSurname: data.sellerSurname,
    sellerId: data.sellerId,
    type: data.type,
    brand: data.brand,
    clothingType: data.clothingType,
    color: data.color,
    purchaseDate: data.purchaseDate,
    condition: data.condition,
    size: data.size,
    shoeSizeEu: data.shoeSizeEu,
    material: data.material,
    imageUrl: data.imageUrl
});

export const createClothingFilterRequest = (data) => ({
    type: 'CLOTHING',
    listingType: 'CLOTHING',
    status: data.status || 'ACTIVE',
    city: data.city?.trim() || '',
    district: data.district?.trim() || '',
    minPrice: parseFloat(data.minPrice) || null,
    maxPrice: parseFloat(data.maxPrice) || null,
    currency: data.currency || 'TRY',
    
        brands: Array.isArray(data.brands) ? data.brands : [],
    types: Array.isArray(data.types) ? data.types : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
    conditions: Array.isArray(data.conditions) ? data.conditions : [],
    clothingGenders: Array.isArray(data.clothingGenders) ? data.clothingGenders : [],
    clothingCategories: Array.isArray(data.clothingCategories) ? data.clothingCategories : [],
    minPurchaseDate: data.minPurchaseDate || null,
    maxPurchaseDate: data.maxPurchaseDate || null,
    
        sortBy: data.sortBy || 'createdAt',
    sortDirection: data.sortDirection || 'DESC',
    
        page: parseInt(data.page) || 0,
    size: parseInt(data.size) || 20,
});

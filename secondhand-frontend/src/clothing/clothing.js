

export const createClothingCreateRequest = (data) => ({
    title: data.title,
    description: data.description,
    price: data.price,
    currency: data.currency,
    city: data.city,
    district: data.district,
    brand: data.brand,
    clothingType: data.clothingType,
    color: data.color,
    purchaseDate: data.purchaseDate,
    condition: data.condition,
    clothingGender: data.clothingGender,
    clothingCategory: data.clothingCategory,
    imageUrl: data.imageUrl || undefined
});

export const createClothingUpdateRequest = (data) => ({
    title: data.title ? data.title : undefined,
    description: data.description ? data.description : undefined,
    price: data.price ? data.price : undefined,
    currency: data.currency ? data.currency : undefined,
    city: data.city ? data.city : undefined,
    district: data.district ? data.district : undefined,
    brand: data.brand ? data.brand : undefined,
    clothingType: data.clothingType ? data.clothingType : undefined,
    color: data.color ? data.color : undefined,
    purchaseDate: data.purchaseDate ? data.purchaseDate : undefined,
    condition: data.condition ? data.condition : undefined,
    clothingGender: data.clothingGender ? data.clothingGender : undefined,
    clothingCategory: data.clothingCategory ? data.clothingCategory : undefined,
    imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined
});

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
    brand: '',
    clothingType: '',
    color: '',
    purchaseDate: '',
    condition: ''
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

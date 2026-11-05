import { createListingBaseCreatePayload, createListingBaseUpdatePayload } from '../listing/types/index.js';

export const createClothingCreateRequest = (data) => ({
 base: createListingBaseCreatePayload(data),
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
 const base = createListingBaseUpdatePayload(data);
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

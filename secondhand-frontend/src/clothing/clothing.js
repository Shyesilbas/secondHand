import { createListingBaseCreatePayload, createListingBaseUpdatePayload } from '../listing/types/index.js';

const toInt = (v) => (v !== undefined && v !== null && v !== '' ? parseInt(v, 10) : null);
const orNull = (v) => (v ? v : null);
const attributesOf = (data) => (data.attributes && typeof data.attributes === 'object' ? data.attributes : {});

export const createClothingCreateRequest = (data) => ({
    base: createListingBaseCreatePayload(data),
    quantity: parseInt(data.quantity) || 1,
    brandId: data.brandId,
    clothingTypeId: data.clothingTypeId,
    color: data.color,
    purchaseYear: toInt(data.purchaseYear),
    condition: data.condition,
    audience: data.audience,
    sizeSystem: orNull(data.sizeSystem),
    sizeKey: orNull(data.sizeKey),
    fit: orNull(data.fit),
    pattern: orNull(data.pattern),
    fabricType: orNull(data.fabricType),
    attributes: attributesOf(data),
});

// Optional fields are always sent so that clearing them (or a hidden field) reaches the backend.
export const createClothingUpdateRequest = (data) => {
    const updateData = {};
    const base = createListingBaseUpdatePayload(data);
    if (Object.keys(base).length > 0) updateData.base = base;

    updateData.quantity = data.quantity !== undefined && data.quantity !== '' ? parseInt(data.quantity) : undefined;
    updateData.brandId = data.brandId ? data.brandId : undefined;
    updateData.clothingTypeId = data.clothingTypeId ? data.clothingTypeId : undefined;
    updateData.color = data.color ? data.color : undefined;
    updateData.condition = data.condition ? data.condition : undefined;
    updateData.audience = data.audience ? data.audience : undefined;
    updateData.purchaseYear = toInt(data.purchaseYear);
    updateData.sizeSystem = orNull(data.sizeSystem);
    updateData.sizeKey = orNull(data.sizeKey);
    updateData.fit = orNull(data.fit);
    updateData.pattern = orNull(data.pattern);
    updateData.fabricType = orNull(data.fabricType);
    updateData.attributes = attributesOf(data);
    return updateData;
};

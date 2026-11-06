
import { createListingBaseCreatePayload, createListingBaseUpdatePayload } from '../listing/types/index.js';

export const createSportsCreateRequest = (data) => ({
    base: createListingBaseCreatePayload(data),
    quantity: parseInt(data.quantity) || 1,
    disciplineId: data.disciplineId,
    equipmentTypeId: data.equipmentTypeId,
    conditionId: data.conditionId,
});

export const createSportsUpdateRequest = (data) => {
    const updateData = {};
    const base = createListingBaseUpdatePayload(data);
    if (Object.keys(base).length > 0) updateData.base = base;

    updateData.quantity = data.quantity !== undefined && data.quantity !== '' ? parseInt(data.quantity) : undefined;
    updateData.disciplineId = data.disciplineId ?? undefined;
    updateData.equipmentTypeId = data.equipmentTypeId ?? undefined;
    updateData.conditionId = data.conditionId ?? undefined;
    return updateData;
};


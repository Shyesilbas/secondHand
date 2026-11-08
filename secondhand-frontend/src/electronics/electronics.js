import { createListingBaseCreatePayload, createListingBaseUpdatePayload } from '../listing/types/index.js';
import { cleanAttributes } from '../listing/components/attributes/attributeValues.js';

// Spec fields the electronic type rules over (backend ElectronicSpecFields / data/electronics/types.json).
const INTEGER_SPECS = ['ram', 'storage', 'screenSize', 'batteryCapacityMah', 'cameraMegapixels', 'batteryLifeHours'];
const TEXT_SPECS = ['chipset', 'gpuModel', 'operatingSystem'];
const ENUM_SPECS = ['storageType', 'processor', 'connectionType'];
const BOOLEAN_SPECS = ['supports5g', 'dualSim', 'hasNfc', 'wireless', 'noiseCancelling', 'hasMicrophone'];

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
    electronicVariantId: '',
    origin: '',
    warrantyProof: false,
    year: 0,
    color: '',
    colorName: '',
    condition: '',
    ram: '',
    storage: '',
    storageType: '',
    processor: '',
    chipset: '',
    screenSize: '',
    gpuModel: '',
    operatingSystem: '',
    batteryCapacityMah: '',
    cameraMegapixels: '',
    supports5g: false,
    dualSim: false,
    hasNfc: false,
    connectionType: '',
    wireless: false,
    noiseCancelling: false,
    hasMicrophone: false,
    batteryLifeHours: '',
    attributes: {},
};

const toInt = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : undefined;
};

const toBool = (v) => (v === true ? true : v === false ? false : undefined);

const specPayload = (data) => {
    const out = {};
    INTEGER_SPECS.forEach((k) => { if (data[k] !== undefined && data[k] !== '') out[k] = toInt(data[k]); });
    TEXT_SPECS.forEach((k) => { const v = String(data[k] ?? '').trim(); if (v) out[k] = v; });
    ENUM_SPECS.forEach((k) => { if (data[k]) out[k] = data[k]; });
    BOOLEAN_SPECS.forEach((k) => { const v = toBool(data[k]); if (v !== undefined) out[k] = v; });
    return out;
};

export const createElectronicCreateRequest = (data) => ({
    base: createListingBaseCreatePayload(data),
    quantity: parseInt(data.quantity) || 1,
    electronicTypeId: data.electronicTypeId || null,
    electronicBrandId: data.electronicBrandId || null,
    electronicModelId: data.electronicModelId || null,
    electronicVariantId: data.electronicVariantId || null,
    origin: (data.origin || '').trim(),
    warrantyProof: Boolean(data.warrantyProof),
    year: parseInt(data.year) || 0,
    color: data.color || undefined,
    colorName: data.colorName || undefined,
    condition: data.condition || undefined,
    ...specPayload(data),
    attributes: cleanAttributes(data.attributes),
});

export const createElectronicUpdateRequest = (data) => {
    const updateData = {};
    const base = createListingBaseUpdatePayload(data);
    if (data.quantity !== undefined && data.quantity !== '') updateData.quantity = parseInt(data.quantity);
    if (data.electronicTypeId) updateData.electronicTypeId = data.electronicTypeId;
    if (data.electronicBrandId) updateData.electronicBrandId = data.electronicBrandId;
    if (data.electronicModelId) updateData.electronicModelId = data.electronicModelId;
    // Sent as null to clear: the backend drops the variant when the seller picks none.
    if (data.electronicVariantId !== undefined) updateData.electronicVariantId = data.electronicVariantId || null;
    if (data.origin !== undefined && data.origin !== '') updateData.origin = data.origin.trim();
    if (data.warrantyProof !== undefined && data.warrantyProof !== '') updateData.warrantyProof = Boolean(data.warrantyProof);
    if (data.year !== undefined && data.year !== '') updateData.year = parseInt(data.year);
    if (data.color) updateData.color = data.color;
    // "" switches back to a generic color.
    if (data.colorName !== undefined) updateData.colorName = data.colorName || '';
    if (data.chipset !== undefined) updateData.chipset = String(data.chipset || '').trim();
    if (data.condition) updateData.condition = data.condition;
    Object.assign(updateData, specPayload({ ...data, chipset: '' }));
    // Sent whole: the backend replaces the stored attributes, so a cleared answer is removed.
    if (data.attributes !== undefined) updateData.attributes = cleanAttributes(data.attributes);
    if (Object.keys(base).length > 0) updateData.base = base;
    return updateData;
};

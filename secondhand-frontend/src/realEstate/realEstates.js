import { createListingBaseCreatePayload, createListingBaseUpdatePayload } from '../listing/types/index.js';
import { cleanAttributes } from '../listing/components/attributes/attributeValues.js';
import { REAL_ESTATE_FIELDS } from './utils/realEstateRules.js';

export const RealEstateCreateRequestDTO = {
	title: '',
	description: '',
	price: 0,
	currency: 'TRY',
	city: '',
	district: '',
	imageUrl: '',

	adTypeId: '',
	realEstateTypeId: '',
	heatingTypeId: '',
	ownerTypeId: '',
	...Object.fromEntries([...REAL_ESTATE_FIELDS.integer, ...REAL_ESTATE_FIELDS.decimal, ...REAL_ESTATE_FIELDS.text].map((k) => [k, ''])),
	...Object.fromEntries(REAL_ESTATE_FIELDS.toggle.map((k) => [k, false])),
	attributes: {},
	_realEstateTypeName: '',
};

const toInt = (v) => {
	const n = parseInt(v, 10);
	return Number.isFinite(n) ? n : null;
};

const toDecimal = (v) => {
	const n = Number.parseFloat(String(v).replace(',', '.'));
	return Number.isFinite(n) ? n : null;
};

/**
 * Every rule-governed field is sent, empty ones as null, so an edit can clear a value; the backend also clears
 * the fields the property type hides.
 */
const specPayload = (data) => {
	const out = {};
	REAL_ESTATE_FIELDS.integer.forEach((k) => { out[k] = data[k] === '' || data[k] == null ? null : toInt(data[k]); });
	REAL_ESTATE_FIELDS.decimal.forEach((k) => { out[k] = data[k] === '' || data[k] == null ? null : toDecimal(data[k]); });
	REAL_ESTATE_FIELDS.text.forEach((k) => { out[k] = String(data[k] ?? '').trim() || null; });
	REAL_ESTATE_FIELDS.toggle.forEach((k) => { out[k] = Boolean(data[k]); });
	return out;
};

export const createRealEstateCreateRequest = (data) => ({
	base: createListingBaseCreatePayload(data),
	adTypeId: data.adTypeId || null,
	realEstateTypeId: data.realEstateTypeId || null,
	heatingTypeId: data.heatingTypeId || null,
	ownerTypeId: data.ownerTypeId || null,
	...specPayload(data),
	attributes: cleanAttributes(data.attributes),
});

export const createRealEstateUpdateRequest = (data) => {
	const updateData = {};
	const base = createListingBaseUpdatePayload(data);
	if (data.adTypeId) updateData.adTypeId = data.adTypeId;
	if (data.realEstateTypeId) updateData.realEstateTypeId = data.realEstateTypeId;
	// Sent as null to clear (heating is hidden for land).
	if (data.heatingTypeId !== undefined) updateData.heatingTypeId = data.heatingTypeId || null;
	if (data.ownerTypeId) updateData.ownerTypeId = data.ownerTypeId;
	Object.assign(updateData, specPayload(data));
	// Sent whole: the backend replaces the stored attributes, so a cleared answer is removed.
	if (data.attributes !== undefined) updateData.attributes = cleanAttributes(data.attributes);
	if (Object.keys(base).length > 0) updateData.base = base;
	return updateData;
};

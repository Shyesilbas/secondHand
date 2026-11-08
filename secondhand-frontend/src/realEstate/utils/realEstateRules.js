/** Real estate type rules: field visibility and requirement come from `realEstateTypes[].fieldRules`. */

const normalizeId = (id) => String(id ?? '');

export const findRealEstateType = (ctx) => {
	const typeId = ctx?.formData?.realEstateTypeId ?? ctx?.selection?.realEstateTypeId;
	if (!typeId) return null;
	return (ctx?.enums?.realEstateTypes || []).find((t) => normalizeId(t?.id) === normalizeId(typeId)) || null;
};

/** REQUIRED, OPTIONAL or HIDDEN; null while no type is selected. A field the rules do not name is HIDDEN. */
export const realEstateFieldRule = (ctx, field) => {
	const type = findRealEstateType(ctx);
	if (!type) return null;
	return type.fieldRules?.[field] ?? 'HIDDEN';
};

export const isRealEstateFieldVisible = (ctx, field) => {
	const rule = realEstateFieldRule(ctx, field);
	return rule != null && rule !== 'HIDDEN';
};

export const ruledByRealEstateType = (field) => ({
	visibleWhen: (ctx) => isRealEstateFieldVisible(ctx, field),
	requiredWhen: (ctx) => realEstateFieldRule(ctx, field) === 'REQUIRED',
});

const adTypeName = (ctx) => {
	const id = ctx?.formData?.adTypeId ?? ctx?.selection?.adTypeId;
	const ad = (ctx?.enums?.realEstateAdTypes || []).find((a) => normalizeId(a?.id) === normalizeId(id));
	return String(ad?.name || '').toUpperCase();
};

/** Attribute answers the backend keeps only for one ad type (deposit / lease term for rent, loan for sale). */
const RENT_ONLY = ['deposit', 'minLeaseMonths'];
const SALE_ONLY = ['loanEligible'];

export const attributeKeysHiddenForAdType = (ctx) => {
	const ad = adTypeName(ctx);
	if (!ad) return [...RENT_ONLY, ...SALE_ONLY];
	return [...(ad === 'FOR_RENT' ? [] : RENT_ONLY), ...(ad === 'FOR_SALE' ? [] : SALE_ONLY)];
};

/** Every rule-governed listing field, in form order (mirrors backend RealEstateSpecFields). */
export const REAL_ESTATE_FIELDS = {
	integer: ['grossAreaM2', 'netAreaM2', 'bathroomCount', 'totalFloors', 'buildingAge', 'gardenAreaM2', 'landShareM2'],
	decimal: ['monthlyFee', 'floorAreaRatio', 'heightLimit', 'roadFrontage'],
	text: ['roomConfigKey', 'floorKey', 'buildingCondition', 'siteName', 'zoningStatusKey', 'parcelNo', 'blockNo', 'sheetNo', 'infrastructureStatusKey'],
	toggle: ['furnished', 'hasBalcony', 'hasElevator', 'hasParking', 'inSite', 'hasPool', 'electricityAvailable', 'roadAccess', 'exchangeable'],
};

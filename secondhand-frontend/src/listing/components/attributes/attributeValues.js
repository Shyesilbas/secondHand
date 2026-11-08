/**
 * Listing attributes (`listing.attributes`) as described by their definitions
 * (`listing_attribute_definitions`: dataType, options with group KEY/VALUE, unit, min/max).
 */

/** Definitions a seller fills in; CATALOG-level keys describe the catalog and are rejected on a listing. */
export const listingLevelDefinitions = (definitions) =>
	(Array.isArray(definitions) ? definitions : [])
		.filter((d) => d?.level === 'LISTING')
		.sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));

export const valueOptions = (definition) =>
	(definition?.options || []).filter((o) => o?.group !== 'KEY').map((o) => ({ value: o.value, label: o.label }));

export const keyOptions = (definition) =>
	(definition?.options || []).filter((o) => o?.group === 'KEY').map((o) => ({ value: o.value, label: o.label }));

export const BOOLEAN_OPTIONS = [
	{ value: 'true', label: 'Evet' },
	{ value: 'false', label: 'Hayır' },
];

export const isEmptyAttributeValue = (value) =>
	value == null
	|| (typeof value === 'string' && value.trim() === '')
	|| (Array.isArray(value) && value.length === 0)
	|| (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);

/** Attributes without empty answers; "not answered" is never sent. */
export const cleanAttributes = (attributes) => {
	const out = {};
	Object.entries(attributes || {}).forEach(([key, value]) => {
		if (!isEmptyAttributeValue(value)) out[key] = value;
	});
	return out;
};

export const attributeLabel = (definition) =>
	definition?.unit ? `${definition.label} (${definition.unit})` : definition?.label || definition?.key || '';

const optionLabel = (options, value) => options.find((o) => String(o.value) === String(value))?.label ?? String(value);

/** One answered value as display text, or null when not answered. */
export const formatAttributeValue = (definition, value) => {
	if (isEmptyAttributeValue(value)) return null;
	switch (definition?.dataType) {
		case 'BOOLEAN':
			return value === true ? 'Evet' : value === false ? 'Hayır' : null;
		case 'ENUM':
			return optionLabel(valueOptions(definition), value);
		case 'MULTI_ENUM':
			return (Array.isArray(value) ? value : []).map((v) => optionLabel(valueOptions(definition), v)).join(', ');
		case 'INTEGER':
		case 'DECIMAL': {
			const n = Number(value);
			const text = Number.isFinite(n) ? n.toLocaleString('tr-TR') : String(value);
			return definition.unit ? `${text} ${definition.unit}` : text;
		}
		case 'ENUM_MAP': {
			// Summary: parts that are not original, e.g. "Kaput: Boyalı · Tavan: Değişmiş".
			const keys = keyOptions(definition);
			const values = valueOptions(definition);
			const changed = Object.entries(value).filter(([, v]) => v !== 'ORIGINAL');
			if (!changed.length) {
				return Object.keys(value).length >= keys.length ? 'Tamamı orijinal' : 'İşaretlenen parçalar orijinal';
			}
			return changed.map(([k, v]) => `${optionLabel(keys, k)}: ${optionLabel(values, v)}`).join(' · ');
		}
		default:
			return String(value);
	}
};

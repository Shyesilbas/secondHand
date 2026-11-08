/** Electronics catalog helpers — type rules, model facts (specs, official colors) and variants. */

export const normalizeId = (id) => String(id ?? '');

export const findElectronicType = (ctx) => {
	const typeId = ctx?.formData?.electronicTypeId ?? ctx?.selection?.electronicTypeId;
	if (!typeId) return null;
	return (ctx?.enums?.electronicTypes || []).find((t) => normalizeId(t?.id) === normalizeId(typeId)) || null;
};

/**
 * The selected type's rule for a spec field: REQUIRED, OPTIONAL or HIDDEN (backend `types.json`,
 * served in `electronicTypes[].fieldRules`). Null while no type is selected.
 */
export const electronicFieldRule = (ctx, field) => {
	const type = findElectronicType(ctx);
	if (!type) return null;
	return type.fieldRules?.[field] ?? 'HIDDEN';
};

export const isElectronicFieldVisible = (ctx, field) => {
	const rule = electronicFieldRule(ctx, field);
	return rule != null && rule !== 'HIDDEN';
};

export const isElectronicFieldRequired = (ctx, field) => electronicFieldRule(ctx, field) === 'REQUIRED';

export const findElectronicModel = (enums, modelId) =>
	modelId ? (enums?.electronicModels || []).find((m) => normalizeId(m?.id) === normalizeId(modelId)) : undefined;

export const filterElectronicModels = (models, { typeId, brandId } = {}) =>
	(models || []).filter((m) => {
		if (typeId && normalizeId(m?.typeId ?? m?.type_id) !== normalizeId(typeId)) return false;
		if (brandId && normalizeId(m?.brandId ?? m?.brand_id) !== normalizeId(brandId)) return false;
		return true;
	});

export const toModelOptions = (models) =>
	(models || [])
		.map((m) => ({ id: normalizeId(m?.id), label: String(m?.name ?? ''), releaseYear: m?.releaseYear, isLegacy: m?.isLegacy, aliases: m?.aliases || [] }))
		.filter((o) => o.id && o.label);

const selectedModel = (ctx) => findElectronicModel(ctx?.enums, ctx?.formData?.electronicModelId);

export const variantsOf = (ctx) => selectedModel(ctx)?.variants || [];

export const colorsOf = (ctx) => selectedModel(ctx)?.colors || [];

export const findVariant = (ctx) => {
	const id = ctx?.formData?.electronicVariantId;
	return id ? variantsOf(ctx).find((v) => normalizeId(v?.id) === normalizeId(id)) : undefined;
};

const VARIANT_COLUMNS = ['ram', 'storage', 'storageType', 'processor', 'chipset', 'gpuModel'];

const hasFact = (value) => value != null && value !== '';

/**
 * Facts a listing copies from its catalog model and variant. The backend overwrites these columns with
 * the catalog values (ElectronicSpecSnapshotter), so the form shows them filled and read-only. Only
 * fields the type does not hide are returned.
 */
export const catalogFacts = (ctx) => {
	const model = selectedModel(ctx);
	if (!model) return {};
	const facts = {};
	const put = (key, value) => {
		if (hasFact(value) && isElectronicFieldVisible(ctx, key)) facts[key] = value;
	};
	Object.entries(model.specs || {}).forEach(([key, value]) => put(key, value));
	const variant = findVariant(ctx);
	if (variant) {
		VARIANT_COLUMNS.forEach((key) => put(key, variant[key]));
		Object.entries(variant.specs || {}).forEach(([key, value]) => put(key, value));
	}
	return facts;
};

/** True when the field's value comes from the catalog and cannot be edited. */
export const isCatalogLocked = (ctx, field) => Object.prototype.hasOwnProperty.call(catalogFacts(ctx), field);

export const catalogLockedHint = (ctx, field) =>
	isCatalogLocked(ctx, field) ? 'Seçilen model ve sürümün katalog bilgisinden dolduruldu' : undefined;

/** visibleWhen + requiredWhen + lock of a spec field, all from the type rules and the catalog. */
export const ruledByElectronicType = (field, { hideWhenLocked = false } = {}) => ({
	visibleWhen: (ctx) => isElectronicFieldVisible(ctx, field) && !(hideWhenLocked && isCatalogLocked(ctx, field)),
	requiredWhen: (ctx) => isElectronicFieldRequired(ctx, field) && !isCatalogLocked(ctx, field),
	disabledWhen: (ctx) => isCatalogLocked(ctx, field),
	getDescription: (ctx) => catalogLockedHint(ctx, field),
});

const officialColor = (ctx) => {
	const name = ctx?.formData?.colorName;
	return name ? colorsOf(ctx).find((c) => c?.name === name) : undefined;
};

/**
 * Keeps the catalog facts and the generic color in step with the picked model, variant and official
 * color. Runs as a form effect, so it also covers pre-form selections, edited listings and drafts.
 */
export const syncElectronicCatalog = (ctx) => {
	if (typeof ctx?.setValue !== 'function') return;
	Object.entries(catalogFacts(ctx)).forEach(([key, value]) => {
		if (String(ctx.formData?.[key] ?? '') !== String(value)) ctx.setValue(key, value);
	});
	const color = officialColor(ctx)?.color;
	if (color && String(ctx.formData?.color ?? '') !== String(color)) ctx.setValue('color', color);
};

/** Clears everything that belongs to the previous model (variant, official color, condition answers). */
export const clearElectronicModelChoices = (setValue, { clearModel = true, clearAttributes = false } = {}) => {
	if (typeof setValue !== 'function') return;
	if (clearModel) setValue('electronicModelId', '');
	setValue('electronicVariantId', '');
	setValue('colorName', '');
	if (clearAttributes) setValue('attributes', {});
};

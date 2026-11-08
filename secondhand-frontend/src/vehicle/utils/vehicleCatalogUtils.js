/** Vehicle catalog helpers — brand → type → model → generation → engine/trim */

export const normalizeId = (id) => String(id ?? '');

const findVehicleType = (ctx) => {
	const typeId = ctx?.formData?.vehicleTypeId ?? ctx?.selection?.vehicleTypeId;
	if (!typeId) return null;
	const types = ctx?.enums?.vehicleTypes || [];
	return types.find((t) => normalizeId(t?.id || t?.value) === normalizeId(typeId)) || null;
};

/**
 * The selected type's rule for a spec field: REQUIRED, OPTIONAL or HIDDEN (backend `types.json`,
 * served in `vehicleTypes[].fieldRules`). Null while no type is selected.
 */
export const vehicleFieldRule = (ctx, field) => {
	const type = findVehicleType(ctx);
	if (!type) return null;
	return type.fieldRules?.[field] ?? 'HIDDEN';
};

export const isVehicleFieldVisible = (ctx, field) => vehicleFieldRule(ctx, field) !== 'HIDDEN';

export const isVehicleFieldRequired = (ctx, field) => vehicleFieldRule(ctx, field) === 'REQUIRED';

/** visibleWhen + requiredWhen of a spec field, both from the selected type's rules. */
export const ruledByVehicleType = (field) => ({
	visibleWhen: (ctx) => isVehicleFieldVisible(ctx, field),
	requiredWhen: (ctx) => isVehicleFieldRequired(ctx, field),
});

export const filterModels = (models, { typeId, brandId, bodyType } = {}) => {
	return (models || []).filter((m) => {
		const b = m?.brandId ?? m?.brand_id;
		const t = m?.typeId ?? m?.type_id;
		if (typeId && normalizeId(t) !== normalizeId(typeId)) return false;
		if (brandId && normalizeId(b) !== normalizeId(brandId)) return false;
		if (bodyType) {
			const supported = m?.supportedBodyTypes || [];
			const key = String(bodyType).toUpperCase();
			if (supported.length > 0 && !supported.some((x) => String(x).toUpperCase() === key)) {
				return false;
			}
		}
		return true;
	});
};

export const toModelOptions = (models) =>
	models
		.map((m) => ({ id: normalizeId(m?.id), label: String(m?.name ?? '') }))
		.filter((o) => o.id && o.label);

export const brandIdsForType = (models, typeId) => {
	const ids = new Set();
	filterModels(models, { typeId }).forEach((m) => {
		const b = m?.brandId ?? m?.brand_id;
		if (b) ids.add(normalizeId(b));
	});
	return ids;
};

export const generationsForModel = (enums, modelId) =>
	(enums?.vehicleGenerations || []).filter((g) => normalizeId(g?.modelId) === normalizeId(modelId));

export const enginesForGeneration = (enums, generationId) =>
	(enums?.vehicleEngines || []).filter((e) => normalizeId(e?.generationId) === normalizeId(generationId));

export const trimsForGeneration = (enums, generationId) =>
	(enums?.vehicleTrims || []).filter((t) => normalizeId(t?.generationId) === normalizeId(generationId));

const modelHasGenerations = (enums, modelId) => generationsForModel(enums, modelId).length > 0;

export const showGenerationFields = (ctx) => {
	const modelId = ctx?.formData?.vehicleModelId ?? ctx?.selection?.vehicleModelId;
	if (!modelId) return false;
	return modelHasGenerations(ctx?.enums, modelId);
};

export const showEngineFields = (ctx) => {
	const genId = ctx?.formData?.vehicleGenerationId ?? ctx?.selection?.vehicleGenerationId;
	if (!showGenerationFields(ctx) || !genId) return false;
	return enginesForGeneration(ctx?.enums, genId).length > 0;
};

export const showTrimFields = (ctx) => {
	const genId = ctx?.formData?.vehicleGenerationId ?? ctx?.selection?.vehicleGenerationId;
	if (!showGenerationFields(ctx) || !genId) return false;
	return trimsForGeneration(ctx?.enums, genId).length > 0;
};

const supportedBodyTypesForBrand = (enums, brandId, typeId) => {
	const supported = new Set();
	filterModels(enums?.vehicleModels || [], { brandId, typeId }).forEach((m) => {
		(m?.supportedBodyTypes || []).forEach((bt) => supported.add(String(bt).toUpperCase()));
	});
	return supported;
};

/** Body types the selected type allows, narrowed to what the brand's models of that type offer. */
export const bodyTypeOptions = (ctx) => {
	const type = findVehicleType(ctx);
	const typeId = ctx?.formData?.vehicleTypeId ?? ctx?.selection?.vehicleTypeId;
	const brandId = ctx?.formData?.brandId ?? ctx?.selection?.brandId;
	const allowed = new Set((type?.bodyTypes || []).map((b) => String(b).toUpperCase()));
	const forBrand = brandId ? supportedBodyTypesForBrand(ctx?.enums, brandId, typeId) : new Set();
	return (ctx?.enums?.bodyTypes || []).filter((b) => {
		const key = String(b?.value ?? b?.name ?? '').toUpperCase();
		if (type && !allowed.has(key)) return false;
		return forBrand.size === 0 || forBrand.has(key);
	});
};

export const toLookupOptions = (items, { idKey = 'id', labelKey = 'name' } = {}) =>
	(items || [])
		.map((item) => ({
			id: normalizeId(item?.[idKey]),
			label: String(item?.[labelKey] ?? ''),
		}))
		.filter((o) => o.id && o.label);

export const findGeneration = (enums, generationId) =>
	(enums?.vehicleGenerations || []).find((g) => normalizeId(g?.id) === normalizeId(generationId));

export const findEngine = (enums, engineId) =>
	(enums?.vehicleEngines || []).find((e) => normalizeId(e?.id) === normalizeId(engineId));

/**
 * Catalog facts a listing copies from its version (engine entries carry their version's facts, same id)
 * and from the version's generation. The backend overwrites these columns with the catalog values when a
 * version is set (VehicleSpecSnapshotter), so the form shows them filled and read-only.
 */
const VERSION_FACT_FIELDS = ['fuelType', 'horsePower', 'engineCapacity', 'gearbox', 'drivetrain'];
const GENERATION_FACT_FIELDS = ['bodyType', 'doors', 'seatCount'];

const hasFact = (value) => value != null && value !== '' && !(typeof value === 'number' && value <= 0);

const selectedEngine = (ctx) => {
	const engineId = ctx?.formData?.vehicleEngineId;
	return engineId ? findEngine(ctx?.enums, engineId) : undefined;
};

/** Version facts of the picked engine and generation facts of its generation, only the known ones. */
export const catalogFacts = (ctx) => {
	const engine = selectedEngine(ctx);
	if (!engine?.versionId) return {};
	const facts = {};
	VERSION_FACT_FIELDS.forEach((key) => {
		if (hasFact(engine[key])) facts[key] = engine[key];
	});
	const generation = findGeneration(ctx?.enums, ctx?.formData?.vehicleGenerationId);
	GENERATION_FACT_FIELDS.forEach((key) => {
		if (hasFact(generation?.[key])) facts[key] = generation[key];
	});
	return facts;
};

/** True when the field's value comes from the catalog version and cannot be edited. */
export const isCatalogLocked = (ctx, field) => Object.prototype.hasOwnProperty.call(catalogFacts(ctx), field);

export const catalogLockedHint = (ctx, field) =>
	isCatalogLocked(ctx, field) ? 'Filled from the catalog for the selected engine' : undefined;

/**
 * Keeps the version id and the catalog facts in step with the picked engine. Runs as a form effect, so it
 * also covers engines picked in the pre-form selectors, edited listings and restored drafts.
 */
export const syncCatalogVersion = (ctx) => {
	if (typeof ctx?.setValue !== 'function') return;
	const engine = selectedEngine(ctx);
	const versionId = engine?.versionId ? normalizeId(engine.versionId) : '';
	if (normalizeId(ctx.formData?.vehicleVersionId) !== versionId) {
		ctx.setValue('vehicleVersionId', versionId);
	}
	Object.entries(catalogFacts(ctx)).forEach(([key, value]) => {
		if (String(ctx.formData?.[key] ?? '') !== String(value)) ctx.setValue(key, value);
	});
};

/** Model years the picked version was sold in (its own years, else its generation's). */
export const versionYearRange = (ctx) => {
	const engine = selectedEngine(ctx);
	if (!engine?.versionId) return null;
	const generation = findGeneration(ctx?.enums, ctx?.formData?.vehicleGenerationId);
	const from = engine.startYear ?? generation?.startYear ?? null;
	const to = engine.endYear ?? generation?.endYear ?? null;
	return from == null && to == null ? null : { from, to };
};

/** Prefill body type, doors and seats when a generation is picked; the seller can still change them until an engine is picked. */
export const applyGenerationBodyDefaults = (generation, setValue) => {
	if (!generation || typeof setValue !== 'function') return;
	GENERATION_FACT_FIELDS.forEach((key) => {
		if (hasFact(generation[key])) setValue(key, generation[key]);
	});
};

/** Prefill year hints when a catalog generation is picked */
export const applyGenerationCatalogDefaults = (generation, setValue, currentYear) => {
	if (!generation || typeof setValue !== 'function') return;
	if (generation.startYear && !currentYear) {
		setValue('year', generation.startYear);
	}
};

export const clearVehicleHierarchy = (setValue, from = 'type') => {
	if (!setValue) return;
	if (from === 'type') setValue('brandId', '');
	if (from === 'type' || from === 'brand') setValue('vehicleModelId', '');
	setValue('vehicleGenerationId', '');
	setValue('vehicleEngineId', '');
	setValue('vehicleVersionId', '');
	setValue('vehicleTrimId', '');
};

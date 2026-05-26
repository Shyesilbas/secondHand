/** Vehicle catalog helpers — brand → type → model → generation → engine/trim */

export const normalizeId = (id) => String(id ?? '');

export const getVehicleTypeName = (ctx) => {
  const typeId = ctx?.formData?.vehicleTypeId ?? ctx?.selection?.vehicleTypeId;
  if (!typeId) return '';
  const types = ctx?.enums?.vehicleTypes || [];
  const found = types.find((t) => normalizeId(t?.id) === normalizeId(typeId));
  return String(found?.name ?? '').toUpperCase();
};

export const isCarVehicle = (ctx) => getVehicleTypeName(ctx) === 'CAR';

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

export const modelHasGenerations = (enums, modelId) => generationsForModel(enums, modelId).length > 0;

export const showGenerationFields = (ctx) => {
  const modelId = ctx?.formData?.vehicleModelId ?? ctx?.selection?.vehicleModelId;
  if (!modelId || !isCarVehicle(ctx)) return false;
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

export const supportedBodyTypesForBrand = (enums, brandId) => {
  const supported = new Set();
  filterModels(enums?.vehicleModels || [], { brandId }).forEach((m) => {
    (m?.supportedBodyTypes || []).forEach((bt) => supported.add(String(bt).toUpperCase()));
  });
  return supported;
};

export const bodyTypeOptions = (enums, brandId) => {
  const supported = supportedBodyTypesForBrand(enums, brandId);
  if (supported.size === 0) return enums?.bodyTypes || [];
  return (enums?.bodyTypes || []).filter((b) => {
    const key = String(b?.value ?? b?.name ?? '').toUpperCase();
    return supported.has(key);
  });
};

export const toLookupOptions = (items, { idKey = 'id', labelKey = 'name' } = {}) =>
  (items || [])
    .map((item) => ({
      id: normalizeId(item?.[idKey]),
      label: String(item?.[labelKey] ?? ''),
    }))
    .filter((o) => o.id && o.label);

export const findEngine = (enums, engineId) =>
  (enums?.vehicleEngines || []).find((e) => normalizeId(e?.id) === normalizeId(engineId));

/** Prefill fuelType / engine hints when a catalog engine is picked */
export const applyEngineCatalogDefaults = (engine, setValue) => {
  if (!engine || typeof setValue !== 'function') return;
  if (engine.fuelType) setValue('fuelType', engine.fuelType);
};

export const clearVehicleHierarchy = (setValue, from = 'type') => {
  if (!setValue) return;
  if (from === 'type') setValue('brandId', '');
  if (from === 'type' || from === 'brand') setValue('vehicleModelId', '');
  setValue('vehicleGenerationId', '');
  setValue('vehicleEngineId', '');
  setValue('vehicleTrimId', '');
};

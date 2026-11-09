// Clothing types carry their rules (`clothingTypes[]` from /enums/all): `sizeRules` maps an audience to the size
// systems a listing may use (data/clothing/types.json), `fieldRules` says whether fit / pattern / fabric is
// REQUIRED, OPTIONAL or HIDDEN. Size values come from `sizeSystems` (data/common/sizes.json).

export const ONE_SIZE = 'ONE_SIZE';

const same = (a, b) => String(a ?? '') === String(b ?? '');

export const findClothingType = (enums, typeId) =>
	typeId ? (enums?.clothingTypes || []).find((t) => same(t?.id, typeId)) : undefined;

const typeOf = (ctx) => findClothingType(ctx?.enums, ctx?.formData?.clothingTypeId ?? ctx?.selection?.clothingTypeId);

/** Audiences the type is offered for; every audience when no type is picked yet. */
export const audiencesForType = (enums, typeId) => {
	const all = enums?.clothingAudiences || [];
	const type = findClothingType(enums, typeId);
	if (!type?.sizeRules) return all;
	return all.filter((a) => Array.isArray(type.sizeRules[a?.value]));
};

/** Size systems the picked type allows for the picked audience. */
export const allowedSizeSystems = (ctx) => {
	const audience = ctx?.formData?.audience;
	const systems = typeOf(ctx)?.sizeRules?.[audience];
	return Array.isArray(systems) ? systems : [];
};

/** The system the size picker shows: the seller's choice, or the only one allowed. */
export const effectiveSizeSystem = (ctx) => {
	const allowed = allowedSizeSystems(ctx);
	const chosen = ctx?.formData?.sizeSystem;
	if (chosen && allowed.includes(chosen)) return chosen;
	return allowed.length === 1 ? allowed[0] : '';
};

const findSystem = (enums, key) => (enums?.sizeSystems || []).find((s) => s?.value === key);

export const sizeSystemOptions = (ctx) =>
	allowedSizeSystems(ctx).map((key) => ({ value: key, label: findSystem(ctx?.enums, key)?.label || key }));

export const sizeValueOptions = (ctx) => findSystem(ctx?.enums, effectiveSizeSystem(ctx))?.values || [];

/** "W32 / L32"; null for one-size items or unknown pairs. */
export const sizeLabel = (enums, system, key) => {
	if (!system || system === ONE_SIZE) return null;
	return findSystem(enums, system)?.values?.find((v) => v?.value === key)?.label || null;
};

const fieldRule = (ctx, field) => typeOf(ctx)?.fieldRules?.[field];

/** Visibility and required state of fit / pattern / fabricType from the type's rules; unnamed means hidden. */
export const ruledByClothingType = (field) => ({
	visibleWhen: (ctx) => {
		const rule = fieldRule(ctx, field);
		return rule != null && rule !== 'HIDDEN';
	},
	requiredWhen: (ctx) => fieldRule(ctx, field) === 'REQUIRED',
});

const RULED_FIELDS = ['fit', 'pattern', 'fabricType'];

/**
 * Keeps the size and the ruled fields valid for the picked type and audience: a single allowed system is set,
 * one-size items get the one-size value, sizes of another system and hidden fields are cleared.
 */
export const syncClothingRules = (ctx) => {
	if (typeof ctx?.setValue !== 'function' || !typeOf(ctx)) return;
	const data = ctx.formData || {};
	const system = effectiveSizeSystem(ctx);
	if (!same(data.sizeSystem, system)) ctx.setValue('sizeSystem', system);
	if (system === ONE_SIZE) {
		if (data.sizeKey !== ONE_SIZE) ctx.setValue('sizeKey', ONE_SIZE);
	} else if (data.sizeKey && !sizeValueOptions(ctx).some((v) => v?.value === data.sizeKey)) {
		ctx.setValue('sizeKey', '');
	}
	RULED_FIELDS.forEach((field) => {
		const rule = fieldRule(ctx, field);
		if ((rule == null || rule === 'HIDDEN') && data[field]) ctx.setValue(field, '');
	});
};

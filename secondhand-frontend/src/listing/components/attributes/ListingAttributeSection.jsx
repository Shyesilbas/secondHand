import { useQuery } from '@tanstack/react-query';
import Alert from '../../../common/components/ui/Alert.jsx';
import Button from '../../../common/components/ui/Button.jsx';
import Skeleton from '../../../common/components/ui/Skeleton.jsx';
import EnumDropdown from '../../../common/components/ui/EnumDropdown.jsx';
import { FieldError, SectionCard } from '../../../common/components/forms/FormPrimitives.jsx';
import { inputError, inputNormal } from '../../../common/components/forms/inputStyles.js';
import DamageMapField from './DamageMapField.jsx';
import {
	BOOLEAN_OPTIONS,
	attributeLabel,
	isEmptyAttributeValue,
	listingLevelDefinitions,
	valueOptions,
} from './attributeValues.js';

/**
 * Form section for `listing.attributes`. The section config supplies `definitionsQuery(ctx)` (React Query
 * options returning attribute definitions); answers are kept in `formData.attributes`.
 */
const ListingAttributeSection = ({ section, ctx, title, description }) => {
	const query = useQuery(section.definitionsQuery(ctx));
	const definitions = listingLevelDefinitions(query.data);
	const attributes = ctx.formData?.attributes || {};
	const errors = ctx.errors || {};

	const setAttribute = (key, value) => {
		const next = { ...attributes };
		if (isEmptyAttributeValue(value)) delete next[key];
		else next[key] = value;
		ctx.setValue('attributes', next);
	};

	if (!query.isLoading && !query.isError && definitions.length === 0) return null;

	const renderInput = (def) => {
		const value = attributes[def.key];
		const label = attributeLabel(def);
		const error = errors[`attributes.${def.key}`];
		switch (def.dataType) {
			case 'ENUM_MAP':
				return (
					<div key={def.key} className="md:col-span-2 lg:col-span-3">
						<DamageMapField definition={def} value={value} label={label} onChange={(v) => setAttribute(def.key, v)} />
						<FieldError error={error} />
					</div>
				);
			case 'ENUM':
			case 'MULTI_ENUM':
			case 'BOOLEAN': {
				const multiple = def.dataType === 'MULTI_ENUM';
				const isBoolean = def.dataType === 'BOOLEAN';
				return (
					<div key={def.key} className={multiple ? 'md:col-span-2' : undefined}>
						<EnumDropdown
							label={label}
							options={isBoolean ? BOOLEAN_OPTIONS : valueOptions(def)}
							multiple={multiple}
							value={isBoolean ? (value == null ? '' : String(value)) : value ?? (multiple ? [] : '')}
							onChange={(v) => setAttribute(def.key, isBoolean ? (v === '' ? null : v === 'true') : v)}
							usePortal
						/>
						<FieldError error={error} />
					</div>
				);
			}
			default: {
				const numeric = def.dataType === 'INTEGER' || def.dataType === 'DECIMAL';
				const type = numeric ? 'number' : def.dataType === 'DATE' ? 'date' : 'text';
				return (
					<div key={def.key}>
						<label className="mb-1.5 block text-sm font-medium text-text-primary" htmlFor={`attr-${def.key}`}>{label}</label>
						<input
							id={`attr-${def.key}`}
							type={type}
							value={value ?? ''}
							min={def.min ?? undefined}
							max={def.max ?? undefined}
							step={def.dataType === 'DECIMAL' ? 'any' : numeric ? 1 : undefined}
							onChange={(e) => {
								const raw = e.target.value;
								if (!numeric) return setAttribute(def.key, raw);
								const n = raw === '' ? null : Number(raw);
								return setAttribute(def.key, Number.isFinite(n) ? n : null);
							}}
							className={`${error ? inputError : inputNormal} tabular-nums`}
						/>
						<FieldError error={error} />
					</div>
				);
			}
		}
	};

	return (
		<SectionCard title={title} description={description}>
			{query.isLoading && (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
					{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}
				</div>
			)}
			{query.isError && (
				<Alert
					message="Ek bilgiler yüklenemedi."
					action={<Button variant="secondary" size="sm" onClick={() => query.refetch()}>Tekrar dene</Button>}
				/>
			)}
			{!query.isLoading && !query.isError && (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{definitions.map(renderInput)}
				</div>
			)}
		</SectionCard>
	);
};

export default ListingAttributeSection;

import { Home } from 'lucide-react';
import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
import { realEstateService } from '../../realEstate/services/realEstateService.js';
import { RealEstateCreateRequestDTO } from '../../realEstate/realEstates.js';
import { filterConfigs } from '../filters/filterConfigs.js';

// Category comes from the backend (realEstateTypes[].category), the single source of truth for subtype rules.
export const getRealEstateCategory = (ctx) => {
	const typeId = ctx?.formData?.realEstateTypeId || ctx?.selection?.realEstateTypeId;
	if (!typeId) return '';
	const found = (ctx?.enums?.realEstateTypes || []).find((t) => String(t.id) === String(typeId));
	return String(found?.category || '').toUpperCase();
};
const isLand = (ctx) => getRealEstateCategory(ctx) === 'LAND';
const isResidential = (ctx) => getRealEstateCategory(ctx) === 'RESIDENTIAL';
const CATEGORY_TO_SUBTYPE = { RESIDENTIAL: 'KONUT', COMMERCIAL: 'ISYERI', LAND: 'ARSA', OTHER: 'DIGER' };

export const realEstateConfig = {
	label: 'Real Estate',
	icon: Home,
	description: 'Houses, apartments, land and real estate properties',

	detailsComponent: GenericListingDetails,
	detailsSchema: {
		title: 'Real Estate Information',
		fields: [
			{ label: 'Ad Type', key: 'adType', enumKey: 'realEstateAdTypes' },
			{ label: 'Property Type', key: 'realEstateType', enumKey: 'realEstateTypes' },
			{ label: 'Heating Type', key: 'heatingType', enumKey: 'heatingTypes' },
			{ label: 'Owner Type', key: 'ownerType', enumKey: 'ownerTypes' },
			{ label: 'Square Meters', key: 'squareMeters', format: (_listing, v) => (v ? `${v} m²` : null) },
			{ label: 'Room Count', key: 'roomCount' },
			{ label: 'Room Plan', key: 'roomConfigKey', enumKey: 'roomConfigs', visibleWhen: (listing) => Boolean(listing?.roomConfigKey) },
			{ label: 'Zoning Status', key: 'zoningStatus', visibleWhen: (listing) => Boolean(listing?.zoningStatus) },
			{ label: 'Bathroom Count', key: 'bathroomCount' },
			{ label: 'Floor', key: 'floor' },
			{ label: 'Building Age', key: 'buildingAge', format: (_listing, v) => (v ? `${v} years` : null) },
			{ label: 'Furnished', key: 'furnished', format: (_listing, v) => (v ? 'Yes' : 'No') },
		],
	},
	formSchema: {
		initialData: {
			...RealEstateCreateRequestDTO,
			title: '', description: '', price: '', squareMeters: '', roomCount: '',
			bathroomCount: '', floor: '', buildingAge: '', zoningStatus: '', zoningStatusKey: '', roomConfigKey: '', _realEstateTypeName: '',
		},
		steps: [
			{ id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: false },
			{
				id: 2, title: 'Property Details', description: 'Specify the property specifications', kind: 'details',
				sections: [
					{
						id: 'realestate-basic', title: 'Basic Information', description: 'Ad type, property type and ownership status',
						fields: [
							{ name: 'adTypeId', label: 'Ad Type', type: 'enum', enumKey: 'realEstateAdTypes', required: true },
							{ name: 'realEstateTypeId', label: 'Property Type', type: 'enum', enumKey: 'realEstateTypes', required: true },
							{ name: 'heatingTypeId', label: 'Heating Type', type: 'enum', enumKey: 'heatingTypes', required: true, visibleWhen: (ctx) => !isLand(ctx) },
							{ name: 'ownerTypeId', label: 'Owner Type', type: 'enum', enumKey: 'ownerTypes', required: true },
						],
					},
					{
						id: 'realestate-physical', title: 'Physical Characteristics', description: 'Square meters, number of rooms and other details',
						fields: [
							{ name: 'squareMeters', label: 'Square Meters', type: 'number', required: true, min: 0 },
							{ name: 'roomConfigKey', label: 'Room Plan', type: 'enum', enumKey: 'roomConfigs', required: true, visibleWhen: isResidential },
								{ name: 'roomCount', label: 'Room Count', type: 'number', required: true, min: 1, visibleWhen: (ctx) => !isLand(ctx) && !isResidential(ctx) },
							{ name: 'bathroomCount', label: 'Bathroom Count', type: 'number', min: 0, visibleWhen: (ctx) => !isLand(ctx) },
							{ name: 'floor', label: 'Floor', type: 'number', min: 0, visibleWhen: (ctx) => !isLand(ctx) },
							{ name: 'buildingAge', label: 'Building Age', type: 'number', min: 0, visibleWhen: (ctx) => !isLand(ctx) },
							{ name: 'zoningStatusKey', label: 'Zoning Status', type: 'enum', enumKey: 'zoningStatuses', required: true, visibleWhen: isLand },
						],
					},
					{
						id: 'realestate-extras', title: 'Additional Information', description: 'Furnished status',
						visibleWhen: (ctx) => !isLand(ctx),
						fields: [{ name: 'furnished', label: 'Furnished', type: 'toggle' }],
					},
				],
			},
			{ id: 3, title: 'Location', description: 'Set the location of your item', kind: 'mediaLocation' },
		],
		derivedFields: [{ sourceField: 'realEstateTypeId', enumKey: 'realEstateTypes', targetField: '_realEstateTypeName', uppercase: true }],
		effects: [
			(ctx) => {
				const land = isLand(ctx);
				if (land) {
					if (ctx.formData?.heatingTypeId) ctx.setValue('heatingTypeId', '');
					if (ctx.formData?.bathroomCount) ctx.setValue('bathroomCount', '');
					if (ctx.formData?.floor) ctx.setValue('floor', '');
					if (ctx.formData?.buildingAge) ctx.setValue('buildingAge', '');
					if (ctx.formData?.furnished) ctx.setValue('furnished', false);
				} else if (ctx.formData?.zoningStatusKey || ctx.formData?.zoningStatus) {
					ctx.setValue('zoningStatusKey', '');
					ctx.setValue('zoningStatus', '');
				}
				// Land has no rooms and residential rooms come from the room plan (the backend derives roomCount).
				if ((land || isResidential(ctx)) && String(ctx.formData?.roomCount ?? '') !== '0') ctx.setValue('roomCount', 0);
				if (!isResidential(ctx) && ctx.formData?.roomConfigKey) ctx.setValue('roomConfigKey', '');
			},
		],
		getTitle: ({ isEdit }) => (isEdit ? 'Edit Real Estate Listing' : 'Create Real Estate Listing'),
		getSubtitle: ({ isEdit }) => (isEdit ? 'Update your real estate listing details' : 'Create your real estate listing step by step'),
		normalizeInitialData: (data) => {
			if (!data) return null;
			return { ...data, adTypeId: data?.adTypeId || data?.adType?.id || '', realEstateTypeId: data?.realEstateTypeId || data?.realEstateType?.id || '', heatingTypeId: data?.heatingTypeId || data?.heatingType?.id || '', ownerTypeId: data?.ownerTypeId || data?.ownerType?.id || '' };
		},
	},
	service: {
		create: (payload) => realEstateService.createRealEstateListing(payload),
		getById: (id) => realEstateService.getRealEstateById(id),
		update: (id, payload) => realEstateService.updateRealEstateListing(id, payload),
	},
	createFlow: {
		subtypeSelector: {
			options: [
				{ value: 'KONUT', label: 'Konut (Residential)', description: 'Daire, rezidans, müstakil ev, villa...' },
				{ value: 'ISYERI', label: 'İşyeri (Commercial)', description: 'Ofis, dükkan, mağaza, depo, fabrika...' },
				{ value: 'ARSA', label: 'Arsa (Land)', description: 'Konut imarlı arsa, tarla, zeytinlik, bağ...' },
				{ value: 'DIGER', label: 'Diğer (Other)', description: 'Otopark ve diğer tüm gayrimenkuller...' }
			],
			queryParamKey: 'realEstateCategory',
			initialDataKey: 'realEstateCategory',
			title: 'Choose property category',
			description: 'Select a category to narrow down property types.',
			paramKey: 'realEstateCategory'
		},
		preFormSelectors: [
			{
				enumKey: 'realEstateTypes',
				initialDataKey: 'realEstateTypeId',
				title: 'Choose property type',
				description: 'Select a specific property type.',
				kind: 'grid',
				dependsOn: ['realEstateCategory'],
				paramKey: 'realEstateTypeIds',
				getOptions: ({ enums, selection }) => {
					const category = selection?.realEstateCategory;
					const allTypes = enums?.realEstateTypes || [];
					if (!category) return allTypes;
					return allTypes
						.filter((t) => CATEGORY_TO_SUBTYPE[String(t?.category || '').toUpperCase()] === category)
						.map((t) => ({ ...t, label: String(t?.label ?? t?.name ?? ''), name: String(t?.label ?? t?.name ?? '') }));
				}
			},
			{ enumKey: 'realEstateAdTypes', initialDataKey: 'adTypeId', title: 'Choose ad type', description: 'Select an ad type to tailor the form fields.', kind: 'grid', dependsOn: ['realEstateTypeId'], paramKey: 'adTypeId' },
			{
				enumKey: 'heatingTypes', initialDataKey: 'heatingTypeId', title: 'Choose heating type', description: 'Select a heating type to tailor the form fields.', kind: 'grid', dependsOn: ['realEstateTypeId'], prefilter: false,
				visibleWhen: (ctx) => !isLand(ctx),
			},
			{ enumKey: 'ownerTypes', initialDataKey: 'ownerTypeId', title: 'Choose owner type', description: 'Select an owner type to tailor the form fields.', kind: 'grid', dependsOn: ['realEstateTypeId'], paramKey: 'ownerTypeId' },
		],
	},
	filterConfig: filterConfigs.REAL_ESTATE,
	sortOptions: [
		{ value: 'squareMeters', label: 'Square Meters' }, { value: 'roomCount', label: 'Room Count' },
		{ value: 'buildingAge', label: 'Building Age' }, { value: 'floor', label: 'Floor' },
		{ value: 'price', label: 'Price' }, { value: 'createdAt', label: 'Date Added' },
	],
	defaultFilters: { minSquareMeters: 0, minRoomCount: 1 },
};

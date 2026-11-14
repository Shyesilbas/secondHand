import { Home } from 'lucide-react';
import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
import RealEstateMap from '../../realEstate/components/RealEstateMap.jsx';
import { realEstateService } from '../../realEstate/services/realEstateService.js';
import { RealEstateCreateRequestDTO } from '../../realEstate/realEstates.js';
import { realEstateAttributeQuery } from '../../realEstate/services/realEstateAttributeQuery.js';
import {
	attributeKeysHiddenForAdType,
	findRealEstateType,
	isRealEstateFieldVisible,
	ruledByRealEstateType,
} from '../../realEstate/utils/realEstateRules.js';
import { filterConfigs } from '../filters/filterConfigs.js';
import { formatPrice } from '../../common/formatters.js';

// Fields follow the selected property type's rules (`realEstateTypes[].fieldRules`, backend
// RealEstateTypeRulesValidator). Category comes from the backend (`realEstateTypes[].category`).
const rule = (name) => ruledByRealEstateType(name);
const CATEGORY_TO_SUBTYPE = { RESIDENTIAL: 'KONUT', COMMERCIAL: 'ISYERI', LAND: 'ARSA', OTHER: 'DIGER' };

const hasValue = (key) => (listing) => {
	const v = listing?.[key];
	return v != null && v !== '' && v !== false;
};
const m2 = (_listing, v) => (v ? `${v} m²` : null);
const yesNo = (_listing, v) => (v ? 'Evet' : null);
const money = (listing, v) => (v != null && v !== '' ? `${formatPrice(v)} ${listing?.currency || 'TRY'}` : null);
const isLandListing = (listing) => String(listing?.realEstateType?.category || '').toUpperCase() === 'LAND'
	|| Boolean(listing?.zoningStatusKey);

const resetFromType = ({ value, ctx }) => {
	ctx.setValue('realEstateTypeId', value);
	// Attribute definitions are scoped by the type's category; answers of the previous category would be rejected.
	ctx.setValue('attributes', {});
};

export const realEstateConfig = {
	label: 'Real Estate',
	icon: Home,
	description: 'Houses, apartments, land and real estate properties',

	detailsComponent: GenericListingDetails,
	detailsSchema: {
		title: 'Real Estate Information',
		sections: [
			{
				id: 'basic',
				label: 'Genel',
				fields: [
					{ label: 'İlan tipi', key: 'adType', enumKey: 'realEstateAdTypes' },
					{ label: 'Emlak tipi', key: 'realEstateType', enumKey: 'realEstateTypes' },
					{ label: 'Kimden', key: 'ownerType', enumKey: 'ownerTypes' },
					{ label: 'Brüt m²', key: 'grossAreaM2', format: m2, visibleWhen: hasValue('grossAreaM2') },
					{ label: 'Net m²', key: 'netAreaM2', format: m2, visibleWhen: hasValue('netAreaM2') },
					{ label: 'Oda sayısı', key: 'roomConfigKey', enumKey: 'roomConfigs', visibleWhen: hasValue('roomConfigKey') },
					{ label: 'Banyo sayısı', key: 'bathroomCount', visibleWhen: hasValue('bathroomCount') },
					{ label: 'Isıtma', key: 'heatingType', enumKey: 'heatingTypes', visibleWhen: hasValue('heatingType') },
					{ label: 'Eşyalı', key: 'furnished', format: yesNo, visibleWhen: hasValue('furnished') },
					{ label: 'Aidat', key: 'monthlyFee', format: money, visibleWhen: hasValue('monthlyFee') },
					{ label: 'Takasa uygun', key: 'exchangeable', format: yesNo, visibleWhen: hasValue('exchangeable') },
				],
			},
			{
				id: 'building',
				label: 'Bina',
				visibleWhen: (listing) => !isLandListing(listing),
				fields: [
					{ label: 'Bulunduğu kat', key: 'floorKey', enumKey: 'floors', visibleWhen: hasValue('floorKey') },
					{ label: 'Kat sayısı', key: 'totalFloors', visibleWhen: hasValue('totalFloors') },
					{ label: 'Bina yaşı', key: 'buildingAge', format: (_l, v) => (v === 0 ? 'Sıfır bina' : v ? `${v} yıl` : null), visibleWhen: (l) => l?.buildingAge != null },
					{ label: 'Bina durumu', key: 'buildingCondition', enumKey: 'buildingConditions', visibleWhen: hasValue('buildingCondition') },
					{ label: 'Asansör', key: 'hasElevator', format: yesNo, visibleWhen: hasValue('hasElevator') },
					{ label: 'Balkon', key: 'hasBalcony', format: yesNo, visibleWhen: hasValue('hasBalcony') },
					{ label: 'Otopark', key: 'hasParking', format: yesNo, visibleWhen: hasValue('hasParking') },
					{ label: 'Site içinde', key: 'inSite', format: yesNo, visibleWhen: hasValue('inSite') },
					{ label: 'Site adı', key: 'siteName', visibleWhen: hasValue('siteName') },
					{ label: 'Havuz', key: 'hasPool', format: yesNo, visibleWhen: hasValue('hasPool') },
					{ label: 'Bahçe', key: 'gardenAreaM2', format: m2, visibleWhen: hasValue('gardenAreaM2') },
					{ label: 'Arsa payı', key: 'landShareM2', format: m2, visibleWhen: hasValue('landShareM2') },
				],
			},
			{
				id: 'land',
				label: 'İmar',
				visibleWhen: isLandListing,
				fields: [
					{ label: 'İmar durumu', key: 'zoningStatusKey', enumKey: 'zoningStatuses', visibleWhen: hasValue('zoningStatusKey') },
					{ label: 'Ada', key: 'blockNo', visibleWhen: hasValue('blockNo') },
					{ label: 'Parsel', key: 'parcelNo', visibleWhen: hasValue('parcelNo') },
					{ label: 'Pafta', key: 'sheetNo', visibleWhen: hasValue('sheetNo') },
					{ label: 'Emsal (KAKS)', key: 'floorAreaRatio', visibleWhen: hasValue('floorAreaRatio') },
					{ label: 'Gabari', key: 'heightLimit', format: (_l, v) => (v ? `${v} m` : null), visibleWhen: hasValue('heightLimit') },
					{ label: 'Yol cephesi', key: 'roadFrontage', format: (_l, v) => (v ? `${v} m` : null), visibleWhen: hasValue('roadFrontage') },
					{ label: 'Altyapı', key: 'infrastructureStatusKey', enumKey: 'infrastructureStatuses', visibleWhen: hasValue('infrastructureStatusKey') },
					{ label: 'Elektrik', key: 'electricityAvailable', format: yesNo, visibleWhen: hasValue('electricityAvailable') },
					{ label: 'Yol', key: 'roadAccess', format: yesNo, visibleWhen: hasValue('roadAccess') },
				],
			},
			{
				id: 'condition',
				label: 'Tapu ve kullanım',
				kind: 'attributes',
				definitionsQuery: (listing) => realEstateAttributeQuery(listing?.realEstateType?.id),
			},
			{
				id: 'map',
				label: 'Konum',
				kind: 'component',
				component: RealEstateMap,
				visibleWhen: (listing) => listing?.latitude != null && listing?.longitude != null,
			},
		],
	},
	formSchema: {
		initialData: { ...RealEstateCreateRequestDTO, title: '', description: '', price: '' },
		steps: [
			{ id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: false },
			{
				id: 2, title: 'Property Details', description: 'Specify the property specifications', kind: 'details',
				sections: [
					{
						id: 'realestate-basic', title: 'Genel bilgiler', description: 'İlan tipi, emlak tipi ve ilan sahibi',
						fields: [
							{ name: 'adTypeId', label: 'İlan tipi', type: 'enum', enumKey: 'realEstateAdTypes', required: true },
							{ name: 'realEstateTypeId', label: 'Emlak tipi', type: 'enum', enumKey: 'realEstateTypes', required: true, onChange: resetFromType },
							{ name: 'ownerTypeId', label: 'Kimden', type: 'enum', enumKey: 'ownerTypes', required: true },
							{ name: 'heatingTypeId', label: 'Isıtma', type: 'enum', enumKey: 'heatingTypes', ...rule('heatingType') },
						],
					},
					{
						id: 'realestate-area', title: 'Alan ve oda', description: 'Alanlar emlak tipine göre değişir',
						visibleWhen: (ctx) => Boolean(findRealEstateType(ctx)),
						fields: [
							{ name: 'grossAreaM2', label: 'Brüt m²', type: 'number', min: 1, ...rule('grossAreaM2') },
							{ name: 'netAreaM2', label: 'Net m²', type: 'number', min: 1, ...rule('netAreaM2') },
							{ name: 'roomConfigKey', label: 'Oda sayısı', type: 'enum', enumKey: 'roomConfigs', ...rule('roomConfigKey') },
							{ name: 'bathroomCount', label: 'Banyo sayısı', type: 'number', min: 0, ...rule('bathroomCount') },
							{ name: 'gardenAreaM2', label: 'Bahçe (m²)', type: 'number', min: 1, ...rule('gardenAreaM2') },
							{ name: 'landShareM2', label: 'Arsa payı (m²)', type: 'number', min: 1, ...rule('landShareM2') },
						],
					},
					{
						id: 'realestate-building', title: 'Bina ve kat',
						visibleWhen: (ctx) => Boolean(findRealEstateType(ctx)),
						fields: [
							{ name: 'floorKey', label: 'Bulunduğu kat', type: 'enum', enumKey: 'floors', ...rule('floorKey') },
							{ name: 'totalFloors', label: 'Kat sayısı', type: 'number', min: 1, ...rule('totalFloors') },
							{ name: 'buildingAge', label: 'Bina yaşı', type: 'number', min: 0, max: 200, ...rule('buildingAge') },
							{ name: 'buildingCondition', label: 'Bina durumu', type: 'enum', enumKey: 'buildingConditions', ...rule('buildingCondition') },
							{ name: 'monthlyFee', label: 'Aidat (TL)', type: 'number', min: 0, ...rule('monthlyFee') },
							{
								name: 'siteName', label: 'Site adı', type: 'text',
								visibleWhen: (ctx) => isRealEstateFieldVisible(ctx, 'siteName') && Boolean(ctx.formData?.inSite),
							},
							{ name: 'hasElevator', label: 'Asansör', type: 'toggle', ...rule('hasElevator') },
							{ name: 'hasBalcony', label: 'Balkon', type: 'toggle', ...rule('hasBalcony') },
							{ name: 'hasParking', label: 'Otopark', type: 'toggle', ...rule('hasParking') },
							{ name: 'furnished', label: 'Eşyalı', type: 'toggle', ...rule('furnished') },
							{ name: 'inSite', label: 'Site içinde', type: 'toggle', ...rule('inSite') },
							{ name: 'hasPool', label: 'Havuz', type: 'toggle', ...rule('hasPool') },
						],
					},
					{
						id: 'realestate-land', title: 'İmar ve parsel',
						visibleWhen: (ctx) => Boolean(findRealEstateType(ctx)),
						fields: [
							{ name: 'zoningStatusKey', label: 'İmar durumu', type: 'enum', enumKey: 'zoningStatuses', ...rule('zoningStatusKey') },
							{ name: 'blockNo', label: 'Ada', type: 'text', ...rule('blockNo') },
							{ name: 'parcelNo', label: 'Parsel', type: 'text', ...rule('parcelNo') },
							{ name: 'sheetNo', label: 'Pafta', type: 'text', ...rule('sheetNo') },
							{ name: 'floorAreaRatio', label: 'Emsal (KAKS)', type: 'number', min: 0, ...rule('floorAreaRatio') },
							{ name: 'heightLimit', label: 'Gabari (m)', type: 'number', min: 0, ...rule('heightLimit') },
							{ name: 'roadFrontage', label: 'Yol cephesi (m)', type: 'number', min: 0, ...rule('roadFrontage') },
							{ name: 'infrastructureStatusKey', label: 'Altyapı', type: 'enum', enumKey: 'infrastructureStatuses', ...rule('infrastructureStatusKey') },
							{ name: 'electricityAvailable', label: 'Elektrik var', type: 'toggle', ...rule('electricityAvailable') },
							{ name: 'roadAccess', label: 'Yola cephe', type: 'toggle', ...rule('roadAccess') },
						],
					},
					{
						id: 'realestate-attributes',
						kind: 'attributes',
						title: 'Tapu, kullanım ve kira koşulları',
						description: 'Boş bıraktıkların ilanda görünmez',
						visibleWhen: (ctx) => Boolean(ctx.formData?.realEstateTypeId),
						definitionsQuery: (ctx) => realEstateAttributeQuery(ctx.formData?.realEstateTypeId),
						excludeKeys: attributeKeysHiddenForAdType,
					},
					{
						id: 'realestate-extras', title: 'Diğer',
						fields: [{ name: 'exchangeable', label: 'Takasa uygun', type: 'toggle' }],
					},
				],
			},
			{ id: 3, title: 'Location', description: 'Haritada mahallenin yaklaşık konumu gösterilir; adresin paylaşılmaz', kind: 'mediaLocation' },
		],
		derivedFields: [{ sourceField: 'realEstateTypeId', enumKey: 'realEstateTypes', targetField: '_realEstateTypeName', uppercase: true }],
		getTitle: ({ isEdit }) => (isEdit ? 'Edit Real Estate Listing' : 'Create Real Estate Listing'),
		getSubtitle: ({ isEdit }) => (isEdit ? 'Update your real estate listing details' : 'Create your real estate listing step by step'),
		normalizeInitialData: (data) => {
			if (!data) return null;
			const out = {
				...data,
				adTypeId: data?.adTypeId || data?.adType?.id || '',
				realEstateTypeId: data?.realEstateTypeId || data?.realEstateType?.id || '',
				heatingTypeId: data?.heatingTypeId || data?.heatingType?.id || '',
				ownerTypeId: data?.ownerTypeId || data?.ownerType?.id || '',
				attributes: data?.attributes && typeof data.attributes === 'object' ? data.attributes : {},
			};
			Object.keys(out).forEach((k) => { if (out[k] === null) out[k] = ''; });
			return out;
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
				visibleWhen: (ctx) => isRealEstateFieldVisible(ctx, 'heatingType'),
			},
			{ enumKey: 'ownerTypes', initialDataKey: 'ownerTypeId', title: 'Choose owner type', description: 'Select an owner type to tailor the form fields.', kind: 'grid', dependsOn: ['realEstateTypeId'], paramKey: 'ownerTypeId' },
		],
	},
	filterConfig: filterConfigs.REAL_ESTATE,
	sortOptions: [
		{ value: 'grossArea', label: 'Brüt m²' }, { value: 'roomCount', label: 'Oda sayısı' },
		{ value: 'buildingAge', label: 'Bina yaşı' }, { value: 'floor', label: 'Kat' },
		{ value: 'price', label: 'Price' }, { value: 'createdAt', label: 'Date Added' },
	],
	defaultFilters: {},
};

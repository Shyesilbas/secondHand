import { Shirt } from 'lucide-react';
import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
import {clothingService} from '../../clothing/services/clothingService.js';
import {clothingAttributeQuery} from '../../clothing/services/clothingAttributeQuery.js';
import {
 audiencesForType,
 effectiveSizeSystem,
 ONE_SIZE,
 ruledByClothingType,
 sizeSystemOptions,
 sizeValueOptions,
 syncClothingRules,
} from '../../clothing/utils/clothingCatalogUtils.js';
import {filterConfigs} from '../filters/filterConfigs.js';

const hasValue = (key) => (listing) => {
 const v = listing?.[key];
 return v != null && v !== '';
};

// Condition attributes follow the type group, so answers given for the previous type are dropped.
const resetFromType = ({ value, ctx }) => {
 ctx.setValue('clothingTypeId', value);
 ctx.setValue('sizeSystem', '');
 ctx.setValue('sizeKey', '');
 ctx.setValue('attributes', {});
};

const resetFromAudience = ({ value, ctx }) => {
 ctx.setValue('audience', value);
 ctx.setValue('sizeSystem', '');
 ctx.setValue('sizeKey', '');
};

/** Types offered for the picked audience (all types before an audience is picked). */
const typeOptions = (ctx) => {
 const audience = ctx?.formData?.audience;
 const all = ctx?.enums?.clothingTypes || [];
 return audience ? all.filter((t) => Array.isArray(t?.sizeRules?.[audience])) : all;
};

export const clothingConfig = {
 label: 'Clothing',
 icon: Shirt,
 description: 'Clothing, shoes and fashion accessories',

 detailsComponent: GenericListingDetails,
 detailsSchema: {
 title: 'Clothing Information',
 sections: [
 {
 id: 'basic',
 fields: [
 { label: 'Brand', key: 'brand', enumKey: 'clothingBrands' },
 { label: 'Type', key: 'clothingType', enumKey: 'clothingTypes' },
 { label: 'For', key: 'audience', enumKey: 'clothingAudiences' },
 { label: 'Size', key: 'sizeLabel', visibleWhen: (l) => hasValue('sizeLabel')(l) && l?.sizeSystem !== ONE_SIZE },
 { label: 'Color', key: 'color', enumKey: 'colors' },
 { label: 'Condition', key: 'condition', enumKey: 'clothingConditions' },
 { label: 'Fit', key: 'fit', enumKey: 'clothingFits', visibleWhen: hasValue('fit') },
 { label: 'Pattern', key: 'pattern', enumKey: 'clothingPatterns', visibleWhen: hasValue('pattern') },
 { label: 'Fabric', key: 'fabricType', enumKey: 'fabricTypes', visibleWhen: hasValue('fabricType') },
 { label: 'Purchase Year', key: 'purchaseYear', visibleWhen: hasValue('purchaseYear') },
 ],
 },
 {
 id: 'condition',
 label: 'Durum',
 title: 'Durum',
 kind: 'attributes',
 definitionsQuery: (listing) => clothingAttributeQuery(listing?.clothingType?.id),
 },
 ],
 },
 formSchema: {
 initialData: {
 title: '', description: '', price: '', currency: 'TRY', quantity: 1,
 brandId: '', clothingTypeId: '', _clothingTypeName: '', color: '', condition: '',
 audience: '', sizeSystem: '', sizeKey: '', fit: '', pattern: '', fabricType: '',
 purchaseYear: '', attributes: {}, city: '', district: '', imageUrl: '',
 },
 steps: [
 { id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: true },
 {
 id: 2, title: 'Clothing Specifications', description: 'Specify the details of your clothing item', kind: 'details',
 sections: [
 {
 id: 'clothing-details', title: 'Product Details', description: 'Who it is for, type, size and fit',
 fields: [
 { name: 'audience', label: 'For', type: 'enum', enumKey: 'clothingAudiences', required: true, onChange: resetFromAudience },
 { name: 'clothingTypeId', label: 'Type', type: 'enum', enumKey: 'clothingTypes', required: true, getOptions: typeOptions, onChange: resetFromType },
 { name: 'brandId', label: 'Brand', type: 'enum', enumKey: 'clothingBrands', required: true },
 {
 name: 'sizeSystem', label: 'Size System', type: 'enum', enumKey: 'sizeSystems', required: true,
 // Only types with a choice (e.g. jeans: W/L or numeric) ask for the system.
 visibleWhen: (ctx) => sizeSystemOptions(ctx).length > 1,
 getOptions: sizeSystemOptions,
 onChange: ({ value, ctx }) => {
 ctx.setValue('sizeSystem', value);
 ctx.setValue('sizeKey', '');
 },
 },
 {
 name: 'sizeKey', label: 'Size', type: 'searchable', required: true,
 visibleWhen: (ctx) => {
 const system = effectiveSizeSystem(ctx);
 return Boolean(system) && system !== ONE_SIZE;
 },
 getOptions: sizeValueOptions,
 },
 { name: 'color', label: 'Color', type: 'enum', enumKey: 'colors', required: true },
 { name: 'condition', label: 'Condition', type: 'enum', enumKey: 'clothingConditions', required: true },
 { name: 'fit', label: 'Fit', type: 'enum', enumKey: 'clothingFits', ...ruledByClothingType('fit') },
 { name: 'pattern', label: 'Pattern', type: 'enum', enumKey: 'clothingPatterns', ...ruledByClothingType('pattern') },
 { name: 'fabricType', label: 'Fabric', type: 'enum', enumKey: 'fabricTypes', ...ruledByClothingType('fabricType') },
 { name: 'purchaseYear', label: 'Purchase Year', type: 'number', min: 1950, max: new Date().getFullYear(), placeholder: 'YYYY' },
 ],
 },
 {
 id: 'clothing-condition',
 kind: 'attributes',
 title: 'Durum ve ölçüler',
 description: 'Kusurlar, sezon, ölçüler ve orijinallik; kusurlu ürünlerde en az bir kusur seç',
 visibleWhen: (ctx) => Boolean(ctx.formData?.clothingTypeId),
 definitionsQuery: (ctx) => clothingAttributeQuery(ctx.formData?.clothingTypeId),
 },
 ],
 },
 { id: 3, title: 'Location', description: 'Set the location of your item', kind: 'mediaLocation' },
 ],
 derivedFields: [{ sourceField: 'clothingTypeId', enumKey: 'clothingTypes', targetField: '_clothingTypeName', uppercase: true }],
 effects: [syncClothingRules],
 getTitle: ({ isEdit }) => (isEdit ? 'Edit Clothing Listing' : 'Create Clothing Listing'),
 getSubtitle: ({ isEdit }) => (isEdit ? 'Update your clothing listing details' : 'Create your clothing listing step by step'),
 normalizeInitialData: (data) => {
 if (!data) return null;
 return {
 ...data,
 brandId: data?.brandId || data?.brand?.id || '',
 clothingTypeId: data?.clothingTypeId || data?.clothingType?.id || '',
 sizeSystem: data?.sizeSystem || '',
 sizeKey: data?.sizeKey || '',
 purchaseYear: data?.purchaseYear ?? '',
 attributes: data?.attributes && typeof data.attributes === 'object' ? data.attributes : {},
 };
 },
 },
 service: {
 create: (payload) => clothingService.createClothingListing(payload),
 getById: (id) => clothingService.getClothingDetails(id),
 update: (id, payload) => clothingService.updateClothingListing(id, payload),
 },
 createFlow: {
 subtypeSelector: {
 enumKey: 'clothingTypes',
 queryParamKey: 'clothingTypeId',
 initialDataKey: 'clothingTypeId',
 title: 'Choose clothing type',
 description: 'Select a type to tailor the form fields.',
 paramKey: 'types',
 },
 preFormSelectors: [
 {
 enumKey: 'clothingAudiences', initialDataKey: 'audience', title: 'Who is it for?', description: 'Women, men, kids or baby; unisex items also show in women\'s and men\'s searches.',
 kind: 'grid', dependsOn: ['clothingTypeId'], paramKey: 'audiences',
 getOptions: ({ enums, selection }) => audiencesForType(enums, selection?.clothingTypeId),
 },
 {
 enumKey: 'clothingBrands', initialDataKey: 'brandId', title: 'Choose brand', description: 'Select a brand to tailor the form fields.', kind: 'grid', dependsOn: ['clothingTypeId'], paramKey: 'brands',
 },
 { enumKey: 'colors', initialDataKey: 'color', title: 'Choose color', description: 'Select a color for your clothing item.', kind: 'grid', dependsOn: ['clothingTypeId'], prefilter: false },
 { enumKey: 'clothingConditions', initialDataKey: 'condition', title: 'Choose condition', description: 'Select a condition to tailor the form fields.', kind: 'grid', dependsOn: ['clothingTypeId'], prefilter: false },
 ],
 },
 filterConfig: filterConfigs.CLOTHING,
 sortOptions: [
 { value: 'brand', label: 'Brand' }, { value: 'type', label: 'Type' },
 { value: 'condition', label: 'Condition' }, { value: 'audience', label: 'For' },
 { value: 'purchaseYear', label: 'Purchase Year' },
 { value: 'price', label: 'Price' }, { value: 'createdAt', label: 'Date Added' },
 ],
 defaultFilters: {},
};

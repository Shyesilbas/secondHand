import { Shirt } from 'lucide-react';
import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
import {clothingService} from '../../clothing/services/clothingService.js';
import {filterConfigs} from '../filters/filterConfigs.js';

const FOOTWEAR_TYPES = new Set(['SHOES', 'SNEAKERS', 'BOOTS', 'SANDALS', 'SLIPPERS', 'HEELS', 'FLATS', 'LOAFERS']);
const ACCESSORY_TYPES = new Set([
 'BAG', 'BACKPACK', 'HANDBAG', 'CROSSBODY_BAG', 'CLUTCH', 'SUITCASE',
 'WALLET', 'WATCH', 'SUNGLASSES', 'JEWELRY', 'NECKLACE', 'BRACELET',
 'EARRINGS', 'RING', 'BELT', 'HAT', 'CAP', 'BEANIE', 'SCARF',
 'GLOVES', 'TIE', 'BOW_TIE', 'OTHER'
]);

export const getClothingGroup = (ctx) => {
 const typeId = ctx?.formData?.clothingTypeId || ctx?.selection?.clothingTypeId;
 const rawName = ctx?.formData?._clothingTypeName || (typeId && ctx?.getName ? ctx.getName('clothingTypes', typeId) : '');
 const t = String(rawName || '').toUpperCase();
 const enumsList = ctx?.enums?.clothingTypes || [];
 const found = enumsList.find((x) => (typeId && String(x.id) === String(typeId)) || String(x.name || '').toUpperCase() === t);
 if (found?.group) return String(found.group).toUpperCase();
 if (FOOTWEAR_TYPES.has(t)) return 'FOOTWEAR';
 if (ACCESSORY_TYPES.has(t)) return 'ACCESSORY';
 return t ? 'APPAREL' : '';
};

export const clothingConfig = {
 label: 'Clothing',
 icon: Shirt,
 description: 'Clothing, shoes and fashion accessories',

 detailsComponent: GenericListingDetails,
 detailsSchema: {
 title: 'Clothing Information',
 fields: [
 { label: 'Brand', key: 'brand', enumKey: 'clothingBrands' },
 { label: 'Type', key: 'clothingType', enumKey: 'clothingTypes' },
 { label: 'Color', key: 'color', enumKey: 'colors' },
 { label: 'Condition', key: 'condition', enumKey: 'clothingConditions' },
 { label: 'Gender (male, female, unisex)', key: 'clothingGender', enumKey: 'clothingGenders' },
 { label: 'Clothing Category', key: 'clothingCategory', enumKey: 'clothingCategories' },
 { label: 'Purchase Year', key: 'purchaseDate', format: (_listing, v) => (v ? String(new Date(v).getFullYear()) : null) },
 ],
 },
 formSchema: {
 initialData: {
 title: '', description: '', price: '', currency: 'TRY', quantity: 1,
 brandId: '', clothingTypeId: '', _clothingTypeName: '', color: '', condition: '',
 size: '', shoeSizeEu: '', material: '', clothingGender: '', clothingCategory: '',
 purchaseYear: '', city: '', district: '', imageUrl: '',
 },
 steps: [
 { id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: true },
 {
 id: 2, title: 'Clothing Specifications', description: 'Specify the details of your clothing item', kind: 'details',
 sections: [
 {
 id: 'clothing-details', title: 'Product Details', description: 'Material, fit and purchase details',
 fields: [
 { name: 'brandId', label: 'Brand', type: 'enum', enumKey: 'clothingBrands', required: true },
 { name: 'clothingTypeId', label: 'Type', type: 'enum', enumKey: 'clothingTypes', required: true },
 { name: 'color', label: 'Color', type: 'enum', enumKey: 'colors', required: true },
 { name: 'condition', label: 'Condition', type: 'enum', enumKey: 'clothingConditions', required: true },
 {
 name: 'clothingGender',
 label: 'Gender (male, female, unisex)',
 type: 'enum',
 enumKey: 'clothingGenders',
 required: true,
 description: 'Pick who this item is intended for. Unisex is for items that fit any gender.',
 },
 { name: 'clothingCategory', label: 'Clothing Category', type: 'enum', enumKey: 'clothingCategories', required: true },
 {
 name: 'size', label: 'Size', type: 'enum', enumKey: 'clothingSizes', required: true,
 visibleWhen: (ctx) => getClothingGroup(ctx) === 'APPAREL',
 },
 {
 name: 'shoeSizeEu', label: 'Shoe Size (EU)', type: 'number', required: true, min: 20, max: 55,
 visibleWhen: (ctx) => getClothingGroup(ctx) === 'FOOTWEAR',
 },
 { name: 'material', label: 'Material', type: 'text' },
 { name: 'purchaseYear', label: 'Purchase Year', type: 'number', required: true, min: 1900, max: new Date().getFullYear() },
 ],
 },
 ],
 },
 { id: 3, title: 'Location', description: 'Set the location of your item', kind: 'mediaLocation' },
 ],
 derivedFields: [{ sourceField: 'clothingTypeId', enumKey: 'clothingTypes', targetField: '_clothingTypeName', uppercase: true }],
 effects: [
 (ctx) => {
 const group = getClothingGroup(ctx);
 if (group === 'FOOTWEAR' && ctx.formData?.size) ctx.setValue('size', '');
 if (group === 'APPAREL' && ctx.formData?.shoeSizeEu) ctx.setValue('shoeSizeEu', '');
 if (group === 'ACCESSORY') {
 if (ctx.formData?.size) ctx.setValue('size', '');
 if (ctx.formData?.shoeSizeEu) ctx.setValue('shoeSizeEu', '');
 }
 },
 ],
 getTitle: ({ isEdit }) => (isEdit ? 'Edit Clothing Listing' : 'Create Clothing Listing'),
 getSubtitle: ({ isEdit }) => (isEdit ? 'Update your clothing listing details' : 'Create your clothing listing step by step'),
 normalizeInitialData: (data) => {
 if (!data) return null;
 return { ...data, brandId: data?.brandId || data?.brand?.id || '', clothingTypeId: data?.clothingTypeId || data?.clothingType?.id || '' };
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
 getOptions: ({ enums }) => {
 const all = enums?.clothingTypes || [];
 return all.map((t) => {
 const fullLabel = String(t?.label ?? t?.name ?? '');
 const label = fullLabel.includes(' > ') ? fullLabel.split(' > ')[1].trim() : fullLabel;
 return { ...t, label, name: label };
 });
 }
 },
 preFormSelectors: [
 {
 enumKey: 'clothingBrands', initialDataKey: 'brandId', title: 'Choose brand', description: 'Select a brand to tailor the form fields.', kind: 'grid', dependsOn: ['clothingTypeId'], paramKey: 'brands',
 },
 { enumKey: 'colors', initialDataKey: 'color', title: 'Choose color', description: 'Select a color for your clothing item.', kind: 'grid', dependsOn: ['clothingTypeId'], prefilter: false },
 { enumKey: 'clothingConditions', initialDataKey: 'condition', title: 'Choose condition', description: 'Select a condition to tailor the form fields.', kind: 'grid', dependsOn: ['clothingTypeId'], prefilter: false },
 {
 enumKey: 'clothingGenders',
 initialDataKey: 'clothingGender',
 title: 'Gender: male, female, or unisex',
 description: 'Choose whether this item is for men, women, or unisex. Unisex appears in listings filtered for male or female.',
 kind: 'grid',
 dependsOn: ['clothingTypeId'],
 prefilter: false,
 },
 { enumKey: 'clothingCategories', initialDataKey: 'clothingCategory', title: 'Choose clothing category', description: 'Select a clothing category to tailor the form fields.', kind: 'grid', dependsOn: ['clothingTypeId'], prefilter: false },
 {
 enumKey: 'clothingSizes', initialDataKey: 'size', title: 'Choose size', description: 'Select size of the item.', kind: 'grid', dependsOn: ['clothingTypeId'], prefilter: false,
 visibleWhen: (ctx) => getClothingGroup(ctx) === 'APPAREL'
 },
 ],
 },
 filterConfig: filterConfigs.CLOTHING,
 sortOptions: [
 { value: 'brand', label: 'Brand' }, { value: 'type', label: 'Type' },
 { value: 'condition', label: 'Condition' }, { value: 'clothingGender', label: 'Gender' },
 { value: 'clothingCategory', label: 'Clothing Category' }, { value: 'purchaseDate', label: 'Purchase Date' },
 { value: 'price', label: 'Price' }, { value: 'createdAt', label: 'Date Added' },
 ],
 defaultFilters: {},
};


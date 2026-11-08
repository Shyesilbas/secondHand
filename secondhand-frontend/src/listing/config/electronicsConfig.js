import { Smartphone } from 'lucide-react';
import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
import {electronicService} from '../../electronics/services/electronicService.js';
import {ElectronicCreateRequestDTO} from '../../electronics/electronics.js';
import {electronicAttributeQuery} from '../../electronics/services/electronicAttributeQuery.js';
import {
 clearElectronicModelChoices,
 colorsOf,
 filterElectronicModels,
 findElectronicModel,
 normalizeId,
 ruledByElectronicType,
 syncElectronicCatalog,
 toModelOptions,
 variantsOf,
} from '../../electronics/utils/electronicCatalogUtils.js';
import {filterConfigs} from '../filters/filterConfigs.js';

// Spec fields follow the selected type's rules (`electronicTypes[].fieldRules`) and lock when the catalog
// model or variant provides the value (syncElectronicCatalog effect, ElectronicSpecSnapshotter on the backend).
// Toggles cannot be shown read-only, so a catalog-provided toggle is hidden; the listing still gets the value.
const spec = (name) => ruledByElectronicType(name);
const specToggle = (name) => ruledByElectronicType(name, { hideWhenLocked: true });

const resetFromType = ({ value, ctx }) => {
 ctx.setValue('electronicTypeId', value);
 // Condition attributes are defined per electronic type; answers of the previous type would be rejected.
 clearElectronicModelChoices(ctx.setValue, { clearAttributes: true });
};

const resetFromBrand = ({ value, ctx }) => {
 ctx.setValue('electronicBrandId', value);
 clearElectronicModelChoices(ctx.setValue);
};

const onModelPicked = ({ value, ctx }) => {
 ctx.setValue('electronicModelId', value);
 clearElectronicModelChoices(ctx.setValue, { clearModel: false });
 const model = findElectronicModel(ctx.enums, value);
 if (model?.releaseYear) ctx.setValue('year', model.releaseYear);
};

const hasValue = (key) => (listing) => {
 const v = listing?.[key];
 return v != null && v !== '';
};

const gb = (_listing, v) => (v ? `${v} GB` : null);

export const electronicsConfig = {
 label: 'Electronics',
 icon: Smartphone,
 description: 'Mobile phones, laptops, TVs and electronic devices',

 detailsComponent: GenericListingDetails,
 detailsSchema: {
 title: 'Electronics Information',
 sections: [
 {
 id: 'basic',
 label: 'Genel',
 title: 'Genel',
 fields: [
 { label: 'Type', key: 'electronicType', enumKey: 'electronicTypes' },
 { label: 'Brand', key: 'electronicBrand', enumKey: 'electronicBrands' },
 { label: 'Model', key: 'model' },
 { label: 'Variant', key: 'variantName', visibleWhen: hasValue('variantName') },
 { label: 'Color', key: 'colorName', visibleWhen: hasValue('colorName') },
 { label: 'Color', key: 'color', enumKey: 'colors', visibleWhen: (l) => !hasValue('colorName')(l) },
 { label: 'Year', key: 'year', visibleWhen: hasValue('year') },
 { label: 'Condition', key: 'condition', enumKey: 'electronicConditions' },
 { label: 'Origin', key: 'origin', visibleWhen: hasValue('origin') },
 { label: 'Warranty Proof', key: 'warrantyProof', format: (_listing, v) => formatBoolean(v) },
 ],
 },
 {
 id: 'specs',
 label: 'Teknik',
 title: 'Teknik',
 fields: [
 { label: 'RAM', key: 'ram', format: gb, visibleWhen: hasValue('ram') },
 { label: 'Storage', key: 'storage', format: gb, visibleWhen: hasValue('storage') },
 { label: 'Storage Type', key: 'storageType', enumKey: 'storageTypes', visibleWhen: hasValue('storageType') },
 { label: 'Chipset', key: 'chipset', visibleWhen: hasValue('chipset') },
 { label: 'Processor', key: 'processor', enumKey: 'processors', visibleWhen: hasValue('processor') },
 { label: 'GPU Model', key: 'gpuModel', visibleWhen: hasValue('gpuModel') },
 { label: 'Operating System', key: 'operatingSystem', visibleWhen: hasValue('operatingSystem') },
 { label: 'Screen Size', key: 'screenSize', format: (_listing, v) => (v ? `${v}"` : null), visibleWhen: hasValue('screenSize') },
 { label: 'Battery Capacity', key: 'batteryCapacityMah', format: (_listing, v) => (v ? `${v} mAh` : null), visibleWhen: hasValue('batteryCapacityMah') },
 { label: 'Camera', key: 'cameraMegapixels', format: (_listing, v) => (v ? `${v} MP` : null), visibleWhen: hasValue('cameraMegapixels') },
 { label: '5G', key: 'supports5g', format: (_listing, v) => formatBoolean(v), visibleWhen: hasValue('supports5g') },
 { label: 'Dual SIM', key: 'dualSim', format: (_listing, v) => formatBoolean(v), visibleWhen: hasValue('dualSim') },
 { label: 'NFC', key: 'hasNfc', format: (_listing, v) => formatBoolean(v), visibleWhen: hasValue('hasNfc') },
 { label: 'Connection Type', key: 'connectionType', enumKey: 'electronicConnectionTypes', visibleWhen: hasValue('connectionType') },
 { label: 'Wireless', key: 'wireless', format: (_listing, v) => formatBoolean(v), visibleWhen: hasValue('wireless') },
 { label: 'Noise Cancelling', key: 'noiseCancelling', format: (_listing, v) => formatBoolean(v), visibleWhen: hasValue('noiseCancelling') },
 { label: 'Microphone', key: 'hasMicrophone', format: (_listing, v) => formatBoolean(v), visibleWhen: hasValue('hasMicrophone') },
 { label: 'Battery Life', key: 'batteryLifeHours', format: (_listing, v) => (v ? `${v} hours` : null), visibleWhen: hasValue('batteryLifeHours') },
 ],
 },
 {
 id: 'condition',
 label: 'Durum',
 title: 'Durum',
 kind: 'attributes',
 definitionsQuery: (listing) => electronicAttributeQuery(listing?.electronicType?.id),
 },
 ],
 },
 formSchema: {
 initialData: {
 ...ElectronicCreateRequestDTO,
 _electronicTypeName: '', price: '', year: '', ram: '', storage: '',
 screenSize: '', batteryCapacityMah: '', cameraMegapixels: '', batteryLifeHours: '',
 },
 steps: [
 { id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: true },
 {
 id: 2, title: 'Electronic Details', description: 'Specify the electronic specifications', kind: 'details',
 sections: [
 {
 id: 'electronics-basic', title: 'Basic Information', description: 'Product type, brand, model and variant',
 fields: [
 { name: 'electronicTypeId', label: 'Type', type: 'enum', enumKey: 'electronicTypes', required: true, onChange: resetFromType },
 { name: 'electronicBrandId', label: 'Brand', type: 'enum', enumKey: 'electronicBrands', required: true, onChange: resetFromBrand },
 {
 name: 'electronicModelId', label: 'Model', type: 'searchable', enumKey: 'electronicModels', required: true,
 disabledWhen: (ctx) => !ctx.formData?.electronicTypeId || !ctx.formData?.electronicBrandId,
 getOptions: (ctx) => toModelOptions(filterElectronicModels(ctx.enums?.electronicModels, {
 typeId: ctx.formData?.electronicTypeId, brandId: ctx.formData?.electronicBrandId,
 })),
 onChange: onModelPicked,
 },
 {
 name: 'electronicVariantId', label: 'Variant / Sürüm', type: 'enum', enumKey: 'electronicVariants',
 description: 'Seçtiğin sürümün bilgileri katalogdan doldurulur',
 visibleWhen: (ctx) => variantsOf(ctx).length > 0,
 getOptions: (ctx) => variantsOf(ctx).map((v) => ({ id: normalizeId(v?.id), label: String(v?.name ?? '') })).filter((o) => o.id && o.label),
 },
 {
 name: 'colorName', label: 'Color', type: 'enum', enumKey: 'electronicModelColors', required: true,
 visibleWhen: (ctx) => colorsOf(ctx).length > 0,
 getOptions: (ctx) => colorsOf(ctx).map((c) => ({ id: String(c?.name ?? ''), label: String(c?.name ?? '') })).filter((o) => o.id),
 },
 {
 name: 'color', label: 'Color', type: 'enum', enumKey: 'colors', required: true,
 // A model with official colors picks the generic color through `colorName`.
 visibleWhen: (ctx) => colorsOf(ctx).length === 0,
 },
 { name: 'condition', label: 'Condition', type: 'enum', enumKey: 'electronicConditions', required: true },
 { name: 'year', label: 'Year', type: 'number', min: 1990, max: new Date().getFullYear() + 1, placeholder: 'YYYY' },
 { name: 'origin', label: 'Origin', type: 'text', placeholder: 'e.g. Apple Store TR', requiredWhen: (ctx) => Boolean(ctx.formData?.warrantyProof) },
 ],
 },
 {
 id: 'electronics-specs', title: 'Technical Specifications', description: 'Fields depend on the device type; catalog values are read-only',
 visibleWhen: (ctx) => Boolean(ctx.formData?.electronicTypeId),
 fields: [
 { name: 'storage', label: 'Storage (GB)', type: 'number', min: 1, placeholder: '128, 256, 512...', ...spec('storage') },
 { name: 'ram', label: 'RAM (GB)', type: 'number', min: 1, placeholder: '8, 16, 32...', ...spec('ram') },
 { name: 'storageType', label: 'Storage Type', type: 'enum', enumKey: 'storageTypes', ...spec('storageType') },
 { name: 'processor', label: 'Processor', type: 'enum', enumKey: 'processors', ...spec('processor') },
 { name: 'chipset', label: 'Chipset', type: 'text', placeholder: 'e.g. Apple A18 Pro, Snapdragon 8 Gen 3', ...spec('chipset') },
 { name: 'gpuModel', label: 'GPU Model', type: 'text', placeholder: 'e.g. RTX 4060', ...spec('gpuModel') },
 { name: 'screenSize', label: 'Screen Size (inch)', type: 'number', min: 1, placeholder: '13, 15, 55...', ...spec('screenSize') },
 { name: 'operatingSystem', label: 'Operating System', type: 'text', placeholder: 'iOS, Android, Windows 11...', ...spec('operatingSystem') },
 { name: 'batteryCapacityMah', label: 'Battery Capacity (mAh)', type: 'number', min: 1, ...spec('batteryCapacityMah') },
 { name: 'cameraMegapixels', label: 'Main Camera (MP)', type: 'number', min: 1, ...spec('cameraMegapixels') },
 {
 name: 'connectionType', label: 'Connection Type', type: 'enum', enumKey: 'electronicConnectionTypes', ...spec('connectionType'),
 onChange: ({ value, ctx }) => {
 ctx.setValue('connectionType', value);
 const v = String(value || '').toUpperCase();
 ctx.setValue('wireless', v === 'BLUETOOTH' || v === 'BOTH');
 },
 },
 { name: 'batteryLifeHours', label: 'Battery Life (hours)', type: 'number', min: 1, placeholder: 'e.g. 20', ...spec('batteryLifeHours') },
 { name: 'supports5g', label: '5G Support', type: 'toggle', ...specToggle('supports5g') },
 { name: 'dualSim', label: 'Dual SIM', type: 'toggle', ...specToggle('dualSim') },
 { name: 'hasNfc', label: 'NFC', type: 'toggle', ...specToggle('hasNfc') },
 { name: 'wireless', label: 'Wireless', type: 'toggle', ...specToggle('wireless') },
 { name: 'noiseCancelling', label: 'Active Noise Cancelling', type: 'toggle', ...specToggle('noiseCancelling') },
 { name: 'hasMicrophone', label: 'Microphone', type: 'toggle', ...specToggle('hasMicrophone') },
 ],
 },
 {
 id: 'electronics-condition',
 kind: 'attributes',
 title: 'Durum ve geçmiş',
 description: 'Pil sağlığı, değişen parçalar, kutu ve fatura; boş bıraktıkların ilanda görünmez',
 visibleWhen: (ctx) => Boolean(ctx.formData?.electronicTypeId),
 definitionsQuery: (ctx) => electronicAttributeQuery(ctx.formData?.electronicTypeId),
 },
 {
 id: 'electronics-extras', title: 'Additional Information', description: 'Warranty document status',
 fields: [{ name: 'warrantyProof', label: 'Warranty Document Available', description: 'Check if you have the original warranty documents', type: 'toggle' }],
 },
 ],
 },
 { id: 3, title: 'Location', description: 'Set the location of your item', kind: 'mediaLocation' },
 ],
 derivedFields: [{ sourceField: 'electronicTypeId', enumKey: 'electronicTypes', targetField: '_electronicTypeName', uppercase: true }],
 effects: [syncElectronicCatalog],
 getTitle: ({ isEdit }) => (isEdit ? 'Edit Electronics Listing' : 'Create Electronics Listing'),
 getSubtitle: ({ isEdit }) => (isEdit ? 'Update product details and location' : 'Enter product details and location'),
 normalizeInitialData: (data) => {
 if (!data) return null;
 return {
 ...data,
 electronicTypeId: data?.electronicTypeId || data?.electronicType?.id || '',
 electronicBrandId: data?.electronicBrandId || data?.electronicBrand?.id || '',
 electronicModelId: data?.electronicModelId || data?.model?.id || '',
 electronicVariantId: data?.electronicVariantId || '',
 colorName: data?.colorName || '',
 chipset: data?.chipset || '',
 attributes: data?.attributes && typeof data.attributes === 'object' ? data.attributes : {},
 };
 },
 },
 service: {
 create: (payload) => electronicService.createElectronicListing(payload),
 getById: (id) => electronicService.getElectronicById(id),
 update: (id, payload) => electronicService.updateElectronicListing(id, payload),
 },
 createFlow: {
 subtypeSelector: { enumKey: 'electronicTypes', queryParamKey: 'electronicTypeId', initialDataKey: 'electronicTypeId', title: 'Choose electronics type', description: 'Select a type to tailor the form fields.', paramKey: 'electronicTypeIds' },
 preFormSelectors: [
 {
 enumKey: 'electronicBrands', initialDataKey: 'electronicBrandId', title: 'Choose brand', description: 'Select a brand to narrow model options.', kind: 'grid', dependsOn: ['electronicTypeId'], paramKey: 'electronicBrandIds',
 getOptions: ({ enums, selection }) => {
 const allBrands = enums?.electronicBrands || [];
 const typeId = selection?.electronicTypeId;
 if (!typeId) return allBrands;
 const models = enums?.electronicModels || [];
 const brandIds = new Set(models.filter((m) => String(m?.typeId ?? m?.type_id ?? '') === String(typeId)).map((m) => m?.brandId ?? m?.brand_id).filter(Boolean).map((x) => String(x)));
 if (brandIds.size === 0) return allBrands;
 return allBrands.filter((b) => brandIds.has(String(b?.id ?? b?.value ?? '')));
 },
 },
 {
 enumKey: 'electronicModels', initialDataKey: 'electronicModelId', title: 'Choose model', description: 'Select a model to tailor the form fields.', kind: 'grid', dependsOn: ['electronicTypeId', 'electronicBrandId'], paramKey: 'electronicModelIds',
 getOptions: ({ enums, selection }) => {
 const brandId = selection?.electronicBrandId;
 const typeId = selection?.electronicTypeId;
 const allModels = enums?.electronicModels || [];
 return allModels
 .filter((m) => (!brandId || String(m?.brandId ?? m?.brand_id ?? '') === String(brandId)))
 .filter((m) => (!typeId || String(m?.typeId ?? m?.type_id ?? '') === String(typeId)))
 .map((m) => ({ id: String(m?.id ?? ''), label: String(m?.name ?? ''), releaseYear: m?.releaseYear, isLegacy: m?.isLegacy, aliases: m?.aliases || [] }))
 .filter((o) => o.id && o.label);
 },
 }
 // Color is picked in the form: models with official colors offer those instead of the generic list.
 ],
 },
 filterConfig: filterConfigs.ELECTRONICS,
 sortOptions: [
 { value: 'year', label: 'Year' }, { value: 'brand', label: 'Brand' },
 { value: 'type', label: 'Type' }, { value: 'price', label: 'Price' },
 { value: 'createdAt', label: 'Date Added' },
 ],
 defaultFilters: { minYear: 2000, maxYear: new Date().getFullYear() },
};

function formatBoolean(v) {
 if (v === true) return 'Yes';
 if (v === false) return 'No';
 return '-';
}

import { lazy } from 'react';
import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
const RealEstateCreateForm = lazy(() => import('../../realEstate/components/RealEstateCreateForm.jsx'));
import { realEstateService } from '../../realEstate/services/realEstateService.js';
import { RealEstateCreateRequestDTO } from '../../realEstate/realEstates.js';
import { filterConfigs } from '../filters/filterConfigs.js';

export const realEstateConfig = {
 label: 'Real Estate',
 icon: '🏠',
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
 { label: 'Bathroom Count', key: 'bathroomCount' },
 { label: 'Floor', key: 'floor' },
 { label: 'Building Age', key: 'buildingAge', format: (_listing, v) => (v ? `${v} years` : null) },
 { label: 'Furnished', key: 'furnished', format: (_listing, v) => (v ? 'Yes' : 'No') },
 ],
 },
 createComponent: RealEstateCreateForm,
 formSchema: {
 initialData: {
 ...RealEstateCreateRequestDTO,
 title: '', description: '', price: '', squareMeters: '', roomCount: '',
 bathroomCount: '', floor: '', buildingAge: '', zoningStatus: '', _realEstateTypeName: '',
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
 { name: 'heatingTypeId', label: 'Heating Type', type: 'enum', enumKey: 'heatingTypes', required: true, visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()) },
 { name: 'ownerTypeId', label: 'Owner Type', type: 'enum', enumKey: 'ownerTypes', required: true },
 ],
 },
 {
 id: 'realestate-physical', title: 'Physical Characteristics', description: 'Square meters, number of rooms and other details',
 fields: [
 { name: 'squareMeters', label: 'Square Meters', type: 'number', required: true, min: 0 },
 { name: 'roomCount', label: 'Room Count', type: 'number', required: true, min: 0, visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()) },
 { name: 'bathroomCount', label: 'Bathroom Count', type: 'number', min: 0, visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()) },
 { name: 'floor', label: 'Floor', type: 'number', min: 0, visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()) },
 { name: 'buildingAge', label: 'Building Age', type: 'number', min: 0, visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()) },
 { name: 'zoningStatus', label: 'Zoning Status', type: 'text', required: true, visibleWhen: (ctx) => ['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()) },
 ],
 },
 {
 id: 'realestate-extras', title: 'Additional Information', description: 'Furnished status',
 visibleWhen: (ctx) => !['LAND', 'FARM'].includes(String(ctx.formData?._realEstateTypeName || '').toUpperCase()),
 fields: [{ name: 'furnished', label: 'Furnished', type: 'toggle' }],
 },
 ],
 },
 { id: 3, title: 'Location', description: 'Set the location of your item', kind: 'mediaLocation' },
 ],
 derivedFields: [{ sourceField: 'realEstateTypeId', enumKey: 'realEstateTypes', targetField: '_realEstateTypeName', uppercase: true }],
 effects: [
 (ctx) => {
 const typeName = String(ctx.formData?._realEstateTypeName || '').toUpperCase();
 const isLand = typeName === 'LAND' || typeName === 'FARM';
 if (isLand) {
 if (ctx.formData?.heatingTypeId) ctx.setValue('heatingTypeId', '');
 if (String(ctx.formData?.roomCount ?? '') !== '0') ctx.setValue('roomCount', 0);
 if (ctx.formData?.bathroomCount) ctx.setValue('bathroomCount', '');
 if (ctx.formData?.floor) ctx.setValue('floor', '');
 if (ctx.formData?.buildingAge) ctx.setValue('buildingAge', '');
 if (Boolean(ctx.formData?.furnished)) ctx.setValue('furnished', false);
 } else {
 if (ctx.formData?.zoningStatus) ctx.setValue('zoningStatus', '');
 }
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
 getById: (id) => realEstateService.getRealEstateById(id),
 update: (id, payload) => realEstateService.updateRealEstateListing(id, payload),
 },
 createFlow: {
 subtypeSelector: {
 options: [
 { value: 'KONUT', label: 'Konut (Residential)', icon: '🏠', description: 'Daire, rezidans, müstakil ev, villa...' },
 { value: 'ISYERI', label: 'İşyeri (Commercial)', icon: '🏢', description: 'Ofis, dükkan, mağaza, depo, fabrika...' },
 { value: 'ARSA', label: 'Arsa (Land)', icon: '🌳', description: 'Konut imarlı arsa, tarla, zeytinlik, bağ...' },
 { value: 'DIGER', label: 'Diğer (Other)', icon: '📦', description: 'Otopark ve diğer tüm gayrimenkuller...' }
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

 const CATEGORY_MAP = {
 APARTMENT: 'KONUT',
 RESIDENCE: 'KONUT',
 STUDIO: 'KONUT',
 DUPLEX: 'KONUT',
 VILLA: 'KONUT',
 PREFABRICATED: 'KONUT',

 LAND: 'ARSA',
 COMMERCIAL_LAND: 'ARSA',
 FARM: 'ARSA',

 OFFICE: 'ISYERI',
 COMMERCIAL: 'ISYERI',
 WAREHOUSE: 'ISYERI',
 BUILDING: 'ISYERI',

 OTHER: 'DIGER'
 };

 return allTypes
 .filter((t) => {
 const nameKey = String(t?.key || t?.name || t?.value || '').toUpperCase();
 return CATEGORY_MAP[nameKey] === category || !CATEGORY_MAP[nameKey];
 })
 .map((t) => ({
 ...t,
 label: String(t?.label ?? t?.name ?? t?.key ?? ''),
 name: String(t?.label ?? t?.name ?? t?.key ?? '')
 }));
 }
 },
 { enumKey: 'realEstateAdTypes', initialDataKey: 'adTypeId', title: 'Choose ad type', description: 'Select an ad type to tailor the form fields.', kind: 'grid', dependsOn: ['realEstateTypeId'], paramKey: 'adTypeId' },
 {
 enumKey: 'heatingTypes', initialDataKey: 'heatingTypeId', title: 'Choose heating type', description: 'Select a heating type to tailor the form fields.', kind: 'grid', dependsOn: ['realEstateTypeId'], prefilter: false,
 visibleWhen: (ctx) => {
 const typeName = ctx.formData?.realEstateTypeId || ctx.selection?.realEstateTypeId
 ? String(ctx.getName('realEstateTypes', ctx.formData?.realEstateTypeId || ctx.selection?.realEstateTypeId) || '').toUpperCase()
 : '';
 return !['LAND', 'FARM', 'ARSA', 'TARLA'].some(x => typeName.includes(x));
 }
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
 compactBadges: (listing) => {
 const resolveLabel = (v) => {
 if (!v) return null;
 if (typeof v === 'string') return v;
 if (typeof v === 'object') return v.label || v.name || v.value || null;
 return null;
 };

 const typeLabel = resolveLabel(listing.realEstateType);
 const adTypeLabel = resolveLabel(listing.adType);
 const heatingLabel = resolveLabel(listing.heatingType);
 const ownerLabel = resolveLabel(listing.ownerType);
 const roomText = listing.roomConfigKey || (listing.roomCount ? `${listing.roomCount} Oda` : null);

 return [
 { label: typeLabel, icon: '🏠', show: !!typeLabel },
 { label: adTypeLabel, icon: '📋', show: !!adTypeLabel },
 { label: listing.squareMeters ? `${listing.squareMeters} m²` : null, icon: '📏', show: !!listing.squareMeters },
 { label: roomText, icon: '🚪', show: !!roomText },
 { label: heatingLabel, icon: '🔥', show: !!heatingLabel },
 { label: ownerLabel, icon: '👤', show: !!ownerLabel },
 ].filter(badge => badge.show);
 },
 defaultFilters: { minSquareMeters: 0, minRoomCount: 1 },
};


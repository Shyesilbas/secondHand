import { Dumbbell } from 'lucide-react';
import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
import { sportsService } from '../../sports/services/sportsService.js';
import { filterConfigs } from '../filters/filterConfigs.js';

// Equipment belongs to a discipline via disciplineId; OTHER_EQUIPMENT is the shared fallback.
const getEquipmentOptions = (enums, disciplineId) => {
 const allEquip = enums?.sportEquipmentTypes || [];
 if (!disciplineId) return allEquip;
 const matched = allEquip.filter((eq) => String(eq.disciplineId ?? '') === String(disciplineId));
 const list = matched.length > 0 ? matched : allEquip.filter((eq) => String(eq.name || '').toUpperCase() === 'OTHER_EQUIPMENT');
 return list.map((eq) => ({ ...eq, label: String(eq.label ?? eq.name ?? ''), name: String(eq.label ?? eq.name ?? '') }));
};

export const sportsConfig = {
 label: 'Sports',
 icon: Dumbbell,
 description: 'Sports equipment and accessories',

 detailsComponent: GenericListingDetails,
 detailsSchema: {
 title: 'Sports Information',
 fields: [
 { label: 'Discipline', key: 'discipline', enumKey: 'sportDisciplines' },
 { label: 'Equipment Type', key: 'equipmentType', enumKey: 'sportEquipmentTypes' },
 { label: 'Condition', key: 'condition', enumKey: 'sportConditions' },
 ],
 },
 formSchema: {
 initialData: {
 title: '', description: '', price: '', currency: 'TRY', quantity: 1,
 disciplineId: '', equipmentTypeId: '', conditionId: '',
 city: '', district: '', imageUrl: '',
 },
 steps: [
 { id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: true },
 {
 id: 2, title: 'Sports Details', description: 'Specify the sports equipment specifications', kind: 'details',
 sections: [
 {
 id: 'sports-details', title: 'Sports Equipment Details', description: 'Sport type, equipment type and condition',
 fields: [
 {
 name: 'disciplineId', label: 'Sport Type', type: 'enum', enumKey: 'sportDisciplines', required: true,
 onChange: ({ value, ctx }) => { ctx.setValue('disciplineId', value); ctx.setValue('equipmentTypeId', ''); }
 },
 {
 name: 'equipmentTypeId', label: 'Equipment Type', type: 'enum', enumKey: 'sportEquipmentTypes', required: true,
 disabledWhen: (ctx) => !ctx.formData?.disciplineId,
 getOptions: (ctx) => getEquipmentOptions(ctx.enums, ctx.formData?.disciplineId)
 },
 { name: 'conditionId', label: 'Condition', type: 'enum', enumKey: 'sportConditions', required: true },
 ],
 },
 ],
 },
 { id: 3, title: 'Location', description: 'Set the location of your item', kind: 'mediaLocation' },
 ],
 getTitle: ({ isEdit }) => (isEdit ? 'Edit Sports Listing' : 'Create Sports Listing'),
 getSubtitle: ({ isEdit }) => (isEdit ? 'Update your sports listing details' : 'Create your sports listing step by step'),
 normalizeInitialData: (data) => {
 if (!data) return null;
 return { ...data, disciplineId: data?.disciplineId || data?.discipline?.id || '', equipmentTypeId: data?.equipmentTypeId || data?.equipmentType?.id || '', conditionId: data?.conditionId || data?.condition?.id || '' };
 },
 },
 service: {
 create: (payload) => sportsService.createSportsListing(payload),
 getById: (id) => sportsService.getSportsDetails(id),
 update: (id, payload) => sportsService.updateSportsListing(id, payload),
 },
 createFlow: {
 subtypeSelector: { enumKey: 'sportDisciplines', queryParamKey: 'disciplineId', initialDataKey: 'disciplineId', title: 'Choose sport discipline', description: 'Select a discipline to tailor the form fields.', paramKey: 'disciplineIds' },
 preFormSelectors: [
 {
 enumKey: 'sportEquipmentTypes', initialDataKey: 'equipmentTypeId', title: 'Choose equipment type', description: 'Select an equipment type to tailor the form fields.', kind: 'grid', dependsOn: ['disciplineId'], paramKey: 'equipmentTypeIds',
 getOptions: ({ enums, selection }) => getEquipmentOptions(enums, selection?.disciplineId)
 },
 { enumKey: 'sportConditions', initialDataKey: 'conditionId', title: 'Choose condition', description: 'Select a condition to tailor the form fields.', kind: 'grid', dependsOn: ['disciplineId'], paramKey: 'conditionIds' },
 ],
 },
 filterConfig: filterConfigs.SPORTS,
 sortOptions: [
 { value: 'discipline', label: 'Discipline' }, { value: 'equipmentType', label: 'Equipment Type' },
 { value: 'condition', label: 'Condition' }, { value: 'price', label: 'Price' },
 { value: 'createdAt', label: 'Date Added' },
 ],
 defaultFilters: {},
};


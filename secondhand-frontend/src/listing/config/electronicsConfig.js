import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
import ElectronicCreateForm from '../../electronics/electronics/components/ElectronicCreateForm.jsx';
import {electronicService} from '../../electronics/electronics/services/electronicService.js';
import {ElectronicCreateRequestDTO} from '../../electronics/electronics.js';
import {filterConfigs} from '../components/filters/filterConfigs.js';

export const electronicsConfig = {
  label: 'Electronics',
  icon: '📱',
  description: 'Mobile phones, laptops, TVs and electronic devices',

  detailsComponent: GenericListingDetails,
  detailsSchema: {
    title: 'Electronics Information',
    fields: [
      { label: 'Type', key: 'electronicType', enumKey: 'electronicTypes' },
      { label: 'Brand', key: 'electronicBrand', enumKey: 'electronicBrands' },
      { label: 'Model', key: 'model' },
      { label: 'Origin', key: 'origin' },
      { label: 'Year', key: 'year' },
      { label: 'Color', key: 'color', enumKey: 'colors' },
      { label: 'Warranty Proof', key: 'warrantyProof', format: (_listing, v) => (v ? 'Yes' : 'No') },
      { label: 'RAM', key: 'ram', format: (_listing, v) => (v ? `${v} GB` : null) },
      { label: 'Storage', key: 'storage', format: (_listing, v) => (v ? `${v} GB` : null) },
      { label: 'Screen Size', key: 'screenSize', format: (_listing, v) => (v ? `${v}"` : null) },
      { label: 'Processor', key: 'processor', enumKey: 'processors' },
    ],
  },
  createComponent: ElectronicCreateForm,
  formSchema: {
    initialData: {
      ...ElectronicCreateRequestDTO,
      _electronicTypeName: '', price: '', year: '', ram: '', storage: '',
      screenSize: '', batteryHealthPercent: '', batteryCapacityMah: '',
      cameraMegapixels: '', batteryLifeHours: '',
    },
    steps: [
      { id: 1, title: 'Basic Information', description: 'Set the title, description and price of your listing', kind: 'basics', showQuantity: true },
      {
        id: 2, title: 'Electronic Details', description: 'Specify the electronic specifications', kind: 'details',
        sections: [
          {
            id: 'electronics-basic', title: 'Basic Information', description: 'Product type, brand and model information',
            fields: [
              { name: 'electronicTypeId', label: 'Type', type: 'enum', enumKey: 'electronicTypes', required: true, onChange: ({ value, ctx }) => { ctx.setValue('electronicTypeId', value); ctx.setValue('electronicModelId', ''); } },
              { name: 'electronicBrandId', label: 'Brand', type: 'enum', enumKey: 'electronicBrands', required: true, onChange: ({ value, ctx }) => { ctx.setValue('electronicBrandId', value); ctx.setValue('electronicModelId', ''); } },
              {
                name: 'electronicModelId', label: 'Model', type: 'searchable', required: true,
                disabledWhen: (ctx) => !ctx.formData?.electronicTypeId || !ctx.formData?.electronicBrandId,
                getOptions: (ctx) => {
                  const brandId = ctx.formData?.electronicBrandId;
                  const typeId = ctx.formData?.electronicTypeId;
                  const allModels = ctx.enums?.electronicModels || [];
                  return allModels
                    .filter((m) => (!brandId || String(m?.brandId ?? m?.brand_id ?? '') === String(brandId)))
                    .filter((m) => (!typeId || String(m?.typeId ?? m?.type_id ?? '') === String(typeId)))
                    .map((m) => ({ id: String(m?.id ?? ''), label: String(m?.name ?? '') }))
                    .filter((o) => o.id && o.label);
                },
              },
              { name: 'origin', label: 'Origin', type: 'text', placeholder: 'e.g. Apple Store TR' },
              { name: 'year', label: 'Year', type: 'number', required: true, min: 1990, max: new Date().getFullYear() + 1, placeholder: 'YYYY' },
              { name: 'color', label: 'Color', type: 'enum', enumKey: 'colors', required: true },
            ],
          },
          {
            id: 'electronics-laptop', title: 'Technical Specifications', description: 'RAM, storage and screen information',
            visibleWhen: (ctx) => String(ctx.formData?._electronicTypeName || '').toUpperCase() === 'LAPTOP',
            fields: [
              { name: 'ram', label: 'RAM (GB)', type: 'number', required: true, min: 1, placeholder: '8, 16, 32...' },
              { name: 'storage', label: 'Storage (GB)', type: 'number', required: true, min: 1, placeholder: '256, 512, 1024...' },
              { name: 'storageType', label: 'Storage Type', type: 'enum', enumKey: 'storageTypes', required: true },
              { name: 'screenSize', label: 'Screen Size (inch)', type: 'number', required: true, min: 1, step: 0.1, placeholder: '13.3, 15.6...' },
              { name: 'processor', label: 'Processor', type: 'enum', enumKey: 'processors' },
              { name: 'gpuModel', label: 'GPU Model', type: 'text', placeholder: 'e.g. RTX 3060, M2 10-core' },
              { name: 'operatingSystem', label: 'Operating System', type: 'text', placeholder: 'Windows 11, macOS, Linux...' },
              { name: 'batteryHealthPercent', label: 'Battery Health (%)', type: 'number', min: 1, max: 100, placeholder: 'e.g. 90' },
            ],
          },
          {
            id: 'electronics-mobile', title: 'Phone Specifications', description: 'Battery, screen and connectivity features',
            visibleWhen: (ctx) => String(ctx.formData?._electronicTypeName || '').toUpperCase() === 'MOBILE_PHONE',
            fields: [
              { name: 'storage', label: 'Storage (GB)', type: 'number', required: true, min: 1, placeholder: '128, 256...' },
              { name: 'screenSize', label: 'Screen Size (inch)', type: 'number', required: true, min: 1, step: 0.1, placeholder: '6.1, 6.7...' },
              { name: 'batteryCapacityMah', label: 'Battery (mAh)', type: 'number', required: true, min: 1, placeholder: '4000' },
              { name: 'cameraMegapixels', label: 'Camera (MP)', type: 'number', min: 1, placeholder: '12, 48...' },
              { name: 'supports5g', label: '5G Supported', type: 'toggle' },
              { name: 'dualSim', label: 'Dual SIM', type: 'toggle' },
              { name: 'hasNfc', label: 'NFC', type: 'toggle' },
            ],
          },
          {
            id: 'electronics-headphones', title: 'Headphone Specifications', description: 'Connection type and features',
            visibleWhen: (ctx) => String(ctx.formData?._electronicTypeName || '').toUpperCase() === 'HEADPHONES',
            fields: [
              {
                name: 'connectionType', label: 'Connection Type', type: 'enum', enumKey: 'electronicConnectionTypes', required: true,
                onChange: ({ value, ctx }) => {
                  ctx.setValue('connectionType', value);
                  const v = String(value || '').toUpperCase();
                  const wireless = v === 'BLUETOOTH' || v === 'BOTH';
                  ctx.setValue('wireless', wireless);
                  if (!wireless) ctx.setValue('batteryLifeHours', '');
                },
              },
              { name: 'noiseCancelling', label: 'Active Noise Cancelling', type: 'toggle' },
              { name: 'hasMicrophone', label: 'Microphone', type: 'toggle' },
              { name: 'batteryLifeHours', label: 'Battery Life (hours)', type: 'number', required: true, min: 1, placeholder: 'e.g. 20', visibleWhen: (ctx) => Boolean(ctx.formData?.wireless) },
            ],
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
    getTitle: ({ isEdit }) => (isEdit ? 'Edit Electronics Listing' : 'Create Electronics Listing'),
    getSubtitle: ({ isEdit }) => (isEdit ? 'Update product details and location' : 'Enter product details and location'),
    normalizeInitialData: (data) => {
      if (!data) return null;
      return { ...data, electronicTypeId: data?.electronicTypeId || data?.electronicType?.id || '', electronicBrandId: data?.electronicBrandId || data?.electronicBrand?.id || '', electronicModelId: data?.electronicModelId || data?.model?.id || '' };
    },
  },
  service: {
    getById: (id) => electronicService.getElectronicById(id),
    update: (id, payload) => electronicService.updateElectronicListing(id, payload),
  },
  createFlow: {
    subtypeSelector: { enumKey: 'electronicTypes', queryParamKey: 'electronicTypeId', initialDataKey: 'electronicTypeId', title: 'Choose electronics type', description: 'Select a type to tailor the form fields.', paramKey: 'electronicTypeIds' },
    preFormSelectors: [
      { enumKey: 'electronicBrands', initialDataKey: 'electronicBrandId', title: 'Choose brand', description: 'Select a brand to narrow model options.', kind: 'searchable', paramKey: 'electronicBrandIds' },
      {
        enumKey: 'electronicModels', initialDataKey: 'electronicModelId', title: 'Choose model', description: 'Select a model to tailor the form fields.', kind: 'searchable', dependsOn: ['electronicTypeId', 'electronicBrandId'], paramKey: 'electronicModelIds',
        getOptions: ({ enums, selection }) => {
          const brandId = selection?.electronicBrandId;
          const typeId = selection?.electronicTypeId;
          const allModels = enums?.electronicModels || [];
          return allModels
            .filter((m) => (!brandId || String(m?.brandId ?? m?.brand_id ?? '') === String(brandId)))
            .filter((m) => (!typeId || String(m?.typeId ?? m?.type_id ?? '') === String(typeId)))
            .map((m) => ({ id: String(m?.id ?? ''), label: String(m?.name ?? '') }))
            .filter((o) => o.id && o.label);
        },
      },
    ],
  },
  filterConfig: filterConfigs.ELECTRONICS,
  sortOptions: [
    { value: 'year', label: 'Year' }, { value: 'brand', label: 'Brand' },
    { value: 'type', label: 'Type' }, { value: 'price', label: 'Price' },
    { value: 'createdAt', label: 'Date Added' },
  ],
  compactBadges: (listing) => [
    { label: listing.electronicType?.label || listing.electronicType?.name || listing.electronicType, icon: '📱', show: !!listing.electronicType },
    { label: listing.electronicBrand?.label || listing.electronicBrand?.name || listing.electronicBrand, icon: '🏷️', show: !!listing.electronicBrand },
    { label: listing.year, icon: '📅', show: !!listing.year },
    { label: listing.color, icon: '🎨', show: !!listing.color },
  ].filter(badge => badge.show),
  defaultFilters: { minYear: 2000, maxYear: new Date().getFullYear() },
};


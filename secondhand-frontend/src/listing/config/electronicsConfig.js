import { lazy } from 'react';
import GenericListingDetails from '../components/details/GenericListingDetails.jsx';
const ElectronicCreateForm = lazy(() => import('../../electronics/components/ElectronicCreateForm.jsx'));
import {electronicService} from '../../electronics/services/electronicService.js';
import {ElectronicCreateRequestDTO} from '../../electronics/electronics.js';
import {filterConfigs} from '../filters/filterConfigs.js';

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
      { label: 'Condition', key: 'condition', enumKey: 'electronicConditions' },
      { label: 'Warranty Proof', key: 'warrantyProof', format: (_listing, v) => formatBoolean(v) },
      { label: 'Battery Replaced', key: 'batteryReplaced', format: (_listing, v) => formatBoolean(v), visibleWhen: (l) => getElectronicTypeName(l) === 'MOBILE_PHONE' },
      { label: 'Battery Original', key: 'batteryOriginal', format: (_listing, v) => formatBoolean(v), visibleWhen: (l) => getElectronicTypeName(l) === 'MOBILE_PHONE' },
      { label: 'Screen Replaced', key: 'screenReplaced', format: (_listing, v) => formatBoolean(v), visibleWhen: (l) => getElectronicTypeName(l) === 'MOBILE_PHONE' },
      { label: 'Body Replaced', key: 'bodyReplaced', format: (_listing, v) => formatBoolean(v), visibleWhen: (l) => getElectronicTypeName(l) === 'MOBILE_PHONE' },
      { label: 'FaceID Working', key: 'faceIdWorking', format: (_listing, v) => formatBoolean(v), visibleWhen: (l) => getElectronicTypeName(l) === 'MOBILE_PHONE' },
      { label: 'TouchID Working', key: 'touchIdWorking', format: (_listing, v) => formatBoolean(v), visibleWhen: (l) => getElectronicTypeName(l) === 'MOBILE_PHONE' },
      { label: 'IMEI Registered', key: 'imeiRegistered', format: (_listing, v) => formatBoolean(v), visibleWhen: (l) => getElectronicTypeName(l) === 'MOBILE_PHONE' },
      { label: 'RAM', key: 'ram', format: (_listing, v) => (v ? `${v} GB` : null), visibleWhen: (l) => { const t = getElectronicTypeName(l); return t === 'LAPTOP' || t === 'DESKTOP'; } },
      { label: 'Storage Type', key: 'storageType', enumKey: 'storageTypes', visibleWhen: (l) => { const t = getElectronicTypeName(l); return t === 'LAPTOP' || t === 'DESKTOP'; } },
      { label: 'Processor', key: 'processor', enumKey: 'processors', visibleWhen: (l) => { const t = getElectronicTypeName(l); return t === 'LAPTOP' || t === 'DESKTOP'; } },
      { label: 'GPU Model', key: 'gpuModel', visibleWhen: (l) => { const t = getElectronicTypeName(l); return t === 'LAPTOP' || t === 'DESKTOP'; } },
      { label: 'Operating System', key: 'operatingSystem', visibleWhen: (l) => { const t = getElectronicTypeName(l); return t === 'LAPTOP' || t === 'DESKTOP'; } },
      { label: 'Storage', key: 'storage', format: (_listing, v) => (v ? `${v} GB` : null), visibleWhen: (l) => { const t = getElectronicTypeName(l); return t === 'MOBILE_PHONE' || t === 'LAPTOP' || t === 'DESKTOP' || t === 'TABLET'; } },
      { label: 'Screen Size', key: 'screenSize', format: (_listing, v) => (v ? `${v}"` : null), visibleWhen: (l) => { const t = getElectronicTypeName(l); return t === 'LAPTOP' || t === 'TABLET' || t === 'TV' || t === 'MONITOR'; } },
      { label: 'Battery Health (%)', key: 'batteryHealthPercent', visibleWhen: (l) => { const t = getElectronicTypeName(l); return t === 'MOBILE_PHONE' || t === 'LAPTOP' || t === 'TABLET'; } },
      { label: 'Connection Type', key: 'connectionType', enumKey: 'electronicConnectionTypes', visibleWhen: (l) => getElectronicTypeName(l) === 'HEADPHONES' },
      { label: 'Wireless', key: 'wireless', format: (_listing, v) => formatBoolean(v), visibleWhen: (l) => getElectronicTypeName(l) === 'HEADPHONES' },
      { label: 'Noise Cancelling', key: 'noiseCancelling', format: (_listing, v) => formatBoolean(v), visibleWhen: (l) => getElectronicTypeName(l) === 'HEADPHONES' },
      { label: 'Microphone', key: 'hasMicrophone', format: (_listing, v) => formatBoolean(v), visibleWhen: (l) => getElectronicTypeName(l) === 'HEADPHONES' },
      { label: 'Battery Life (hours)', key: 'batteryLifeHours', format: (_listing, v) => (v ? `${v} hours` : null), visibleWhen: (l) => getElectronicTypeName(l) === 'HEADPHONES' },
      { label: 'Has Box', key: 'hasBox', format: (_listing, v) => formatBoolean(v) },
      { label: 'Has Invoice', key: 'hasInvoice', format: (_listing, v) => formatBoolean(v) },
      { label: 'Warranty End Date', key: 'warrantyEndDate' },
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
                name: 'electronicModelId', label: 'Model', type: 'searchable', enumKey: 'electronicModels', required: true,
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
              { name: 'year', label: 'Year', type: 'number', requiredWhen: (ctx) => { const t = String(ctx.formData?._electronicTypeName || '').toUpperCase(); return t !== 'LAPTOP' && t !== 'DESKTOP'; }, min: 1990, max: new Date().getFullYear() + 1, placeholder: 'YYYY' },
              { name: 'color', label: 'Color', type: 'enum', enumKey: 'colors', required: true },
              { name: 'condition', label: 'Condition', type: 'enum', enumKey: 'electronicConditions', required: true },
            ],
          },
          {
            id: 'electronics-laptop', title: 'Technical Specifications', description: 'RAM, storage and processor information',
            visibleWhen: (ctx) => { const t = String(ctx.formData?._electronicTypeName || '').toUpperCase(); return t === 'LAPTOP' || t === 'DESKTOP'; },
            fields: [
              { name: 'ram', label: 'RAM (GB)', type: 'number', required: true, min: 1, placeholder: '8, 16, 32...' },
              { name: 'storage', label: 'Storage (GB)', type: 'number', required: true, min: 1, placeholder: '256, 512, 1024...' },
              { name: 'storageType', label: 'Storage Type', type: 'enum', enumKey: 'storageTypes', required: true },
              { name: 'screenSize', label: 'Screen Size (inch)', type: 'number', required: false, min: 1, step: 0.1, placeholder: '13.3, 15.6...', visibleWhen: (ctx) => String(ctx.formData?._electronicTypeName || '').toUpperCase() === 'LAPTOP' },
              { name: 'processor', label: 'Processor', type: 'enum', enumKey: 'processors', required: true },
              { name: 'gpuModel', label: 'GPU Model', type: 'text', placeholder: 'e.g. RTX 3060, M2 10-core' },
              { name: 'operatingSystem', label: 'Operating System', type: 'text', placeholder: 'Windows 11, macOS, Linux...' },
              { name: 'batteryHealthPercent', label: 'Battery Health (%)', type: 'number', min: 1, max: 100, placeholder: 'e.g. 90', visibleWhen: (ctx) => String(ctx.formData?._electronicTypeName || '').toUpperCase() === 'LAPTOP' },
            ],
          },
          {
            id: 'electronics-mobile', title: 'Phone Specifications', description: 'Battery, screen and condition features',
            visibleWhen: (ctx) => String(ctx.formData?._electronicTypeName || '').toUpperCase() === 'MOBILE_PHONE',
            fields: [
              { name: 'storage', label: 'Storage (GB)', type: 'number', required: true, min: 1, placeholder: '128, 256...' },
              { name: 'batteryHealthPercent', label: 'Battery Health (%)', type: 'number', min: 1, max: 100, placeholder: 'e.g. 90' },
              { name: 'batteryReplaced', label: 'Battery Replaced', type: 'toggle' },
              { name: 'batteryOriginal', label: 'Original Battery', type: 'toggle' },
              { name: 'screenReplaced', label: 'Screen Replaced', type: 'toggle' },
              { name: 'bodyReplaced', label: 'Case/Body Replaced', type: 'toggle' },
              { name: 'faceIdWorking', label: 'FaceID Working', type: 'toggle' },
              { name: 'touchIdWorking', label: 'TouchID Working', type: 'toggle' },
              { name: 'hasBox', label: 'Has Original Box', type: 'toggle' },
              { name: 'hasInvoice', label: 'Has Invoice', type: 'toggle' },
              { name: 'imeiRegistered', label: 'IMEI TR Registered', type: 'toggle' },
              { name: 'warrantyEndDate', label: 'Warranty End Date', type: 'date' },
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
    effects: [
      (ctx) => {
        const mId = ctx.formData?.electronicModelId;
        if (!mId) return;
        const m = (ctx.enums?.electronicModels || []).find((x) => String(x?.id ?? '') === String(mId));
        if (!m) return;

        const modelName = String(m?.name || '');
        if (modelName.includes(' > ')) {
          const parts = modelName.split(' > ').map(p => p.trim());
          // parts[0] is e.g. "MacBook Pro 16 (M3 Max)" or "iPhone 16 Pro Max"
          // parts[1] is e.g. "36GB/1TB" or "512GB"

          const specPart = parts[parts.length - 1];
          if (specPart) {
            const specLower = specPart.toLowerCase();

            // Check for format: 16GB/512GB or 8GB/256GB
            if (specLower.includes('/')) {
              const specSub = specLower.split('/');
              const ramStr = specSub[0].replace('gb', '').trim();
              let storageStr = specSub[1].replace('gb', '').replace('tb', '').trim();
              const isTB = specSub[1].includes('tb');

              const parsedRam = parseInt(ramStr, 10);
              let parsedStorage = parseInt(storageStr, 10);
              if (isTB) parsedStorage = parsedStorage * 1024;

              if (!isNaN(parsedRam) && ctx.formData?.ram !== parsedRam) {
                ctx.setValue('ram', parsedRam);
              }
              if (!isNaN(parsedStorage) && ctx.formData?.storage !== parsedStorage) {
                ctx.setValue('storage', parsedStorage);
              }
            }
            // Check for format: 128GB or 512GB
            else if (specLower.endsWith('gb')) {
              const storageVal = parseInt(specLower.replace('gb', '').trim(), 10);
              if (!isNaN(storageVal) && ctx.formData?.storage !== storageVal) {
                ctx.setValue('storage', storageVal);
              }
            }
            // Check for format: 1TB
            else if (specLower.endsWith('tb')) {
              const storageVal = parseInt(specLower.replace('tb', '').trim(), 10) * 1024;
              if (!isNaN(storageVal) && ctx.formData?.storage !== storageVal) {
                ctx.setValue('storage', storageVal);
              }
            }
          }

          // Check if it's a laptop and auto-derive gpuModel if contained
          const laptopTypeName = String(ctx.formData?._electronicTypeName || '').toUpperCase();
          if (laptopTypeName === 'LAPTOP' && parts[0]) {
            const seriesLower = parts[0].toLowerCase();
            let matchedGpu = null;
            if (seriesLower.includes('rtx 4080')) matchedGpu = 'NVIDIA GeForce RTX 4080';
            else if (seriesLower.includes('rtx 4070')) matchedGpu = 'NVIDIA GeForce RTX 4070';
            else if (seriesLower.includes('rtx 4060')) matchedGpu = 'NVIDIA GeForce RTX 4060';
            else if (seriesLower.includes('rtx 4050')) matchedGpu = 'NVIDIA GeForce RTX 4050';
            else if (seriesLower.includes('rtx 3050')) matchedGpu = 'NVIDIA GeForce RTX 3050';

            if (matchedGpu && ctx.formData?.gpuModel !== matchedGpu) {
              ctx.setValue('gpuModel', matchedGpu);
            }
          }
        }
      }
    ],
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
            .map((m) => ({ id: String(m?.id ?? ''), label: String(m?.name ?? '') }))
            .filter((o) => o.id && o.label);
        },
      },
      {
        enumKey: 'colors', initialDataKey: 'color', title: 'Choose color', description: 'Select color of your electronic device.', kind: 'grid', dependsOn: ['electronicModelId'], paramKey: 'color', prefilter: false
      },
    ],
  },
  filterConfig: filterConfigs.ELECTRONICS,
  sortOptions: [
    { value: 'year', label: 'Year' }, { value: 'brand', label: 'Brand' },
    { value: 'type', label: 'Type' }, { value: 'price', label: 'Price' },
    { value: 'createdAt', label: 'Date Added' },
  ],
  compactBadges: (listing) => {
    const parts = [];
    
    // Core specs
    if (listing.processor) {
      parts.push(listing.processor);
    } else if (listing.electronicModel?.label || listing.electronicModel?.name || listing.model) {
      parts.push(listing.electronicModel?.label || listing.electronicModel?.name || listing.model);
    } else if (listing.electronicBrand?.label || listing.electronicBrand?.name || listing.electronicBrand) {
      parts.push(listing.electronicBrand?.label || listing.electronicBrand?.name || listing.electronicBrand);
    }

    if (listing.storage) {
      parts.push(`${listing.storage} GB${listing.storageType ? ' ' + listing.storageType : ''}`);
    }
    
    if (listing.ram) {
      parts.push(`${listing.ram} GB RAM`);
    }
    
    if (listing.color) parts.push(listing.color);
    if (listing.year) parts.push(listing.year);

    if (parts.length > 0) {
      return [{ label: parts.join(' • '), show: true }];
    }
    
    return [];
  },
  defaultFilters: { minYear: 2000, maxYear: new Date().getFullYear() },
};

function formatBoolean(v) {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return '-';
}

export const getElectronicTypeName = (listing) => {
  const typeObj = listing?.electronicType;
  let typeName = '';
  if (typeObj) {
    if (typeof typeObj === 'object') {
      typeName = typeObj.name || typeObj.label || typeObj.value || '';
    } else if (typeof typeObj === 'string') {
      typeName = typeObj;
    }
  }
  if (!typeName) {
    typeName = listing?.electronicTypeName || '';
  }
  return String(typeName).trim().toUpperCase();
};
